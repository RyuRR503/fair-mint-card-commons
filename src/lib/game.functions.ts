import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { cityByKey, type Spawn } from "./spawns";
import { TOKEN_BY_SYMBOL, TOKENS, VAULT_ADDRESS, CHAIN, DISTRICT_BY_SYMBOL, type Rarity } from "./tokens";
import { catchRadius, haversine, MAX_ACCURACY_M } from "./geo";
import { allocate, claimShares, payableClaims } from "./allocation";
import { scoreBehavior } from "./behavior";
import { EIP712_NAME, EIP712_VERSION, VOUCHER_TYPES, VOUCHER_PRIMARY_TYPE } from "./vault";
import { receiptMatchesClaim, type ClaimReceipt } from "./claim-receipt";
import { dbSnapshotStore, readSnapshot } from "@/lib/display-snapshot";
import { createBoundedRead } from "./bounded-read";
import { hourlyCapCheck } from "./hourly-cap";



type SpawnRow = {
  id: string;
  symbol: string;
  amount: number;
  rarity: string;
  claimed_by: string | null;
  respawn_at: string | null;
  cooldown_min: number | null;
  places: { name: string; city: string; country: string; lat: number; lng: number };
};

function toSpawn(row: SpawnRow): Spawn {
  const city = cityByKey(row.places.city);
  return {
    id: row.id,
    symbol: row.symbol,
    // The token's fragment is the one payout rule; the stored per-pin number is
    // only a fallback for a symbol we no longer carry.
    amount: TOKEN_BY_SYMBOL[row.symbol]?.fragment ?? Number(row.amount),
    rarity: row.rarity as Rarity,
    city: row.places.city,
    cityName: city?.name ?? row.places.city,
    cityNameZh: city?.nameZh ?? row.places.city,
    country: row.places.country,
    place: row.places.name,
    lat: row.places.lat,
    lng: row.places.lng,
  };
}

const SPAWN_SELECT =
  "id, symbol, amount, rarity, claimed_by, respawn_at, cooldown_min, places!inner(name, city, country, lat, lng)";

/** Live signals: never caught, or their cooldown already ran out. */
async function openSpawns(signal?: AbortSignal): Promise<Spawn[]> {
  const supabase = await admin();
  let query = supabase
    .from("spawns")
    .select(SPAWN_SELECT)
    .or(`respawn_at.is.null,respawn_at.lte.${new Date().toISOString()}`)
    .limit(4000);
  if (signal) query = query.abortSignal(signal);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data as unknown as SpawnRow[]).map(toSpawn);
}


/* ------------------------------------------------------------------ rules */

export const RULES = {
  maxAccuracyM: MAX_ACCURACY_M,
  baseRadiusM: 40,
  maxRadiusM: 73,
  perWalletPerDay: 6,
  perDropPerDay: 24,
  walletCooldownMin: 120,
  dropCooldownMin: 10,
  /** Whole-site payout ceiling per rolling hour, priced in USD. */
  hourlyUsdCap: 500,
  voucherTtlMin: 15,
  minFixSamples: 4,
  minFixSeconds: 20,
  walkSpeedMs: 9,
  flightThresholdKm: 300,
  airportMinutes: 90,
  ipRadiusKm: 500,
  clockSkewHours: 3,
} as const;

const shortAddress = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

const ZERO = "0x0000000000000000000000000000000000000000";

/** Deployed vault, or the placeholder while the contract is not live yet. */
function vaultAddress() {
  const v = process.env["VAULT_ADDRESS"];
  return v && v !== ZERO ? v : VAULT_ADDRESS;
}

/**
 * Token address for a symbol. An env override (TOKEN_AAPLON=0x…) wins, so the
 * nine contract addresses can be filled in without a code change.
 */
function tokenAddressFor(symbol: string, fallback: string) {
  const v = process.env[`TOKEN_${symbol}`];
  return v && v !== ZERO ? v : fallback;
}

function signerKey(): string | undefined {
  return process.env["GAME_SIGNER_PRIVATE_KEY"] || process.env["CLAIM_SIGNER_KEY"] || undefined;
}

function liveMode() {
  return !!signerKey() && vaultAddress() !== ZERO;
}

/** Same check the vault runs on-chain: msg.sender must hold an Agent ID. */
async function hasAgentId(wallet: string): Promise<boolean | null> {
  try {
    const res = await fetch(CHAIN.rpc, {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: AbortSignal.timeout(6000),
      body: JSON.stringify({
        jsonrpc: "2.0", id: 1, method: "eth_call",
        params: [{ to: vaultAddress(), data: `0x4eab3ef2000000000000000000000000${wallet.slice(2).toLowerCase()}` }, "latest"],
      }),
    });
    const json = (await res.json()) as { result?: string };
    if (!json.result || json.result === "0x") return null;
    return BigInt(json.result) !== 0n;
  } catch {
    return null;
  }
}


/** Latest USD price from a Chainlink feed on BSC (8 decimals), or null. */
async function feedPriceUsd(feed: string): Promise<number | null> {
  try {
    const res = await fetch(CHAIN.rpc, {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: AbortSignal.timeout(6000),
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_call",
        params: [{ to: feed, data: "0xfeaf968c" }, "latest"],
      }),
    });
    const json = (await res.json()) as { result?: string };
    if (!json.result || json.result === "0x") return null;
    // latestRoundData(): (roundId, answer, startedAt, updatedAt, answeredInRound)
    const answer = BigInt("0x" + json.result.slice(66, 130));
    if (answer <= 0n) return null;
    return Number(answer) / 1e8;
  } catch {
    return null;
  }
}


/* ------------------------------------------------------------ live book */

/**
 * On-chain PancakeSwap V2 quote in USDT for one whole token, for stocks without
 * a Chainlink feed. Takes the higher of the direct and via-WBNB routes, so a
 * thin pool can only make claims smaller, never larger.
 */
async function poolPriceUsd(token: string, decimals: number): Promise<number | null> {
  const { encodeFunctionData, decodeFunctionResult, parseAbi } = await import("viem");
  const abi = parseAbi(["function getAmountsOut(uint256,address[]) view returns (uint256[])"]);
  const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
  const USDT = "0x55d398326f99059fF775485246999027B3197955";
  const unit = 10n ** BigInt(decimals) / 100n; // quote 0.01 token to limit pool impact
  const quotes = await Promise.all(
    [[token, USDT], [token, WBNB, USDT]].map(async (path) => {
      try {
        const data = encodeFunctionData({ abi, functionName: "getAmountsOut", args: [unit, path as `0x${string}`[]] });
        const res = await fetch(CHAIN.rpc, {
          method: "POST",
          headers: { "content-type": "application/json" },
          signal: AbortSignal.timeout(6000),
          body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_call", params: [{ to: "0x10ED43C718714eb63d5aA57B78B54704E256024E", data }, "latest"] }),
        });
        const json = (await res.json()) as { result?: `0x${string}` };
        if (!json.result || json.result === "0x") return 0;
        const out = decodeFunctionResult({ abi, functionName: "getAmountsOut", data: json.result }) as readonly bigint[];
        return (Number(out[out.length - 1]) / 1e18) * 100;
      } catch {
        return 0;
      }
    }),
  );
  const best = Math.max(...quotes);
  return best > 0 ? best : null;
}

type Book = {
  shares: Record<string, number>;
  budget: Record<string, number>;
  inventory: Record<string, number | null>;
  price: Record<string, number | null>;
  live: Set<string>;
  day: string;
  at: number;
};
let bookCache: Book | null = null;

async function vaultTokenBalance(tokenAddress: string, decimals: number): Promise<number | null> {
  const vault = vaultAddress();
  if (vault === ZERO) return null;
  try {
    const res = await fetch(CHAIN.rpc, {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: AbortSignal.timeout(6000),
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_call", params: [{ to: tokenAddress, data: `0x70a08231000000000000000000000000${vault.slice(2)}` }, "latest"] }),
    });
    const json = (await res.json()) as { result?: string };
    if (!json.result || json.result === "0x") return null;
    return Number(BigInt(json.result)) / 10 ** decimals;
  } catch {
    return null;
  }
}

/**
 * Prices claims at their tier's USD value and decides which points are live:
 * live points per stock = vault inventory / shares per claim, spread over cities
 * with a daily rotation. Cached for 5 minutes.
 */
async function liveBook(): Promise<Book> {
  const day = new Date().toISOString().slice(0, 10);
  if (bookCache && bookCache.day === day && Date.now() - bookCache.at < 300_000) return bookCache;
  const shares: Book["shares"] = {};
  const budget: Book["budget"] = {};
  const inventory: Book["inventory"] = {};
  const price: Book["price"] = {};
  await Promise.all(
    TOKENS.map(async (t) => {
      const [p, inv] = await Promise.all([
        /^0x0+$/.test(t.feed)
          ? poolPriceUsd(tokenAddressFor(t.symbol, t.address), t.decimals)
          : feedPriceUsd(t.feed),
        vaultTokenBalance(tokenAddressFor(t.symbol, t.address), t.decimals),
      ]);
      price[t.symbol] = p;
      inventory[t.symbol] = inv;
      shares[t.symbol] = claimShares(t.rarity, p, t.fragment);
      budget[t.symbol] = inv == null ? 0 : payableClaims(inv, shares[t.symbol]!);
    }),
  );
  const db = await admin();
  const { data, error } = await db.from("spawns").select("id, symbol, places!inner(city)").limit(4000).abortSignal(AbortSignal.timeout(6000));
  if (error) throw new Error("Live allocation data unavailable");
  const bySym = new Map<string, { id: string; city: string }[]>();
  for (const r of (data ?? []) as unknown as { id: string; symbol: string; places: { city: string } }[]) {
    const l = bySym.get(r.symbol) ?? [];
    l.push({ id: r.id, city: r.places.city });
    bySym.set(r.symbol, l);
  }
  const live = new Set<string>();
  for (const [sym, cands] of bySym)
    for (const id of allocate(cands, budget[sym] ?? 0, `${day}:${sym}`)) live.add(id);
  bookCache = { shares, budget, inventory, price, live, day, at: Date.now() };
  return bookCache;
}

/* ----------------------------------------------------------------- spawns */

// Display only: fresh bounded/coalesced reads; redemption never uses this cache.
const readSpawnDisplay = createBoundedRead<{ all: Spawn[]; cooling: (Spawn & { respawnAt: string })[] }>(20_000, 15_000, 5_000);
async function loadSpawnDisplay(signal: AbortSignal) {
  const book = await liveBook();
  const all = (await openSpawns(signal)).filter((s) => book.live.has(s.id))
    .map((s) => ({ ...s, amount: book.shares[s.symbol] ?? s.amount }));
  const { data, error } = await (await admin()).from("spawns").select(SPAWN_SELECT)
    .gt("respawn_at", new Date().toISOString()).limit(300).abortSignal(signal);
  if (error) throw new Error("Cooling points unavailable");
  const cooling = ((data ?? []) as unknown as SpawnRow[]).flatMap((r) => r.respawn_at ? [{ ...toSpawn(r), respawnAt: r.respawn_at }] : []);
  return { all, cooling };
}

export const getSpawns = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) =>
    z
      .object({
        lat: z.number().optional(),
        lng: z.number().optional(),
        limit: z.number().min(1).max(2000).optional(),
      })
      .parse(d ?? {}),
  )
  .handler(async ({ data }) => {
    const { all, cooling } = await readSpawnDisplay((sig) => readSnapshot(dbSnapshotStore(), "app-spawns", loadSpawnDisplay, sig));
    const lat = data.lat;
    const lng = data.lng;
    const list: Spawn[] =
      lat != null && lng != null
        ? all
            .map((s) => ({
              ...s,
              distance: haversine(lat, lng, s.lat, s.lng),
            }))
            .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0))
        : all.map((s) => ({ ...s, distance: null }));
    return { spawns: list.slice(0, data.limit ?? 400), total: all.length, cooling };
  });


/* ----------------------------------------------------------------- claims */

const claimInput = z.object({
  spawnId: z.string().min(1),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  accuracy: z.number().min(0).max(5000),
  deviceId: z.string().min(6).max(80),
  /** Raw GPS log behind the fix: [lat, lng, accuracy, epochMs] */
  samples: z
    .array(z.tuple([z.number().min(-90).max(90), z.number().min(-180).max(180), z.number().min(0).max(5000), z.number().int().nonnegative()]))
    .max(200)
    .default([]),
  motion: z.number().min(0).max(100).default(0),
  tzOffsetMin: z.number().min(-900).max(900).default(0),
  /** Cloudflare Turnstile token proving a human passed the check. */
  humanToken: z.string().max(4096).optional(),
});

type Fail = { ok: false; error: string; errorZh?: string | undefined };
type Success = {
  ok: true;
  mode: "demo" | "live";
  spawn: Spawn;
  voucher: {
    to: string;
    district: number;
    amount: string;
    spawnId: string;
    nonce: string;
    deadline: number;
  };
  signature: string | null;
  inputData: string | null;
  contract: string;
  chainId: number;
};

function fail(error: string, errorZh?: string): Fail {
  return { ok: false, error, errorZh };
}

/** Checks submitted location plausibility; client samples are not independent presence proof. */
export const claimDrop = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => claimInput.parse(d))
  .handler(async ({ data }): Promise<Fail | CodeIssued> => {
    // Human check first, so scripts are refused before any database work.
    {
      const { getRequestHeader, getRequestHost } = await import("@tanstack/react-start/server");
      const { isPreviewHost } = await import("@/lib/site-gate");
      if (!isPreviewHost(getRequestHost())) {
        const { verifyTurnstile } = await import("@/lib/turnstile.server");
        const reqIp = getRequestHeader("cf-connecting-ip") || null;
        if (!(await verifyTurnstile(data.humanToken, reqIp)))
          return fail("Please complete the human check, then try again.", "请先完成真人验证，再点领取。");
      }
    }
    const { data: row } = await (await admin())
      .from("spawns")
      .select(SPAWN_SELECT)
      .eq("id", data.spawnId)
      .maybeSingle();
    if (!row) return fail("That drop does not exist any more.", "这个点位已不存在。");
    const spawnRow = row as unknown as SpawnRow;
    if (spawnRow.respawn_at && new Date(spawnRow.respawn_at).getTime() > Date.now()) {
      const mins = Math.ceil((new Date(spawnRow.respawn_at).getTime() - Date.now()) / 60000);
      return fail(`Someone just took this one. It comes back in ${mins} min.`, `这个点位刚被领走，${mins} 分钟后重新出现。`);
    }
    const book = await liveBook();
    if (!book.live.has(spawnRow.id))
      return fail("This point is not active right now. Points follow the vault's real inventory.", "这个点位当前未开放，点位随金库实际库存开放。");
    const spawn = toSpawn(row as unknown as SpawnRow);
    if (spawn.symbol === "SPCXB")
      return fail("SPCXB is not open for claims yet.", "SPCXB 暂未开放领取。");
    if (spawn.rarity === "legendary")
      return fail("Legendary drops are only claimable inside their event window, on the spot.", "传奇碎片只能在限时活动期间现场领取。");

    // on-site checks always apply, on every host
    const tester = false as boolean;

    // 1. accuracy + radius
    if (data.accuracy > RULES.maxAccuracyM)
      return fail(
        `Your GPS is off by ${Math.round(data.accuracy)} m. It has to be under ${RULES.maxAccuracyM} m — step outside and wait a few seconds.`,
        `当前定位误差 ${Math.round(data.accuracy)} 米，需小于 ${RULES.maxAccuracyM} 米。请到室外稍等几秒。`,
      );
    const distance = haversine(data.lat, data.lng, spawn.lat, spawn.lng);
    const radius = catchRadius(data.accuracy);
    if (distance > radius)
      return fail(
        `You are ${Math.round(distance)} m away. Get within ${Math.round(radius)} m of ${spawn.place}.`,
        `你距离点位还有 ${Math.round(distance)} 米，请走到 ${spawn.place} ${Math.round(radius)} 米以内。`,
      );

    if (!tester) {
    // 2. proof of presence: a real chipset wobbles
    if (data.samples.length < RULES.minFixSamples)
      return fail(
        `Keep the app open for ${RULES.minFixSeconds} seconds first — we need at least ${RULES.minFixSamples} readings behind your fix.`,
        `请先保持页面打开 ${RULES.minFixSeconds} 秒，至少需要 ${RULES.minFixSamples} 次定位采样。`,
      );
    const span =
      (Math.max(...data.samples.map((s) => s[3])) -
        Math.min(...data.samples.map((s) => s[3]))) /
      1000;
    if (span < RULES.minFixSeconds - 2)
      return fail(`Your GPS log only covers ${Math.round(span)} s. Stand still for 20 seconds.`, `定位记录只有 ${Math.round(span)} 秒，请原地停留 20 秒。`);
    const jitter = Math.max(
      ...data.samples.map((s) => haversine(s[0], s[1], data.lat, data.lng)),
    );
    const accSet = new Set(data.samples.map((s) => Math.round(s[2] * 10)));
    if (jitter < 0.3 || accSet.size < 2)
      return fail("That position does not move like a real GPS chipset. Mock locations are refused.", "定位数据不像真实手机 GPS，模拟定位无法领取。");
    if (distance < 0.5)
      return fail("Your fix lands on the pin to the centimetre. No phone does that.", "定位与点位完全重合，不像真实手机定位。");

    // 3. motion: emulators sit perfectly still
    // Motion is client-reported and many phones (iOS without permission, in-app browsers)
    // expose no sensor, so it is never a hard block: it only blocked real users.

    }
    const db = await admin();
    const now = Date.now();
    if (!tester) {
    // 5. travel: no teleporting, no city hopping
    const { data: fixes } = await db
      .from("position_log")
      .select("lat, lng, city, created_at")
      .eq("device_id", data.deviceId)
      .order("created_at", { ascending: false })
      .limit(20);
    const last = fixes?.[0];
    if (last) {
      const dt = (now - new Date(last.created_at).getTime()) / 1000;
      const dist = haversine(last.lat, last.lng, data.lat, data.lng);
      const allowed =
        dist / 1000 < RULES.flightThresholdKm
          ? dt * RULES.walkSpeedMs
          : dt * 250 + RULES.airportMinutes * 60 * 250;
      if (dist > allowed)
        return fail("That is further than anybody could have travelled since your last fix.", "和上次定位相比移动距离不合理。");
      if (
        last.city !== spawn.city &&
        now - new Date(last.created_at).getTime() < 3600_000
      )
        return fail("Two different cities inside one hour. Not on this device.", "一小时内出现在两个城市，无法领取。");
    }

    // 6. device clock vs the timezone of where you claim to stand
    const expectedOffset = (spawn.lng / 15) * 60;
    if (Math.abs(-data.tzOffsetMin - expectedOffset) > RULES.clockSkewHours * 60)
      return fail("Your device clock does not match the timezone of that place.", "手机时区与点位所在地不符。");

    }
    // 7. phone GPS never reports sub-1.5 m accuracy; spoofing tools do
    if (data.accuracy < 1.5)
      return fail("That GPS accuracy is not possible on a phone. Mock locations are refused.", "定位精度异常，模拟定位无法领取。");

    // Network metadata is for investigation only. Shared Wi-Fi must not cap claims.
    const { getRequestHeader } = await import("@tanstack/react-start/server");
    const ip =
      getRequestHeader("cf-connecting-ip") ||
      (getRequestHeader("x-forwarded-for") || "").split(",")[0]?.trim() ||
      null;

    // 8. one network cannot be in two far-apart cities faster than travel allows.
    // Same-city sharing (offices, cafés, dorms) is never limited here.
    if (ip) {
      const { data: netCodes } = await db
        .from("claim_codes")
        .select("lat, lng, created_at")
        .eq("ip", ip)
        .gte("created_at", new Date(now - 6 * 3600_000).toISOString())
        .order("created_at", { ascending: false })
        .limit(50);
      for (const c of netCodes ?? []) {
        const dist = haversine(c.lat, c.lng, data.lat, data.lng);
        if (dist < 30_000) continue;
        const dt = Math.max(0, (now - new Date(c.created_at).getTime()) / 1000);
        const allowed = Math.max(0, dt - RULES.airportMinutes * 60) * 250;
        if (dist > allowed)
          return fail(
            "This network was just used in another city. Claims must be made on the spot.",
            "这个网络刚刚在另一个城市使用过，无法领取。请在现场用自己的网络领取。",
          );
      }
    }

    const code = `CATCH-${[...crypto.getRandomValues(new Uint8Array(6))].map((b) => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[b % 32]).join("")}`;
    const expiresAt = new Date(now + RULES.voucherTtlMin * 60000);
    const { error: codeErr } = await db.from("claim_codes").insert({
      code,
      ip,
      spawn_id: spawn.id,
      device_id: data.deviceId,
      lat: data.lat,
      lng: data.lng,
      accuracy: data.accuracy,
      expires_at: expiresAt.toISOString(),
    });
    if (codeErr) return fail("Could not issue a claim code. Try again.", "领取码生成失败，请重试。");
    return {
      ok: true as const,
      code,
      expiresAt: Math.floor(expiresAt.getTime() / 1000),
      spawn: { ...spawn, amount: book.shares[spawn.symbol] ?? spawn.amount },
      vault: vaultAddress(),
      chainId: CHAIN.id,
    };
  });

type CodeIssued = {
  ok: true;
  code: string;
  expiresAt: number;
  spawn: Spawn;
  vault: string;
  chainId: number;
};

/**
 * Step two, called by the user's AI with its own wallet: trades a fresh claim code
 * for a signed voucher bound to that Agent wallet. Single use.
 */
/** Rebuilds the exact voucher already recorded for a redeemed code, if still unexpired. */
async function replayVoucher(
  db: Awaited<ReturnType<typeof admin>>,
  codeRow: { spawn_id: string; used_at: string | null },
  wallet: string,
  now: number,
): Promise<Success | null> {
  const since = new Date(new Date(codeRow.used_at!).getTime() - 60000).toISOString();
  const { data: c } = await db
    .from("catches")
    .select("*")
    .eq("wallet", wallet)
    .eq("spawn_id", codeRow.spawn_id)
    .gte("created_at", since)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!c || !c.signature || !c.nonce || !c.deadline || !c.amount_wei) return null;
  if (Number(c.deadline) * 1000 <= now) return null;
  const { data: row } = await db.from("spawns").select(SPAWN_SELECT).eq("id", codeRow.spawn_id).maybeSingle();
  if (!row) return null;
  const spawn = toSpawn(row as unknown as SpawnRow);
  const { keccak256, toHex, encodeFunctionData, getAddress } = await import("viem");
  const { VAULT_ABI } = await import("./vault");
  const voucher = {
    to: getAddress(wallet),
    district: DISTRICT_BY_SYMBOL[c.symbol] ?? 0,
    amount: String(c.amount_wei),
    spawnId: keccak256(toHex(spawn.id)),
    nonce: String(c.nonce),
    deadline: Number(c.deadline),
  };
  const inputData = encodeFunctionData({
    abi: VAULT_ABI as never,
    functionName: "claimGameVoucher",
    args: [voucher.to, voucher.district, BigInt(voucher.amount), voucher.spawnId, BigInt(voucher.nonce), BigInt(voucher.deadline), c.signature],
  } as never);
  return {
    ok: true,
    mode: c.mode as "demo" | "live",
    inputData,
    spawn: { ...spawn, amount: Number(c.amount) },
    voucher,
    signature: c.signature,
    contract: vaultAddress(),
    chainId: CHAIN.id,
  };
}

export async function redeemClaimCode(codeIn: string, address: string): Promise<Fail | Success> {
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) return fail("That is not a wallet address.", "钱包地址格式不正确。");
  const wallet = address.toLowerCase();
  const db = await admin();
  const now = Date.now();
  const { data: codeRow } = await db.from("claim_codes").select("*").eq("code", codeIn.trim().toUpperCase()).maybeSingle();
  if (!codeRow) return fail("Unknown claim code.", "领取码不存在。");
  if (codeRow.used_at) {
    // Same wallet asking again (AI retry): hand back the voucher already issued, never a new one.
    const replay = codeRow.wallet === wallet ? await replayVoucher(db, codeRow, wallet, now) : null;
    if (replay) return replay;
    return fail("This claim code was already used.", "这个领取码已经用过了。");
  }
  if (new Date(codeRow.expires_at).getTime() < now) return fail("This claim code has expired. Get a new one on site.", "领取码已过期，请到现场重新获取。");

  const agent = await hasAgentId(wallet);
  if (agent !== true)
    return fail("This wallet has no Binance Agent ID. Only an Agent Wallet can claim.", "这个钱包没有币安 Agent ID，只有 Agent 钱包才能领取。");

  const { data: row } = await db.from("spawns").select(SPAWN_SELECT).eq("id", codeRow.spawn_id).maybeSingle();
  if (!row) return fail("That drop does not exist any more.", "这个点位已不存在。");
  const spawnRow = row as unknown as SpawnRow;
  if (spawnRow.respawn_at && new Date(spawnRow.respawn_at).getTime() > now)
    return fail("Someone claimed this point first.", "这个点位已被别人先领走了。");
  const book = await liveBook();
  if (!book.live.has(spawnRow.id))
    return fail("This point is not active right now.", "这个点位当前未开放。");
  const spawn = toSpawn(spawnRow);
  const data = { address, spawnId: spawnRow.id, deviceId: codeRow.device_id, lat: codeRow.lat, lng: codeRow.lng, accuracy: codeRow.accuracy };

  // every wallet follows the same caps and cooldown (test whitelist removed)
  const tester = false as boolean;

  // 3b. behaviour profile: long-window patterns a single GPS fix cannot show.
  // Soft signals only flag; a device farming codes for 3+ wallets in 24h blocks.
  {
    const dayAgoIso = new Date(now - 864e5).toISOString();
    const weekAgoIso = new Date(now - 7 * 864e5).toISOString();
    const [devCodes24, devCodes7, walletCodes7, devPositions7, devCatches24, walletCatches] = await Promise.all([
      db.from("claim_codes").select("wallet").eq("device_id", data.deviceId).not("used_at", "is", null).gte("used_at", dayAgoIso),
      db.from("claim_codes").select("wallet").eq("device_id", data.deviceId).not("used_at", "is", null).gte("used_at", weekAgoIso),
      db.from("claim_codes").select("device_id").eq("wallet", wallet).not("used_at", "is", null).gte("used_at", weekAgoIso),
      db.from("position_log").select("city").eq("device_id", data.deviceId).gte("created_at", weekAgoIso),
      db.from("claim_codes").select("code").eq("device_id", data.deviceId).not("used_at", "is", null).gte("used_at", dayAgoIso),
      db.from("catches").select("created_at").eq("wallet", wallet).order("created_at", { ascending: true }).limit(20),
    ]);
    const uniq = (rows: { [k: string]: string | null }[] | null, key: string) =>
      new Set((rows ?? []).map((r) => r[key]).filter(Boolean)).size;
    const times = (walletCatches.data ?? []).map((c) => new Date(c.created_at).getTime() / 60000);
    const intervals = times.slice(1).map((t, i) => t - times[i]!);
    const verdict = scoreBehavior({
      walletsPerDevice24h: uniq(devCodes24.data, "wallet"),
      walletsPerDevice7d: uniq(devCodes7.data, "wallet"),
      devicesPerWallet7d: uniq(walletCodes7.data, "device_id"),
      citiesPerDevice7d: uniq(devPositions7.data, "city"),
      deviceClaims24h: (devCatches24.data ?? []).length,
      intervalMinutes: intervals,
    });
    if (verdict.action !== "allow") {
      await db.from("behavior_flags").insert({
        device_id: data.deviceId,
        wallet,
        score: verdict.score,
        action: verdict.action,
        reasons: verdict.reasons,
      });
    }
    if (verdict.action === "block")
      return fail(
        "This device shows an abuse pattern and cannot claim right now.",
        "该设备存在异常领取行为，暂时无法领取。",
      );
  }

    const dayAgo = new Date(now - 864e5).toISOString();

    if (!tester) {
    // 4. caps
    const { data: walletDay } = await db
      .from("catches")
      .select("id, spawn_id, created_at")
      .eq("wallet", wallet)
      .gte("created_at", dayAgo);
    const mine = walletDay ?? [];
    if (mine.length >= RULES.perWalletPerDay)
      return fail(`You have caught ${RULES.perWalletPerDay} drops today. Come back after midnight UTC.`, `今天已领 ${RULES.perWalletPerDay} 次，明天早上 8 点（北京时间）后再来。`);
    if (mine.some((c) => c.spawn_id === data.spawnId))
      return fail("You already caught this drop in the last 24 hours. Find another one.", "24 小时内已领过这个点位，换一个吧。");
    const lastMine = mine
      .map((c) => new Date(c.created_at).getTime())
      .sort((a, b) => b - a)[0];
    if (lastMine && now - lastMine < RULES.walletCooldownMin * 60000)
      return fail(
        `Cooldown: ${Math.ceil((RULES.walletCooldownMin * 60000 - (now - lastMine)) / 60000)} minutes before your next catch.`,
        `冷却中：还需 ${Math.ceil((RULES.walletCooldownMin * 60000 - (now - lastMine)) / 60000)} 分钟才能再领。`,
      );

    }
    // the drop's own cooldown is authoritative and was checked above (respawn_at)

    // 4b. whole-site hourly payout ceiling, priced in USD (Grass-style)
    const hourAgo = new Date(now - 3600e3).toISOString();
    const { data: hourCatches } = await db
      .from("catches")
      .select("symbol, amount")
      .gte("created_at", hourAgo);
    const hourlyToken = TOKEN_BY_SYMBOL[spawn.symbol]!;
    const cap = hourlyCapCheck(
      hourCatches ?? [],
      { symbol: hourlyToken.symbol, amount: book.shares[hourlyToken.symbol] ?? hourlyToken.fragment },
      book.price,
      RULES.hourlyUsdCap,
    );
    if (!cap.ok)
      return fail(
        cap.reason === "cap"
          ? "This hour's prize budget is used up. New budget unlocks within the hour — try again soon."
          : "Live prices are unavailable right now, so claims are paused. Try again in a minute.",
        cap.reason === "cap"
          ? "本小时奖励额度已用完，一小时内会恢复，请稍后再试。"
          : "暂时读不到链上价格，领取暂停，请一分钟后再试。",
      );

  // burn the code first so two AIs cannot race the same one
  const { data: burned } = await db
    .from("claim_codes")
    .update({ used_at: new Date(now).toISOString(), wallet })
    .eq("code", codeRow.code)
    .is("used_at", null)
    .select("code");
  if (!burned || burned.length === 0) return fail("This claim code was already used.", "这个领取码已经用过了。");

    // record the fix, then the catch
    await db.from("position_log").insert({
      wallet,
      device_id: data.deviceId,
      city: spawn.city,
      lat: data.lat,
      lng: data.lng,
      accuracy: data.accuracy,
    });

    const mode: "demo" | "live" = liveMode() ? "live" : "demo";
    const token = TOKEN_BY_SYMBOL[spawn.symbol]!;
    const contract = vaultAddress();
    const tokenAddress = tokenAddressFor(spawn.symbol, token.address);

    // uint256 nonce, unique per voucher and burned on use by the contract
    const nonceBytes = crypto.getRandomValues(new Uint8Array(31));
    const nonce = BigInt(
      "0x" + [...nonceBytes].map((b) => b.toString(16).padStart(2, "0")).join(""),
    ).toString();
    const deadline = Math.floor(now / 1000) + RULES.voucherTtlMin * 60;

    const { keccak256, toHex, parseUnits } = await import("viem");
    const spawnIdHash = keccak256(toHex(spawn.id));
    // One drop rule per token, everywhere on the map: the token's fragment size
    // is authoritative, never a per-pin number.
    const payout = book.shares[token.symbol] ?? token.fragment;
    const amountWei = parseUnits(payout.toString(), token.decimals).toString();

    const voucher = {
      to: data.address,
      district: DISTRICT_BY_SYMBOL[token.symbol] ?? 0,
      amount: amountWei,
      spawnId: spawnIdHash,
      nonce,
      deadline,
    };

    let signature: string | null = null;
    if (mode === "live") {
      try {
        const { privateKeyToAccount } = await import("viem/accounts");
        const raw = signerKey()!;
        const account = privateKeyToAccount(
          (raw.startsWith("0x") ? raw : `0x${raw}`) as `0x${string}`,
        );
        signature = await account.signTypedData({
          domain: {
            name: EIP712_NAME,
            version: EIP712_VERSION,
            chainId: CHAIN.id,
            verifyingContract: contract as `0x${string}`,
          },
          types: VOUCHER_TYPES as unknown as Record<string, { name: string; type: string }[]>,
          primaryType: VOUCHER_PRIMARY_TYPE,
          message: {
            to: voucher.to as `0x${string}`,
            district: voucher.district,
            amount: BigInt(voucher.amount),
            spawnId: voucher.spawnId,
            nonce: BigInt(voucher.nonce),
            deadline: BigInt(voucher.deadline),
          },
        });
      } catch (e) {
        return fail("The claim server could not sign your voucher. Nothing was spent.", "后台签发凭证失败，未产生任何花费。");
      }
    }


    const { error: catchError } = await db.from("catches").insert({
      wallet,
      device_id: data.deviceId,
      spawn_id: spawn.id,
      symbol: spawn.symbol,
      amount: payout,
      city: spawn.cityName,
      place: spawn.place,
      lat: data.lat,
      lng: data.lng,
      accuracy: data.accuracy,
      mode,
      nonce,
      deadline,
      signature,
      token_address: tokenAddress,
      amount_wei: amountWei,
    });

    // The insert trigger locks the wallet and point, rechecks limits, and
    // reserves the cooldown in the same transaction. Never return an unrecorded voucher.
    if (catchError) return fail("This claim could not be reserved. The point may have been taken or a claim limit reached. Get a fresh code after the cooldown.", "领取未能确认，点位可能已被领走或已触发领取限制。请在冷却结束后重新获取领取码。");

    let inputData: string | null = null;
    if (signature) {
      const { encodeFunctionData } = await import("viem");
      const { VAULT_ABI } = await import("./vault");
      inputData = encodeFunctionData({
        abi: VAULT_ABI as never,
        functionName: "claimGameVoucher",
        args: [voucher.to, voucher.district, BigInt(voucher.amount), voucher.spawnId, BigInt(voucher.nonce), BigInt(voucher.deadline), signature],
      } as never);
    }

    return {
      ok: true,
      mode,
      inputData,
      spawn: { ...spawn, amount: payout },
      voucher,
      signature,
      contract,
      chainId: CHAIN.id,
    };
}

/* ------------------------------------------------- settlement bookkeeping */

export const recordClaimTx = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        nonce: z.string().min(1),
        txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: row, error } = await db.from("catches")
      .select("id, wallet, nonce, token_address, amount_wei")
      .eq("nonce", data.nonce).maybeSingle();
    if (error || !row?.nonce || !row.token_address || !row.amount_wei) return { ok: false as const };
    const receipt = await chainRpc<ClaimReceipt>("eth_getTransactionReceipt", [data.txHash]);
    if (!receiptMatchesClaim(receipt, vaultAddress(), {
      wallet: row.wallet, nonce: row.nonce, tokenAddress: row.token_address, amountWei: row.amount_wei,
    })) return { ok: false as const };
    const { error: updateError } = await db
      .from("catches")
      .update({ tx_hash: data.txHash, settled_at: new Date().toISOString() })
      .eq("id", row.id);
    return { ok: !updateError };
  });

async function chainRpc<T>(method: string, params: unknown[]): Promise<T | null> {
  try {
    const res = await fetch(CHAIN.rpc, {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: AbortSignal.timeout(8000),
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    });
    const json = (await res.json()) as { result?: T };
    return json.result ?? null;
  } catch {
    return null;
  }
}

/** Has the vault burned this voucher nonce, and in which transaction (best effort)? */
async function voucherOnChain(nonce: string, wallet: string): Promise<{ used: boolean; txHash: string | null }> {
  const { encodeFunctionData, encodeEventTopics } = await import("viem");
  const { VAULT_ABI } = await import("./vault");
  const data = encodeFunctionData({ abi: VAULT_ABI as never, functionName: "gameNonceUsed", args: [BigInt(nonce)] } as never);
  const r = await chainRpc<string>("eth_call", [{ to: vaultAddress(), data }, "latest"]);
  const used = !!r && r !== "0x" && BigInt(r) !== 0n;
  if (!used) return { used, txHash: null };
  const latest = await chainRpc<string>("eth_blockNumber", []);
  if (!latest) return { used, txHash: null };
  const topics = (encodeEventTopics({ abi: VAULT_ABI as never, eventName: "GameRewardClaimed", args: { to: wallet } } as never) as (string | null)[]).slice(0, 2);
  // public nodes cap log ranges, so walk back in 5,000-block windows (about the last few hours)
  const LOG_RPC = "https://bsc-rpc.publicnode.com";
  let to = BigInt(latest);
  for (let i = 0; i < 6 && to > 0n; i++) {
    const from = to > 4999n ? to - 4999n : 0n;
    try {
      const res = await fetch(LOG_RPC, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_getLogs", params: [{ address: vaultAddress(), topics, fromBlock: `0x${from.toString(16)}`, toBlock: `0x${to.toString(16)}` }] }),
      });
      const logs = ((await res.json()) as { result?: { data: string; transactionHash: string }[] }).result ?? [];
      const hit = logs.find((l) => l.data.length >= 194 && BigInt(`0x${l.data.slice(-64)}`) === BigInt(nonce));
      if (hit) return { used, txHash: hit.transactionHash };
    } catch {
      break;
    }
    to = from - 1n;
  }
  return { used, txHash: null };
}

/** The site's own view of claim codes it issued on this device: did the AI claim yet? */
export const getClaimStatus = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ codes: z.array(z.string().min(6).max(40)).max(30) }).parse(d))
  .handler(async ({ data }) => {
    const { claimPhase } = await import("./claim-status");
    const db = await admin();
    const codes = [...new Set(data.codes.map((c) => c.trim().toUpperCase()))];
    if (codes.length === 0) return { statuses: [] };
    const { data: rows } = await db.from("claim_codes").select("code, spawn_id, wallet, used_at, expires_at").in("code", codes);
    const now = Date.now();
    const statuses = await Promise.all(
      (rows ?? []).map(async (row) => {
        type CatchLite = { id: string; nonce: string | null; tx_hash: string | null; deadline: number | null; symbol: string; amount: number; token_address: string | null; amount_wei: string | null };
        let catchRow = null as CatchLite | null;
        if (row.used_at && row.wallet) {
          const { data: c } = await db
            .from("catches")
            .select("id, nonce, tx_hash, deadline, symbol, amount, token_address, amount_wei")
            .eq("spawn_id", row.spawn_id)
            .eq("wallet", row.wallet)
            .gte("created_at", new Date(new Date(row.used_at).getTime() - 60000).toISOString())
            .order("created_at", { ascending: true })
            .limit(1)
            .maybeSingle();
          catchRow = c as CatchLite | null;
        }
        let txHash: string | null = null;
        let nonceUsed = false;
        if (catchRow?.nonce && row.wallet && catchRow.token_address && catchRow.amount_wei) {
          const expected = { wallet: row.wallet, nonce: catchRow.nonce, tokenAddress: catchRow.token_address, amountWei: catchRow.amount_wei };
          let candidate = catchRow.tx_hash;
          let verified = candidate ? receiptMatchesClaim(await chainRpc<ClaimReceipt>("eth_getTransactionReceipt", [candidate]), vaultAddress(), expected) : false;
          if (!verified) {
            const onChain = await voucherOnChain(catchRow.nonce, row.wallet);
            candidate = onChain.txHash;
            verified = candidate ? receiptMatchesClaim(await chainRpc<ClaimReceipt>("eth_getTransactionReceipt", [candidate]), vaultAddress(), expected) : false;
          }
          nonceUsed = verified;
          if (verified) {
            txHash = candidate;
            await db.from("catches").update({ tx_hash: txHash, settled_at: new Date().toISOString() }).eq("id", catchRow.id).is("tx_hash", null);
          }
        }
        const phase = claimPhase({
          now,
          codeExpiresAt: new Date(row.expires_at).getTime(),
          codeUsed: !!row.used_at,
          txHash,
          nonceUsedOnChain: nonceUsed,
          voucherDeadline: catchRow?.deadline ? Number(catchRow.deadline) * 1000 : null,
        });
        return {
          code: row.code,
          phase,
          txHash,
          wallet: row.wallet,
          symbol: catchRow?.symbol ?? null,
          amount: catchRow ? Number(catchRow.amount) : null,
          tokenAddress: catchRow?.token_address ?? null,
        };
      }),
    );
    return { statuses };
  });

/* ------------------------------------------------------------- claim feed */

export const getClaims = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) =>
    z.object({ address: z.string().optional() }).parse(d ?? {}),
  )
  .handler(async ({ data }) => {
    const db = await admin();
    let q = db
      .from("catches")
      .select("wallet, symbol, amount, city, place, created_at, mode")
      .order("created_at", { ascending: false })
      .limit(30);
    if (data.address) q = q.eq("wallet", data.address.toLowerCase());
    const { data: rows } = await q;
    return (rows ?? []).map((r) => ({
      ...r,
      wallet: data.address ? r.wallet : shortAddress(r.wallet),
    }));
  });

/** Public launch; earlier rows are the owner's own tests. */
const FEED_SINCE = "2026-10-28T00:00:00Z";
type ClaimedRow = { wallet: string; symbol: string; amount: number; city: string; place: string; at: string; tx: string };
const readClaimedFeed = createBoundedRead<ClaimedRow[]>(30_000, 6_000, 10_000);

/** Public feed of on-chain verified claims only (settled with a matching receipt). Display only. */
export const getClaimedFeed = createServerFn({ method: "GET" }).handler(async () => {
  try {
    return await readClaimedFeed(async () => {
      const db = await admin();
      const { data: rows } = await db
        .from("catches")
        .select("wallet, symbol, amount, city, place, settled_at, tx_hash")
        .not("tx_hash", "is", null)
        .not("settled_at", "is", null)
        .eq("mode", "live")
        .gte("created_at", FEED_SINCE)
        .order("settled_at", { ascending: false })
        .limit(30);
      return (rows ?? []).map((r) => ({
        wallet: shortAddress(r.wallet),
        symbol: r.symbol,
        amount: Number(r.amount),
        city: r.city,
        place: r.place,
        at: r.settled_at!,
        tx: r.tx_hash!,
      }));
    });
  } catch {
    return [] as ClaimedRow[];
  }
});

/* ---------------------------------------------------------------- reserves */

export const getVault = createServerFn({ method: "GET" }).handler(async () => {
  const vault = vaultAddress();
  const rpc = CHAIN.rpc;
  const live = liveMode();
  // Balance reads are public: show real chain data as soon as a vault address
  // is set, even while claims (which need the signer key) are not live yet.
  const hasVault = vault !== ZERO;

  async function rpcCall(to: string, data: string): Promise<bigint | null> {
    try {
      const res = await fetch(rpc, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "eth_call",
          params: [{ to, data }, "latest"],
        }),
      });
      const json = (await res.json()) as { result?: string };
      if (!json.result || json.result === "0x") return null;
      return BigInt(json.result);
    } catch {
      return null;
    }
  }

  async function balanceOf(tokenAddress: string): Promise<number | null> {
    if (!hasVault) return null;
    const raw = await rpcCall(tokenAddress, `0x70a08231000000000000000000000000${vault.slice(2)}`);
    return raw == null ? null : Number(raw) / 1e18;
  }

  /** BNB waiting in a district to be swapped into its stock token. */
  async function pendingBnb(district: number): Promise<number | null> {
    if (!hasVault) return null;
    const raw = await rpcCall(vault, `0x953714c3${district.toString(16).padStart(64, "0")}`);
    return raw == null ? null : Number(raw) / 1e18;
  }

  async function vaultBnb(): Promise<number | null> {
    if (!hasVault) return null;
    try {
      const res = await fetch(rpc, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "eth_getBalance",
          params: [vault, "latest"],
        }),
      });
      const json = (await res.json()) as { result?: string };
      if (!json.result) return null;
      return Number(BigInt(json.result)) / 1e18;
    } catch {
      return null;
    }
  }

  const book = await liveBook();
  const [bnb, balances] = await Promise.all([
    vaultBnb(),
    Promise.all(
      TOKENS.map(async (t, i) => {
        const address = tokenAddressFor(t.symbol, t.address);
        const [onChain, pending] = await Promise.all([balanceOf(address), pendingBnb(i)]);
        // Demo reserve so the page is never empty before the vault is funded.
        const fragment = book.shares[t.symbol] ?? t.fragment;
        const balance = onChain ?? fragment * t.targetDrops;
        const drops = payableClaims(balance, fragment);
        return {
          symbol: t.symbol,
          address,
          balance,
          fragment,
          priceUsd: book.price[t.symbol] ?? null,
          drops,
          targetDrops: t.targetDrops,
          // How much of this token still has to be bought to hit the target.
          deficit: Math.max(0, (t.targetDrops - drops) * fragment),
          needsRefill: drops < t.targetDrops,
          rarity: t.rarity,
          onChain: onChain != null,
          pendingBnb: pending,
        };
      }),
    ),
  ]);

  return {
    vault,
    live,
    onChain: hasVault,
    explorer: CHAIN.explorer,
    chainId: CHAIN.id,
    vaultBnb: bnb,
    treasuryBnb: 0,
    balances,
    payableDrops: balances.reduce((n, b) => n + b.drops, 0),
    targetDrops: balances.reduce((n, b) => n + b.targetDrops, 0),
    refillNeeded: balances.filter((b) => b.needsRefill).map((b) => b.symbol),
    checkedAt: new Date().toISOString(),
  };
});

/* -------------------------------------------------------------- legendary */

export const getLegendary = createServerFn({ method: "GET" }).handler(async () => {
  const db = await admin();
  const { data: rows } = await db
    .from("legendary_events")
    .select("symbol, amount, place, city, lat, lng, starts_at, duration_min, radius_m, winner_wallet, tx_hash")
    .order("starts_at", { ascending: false })
    .limit(10);

  const events = rows ?? [];
  const now = Date.now();
  const upcoming =
    events.find((e) => new Date(e.starts_at).getTime() + e.duration_min * 60000 > now) ?? null;
  const past = events.filter((e) => e.winner_wallet);

  return {
    next: upcoming
      ? { ...upcoming, winner_wallet: upcoming.winner_wallet ? shortAddress(upcoming.winner_wallet) : null }
      : null,
    past: past.map((e) => ({ ...e, winner_wallet: shortAddress(e.winner_wallet!) })),
  };
});

export const claimLegendary = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
        lat: z.number(),
        lng: z.number(),
        accuracy: z.number(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const db = await admin();
    const now = Date.now();
    const { data: rows } = await db
      .from("legendary_events")
      .select("*")
      .is("winner_wallet", null)
      .order("starts_at", { ascending: true })
      .limit(5);
    const event = (rows ?? []).find((e) => {
      const s = new Date(e.starts_at).getTime();
      return now >= s && now <= s + e.duration_min * 60000;
    });
    if (!event) return fail("No legendary window is open right now.");
    if (data.accuracy > RULES.maxAccuracyM) return fail("Your GPS is too coarse for a legendary.");
    if (haversine(data.lat, data.lng, event.lat, event.lng) > event.radius_m)
      return fail(`Get within ${event.radius_m} m of ${event.place}.`);

    // Winner slot is written before anything is signed: exactly one winner.
    const { data: won } = await db
      .from("legendary_events")
      .update({ winner_wallet: data.address.toLowerCase() })
      .eq("id", event.id)
      .is("winner_wallet", null)
      .select("id");
    if (!won || won.length === 0) return fail("Somebody tapped a second before you. Sorry.");

    return { ok: true as const, symbol: event.symbol, amount: Number(event.amount) };
  });

/* ------------------------------------------------------------ early access */

export const earlyAccess = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        email: z.string().email("That email does not look right."),
        kind: z.enum(["walker", "brand", "city"]).default("walker"),
        city: z.string().max(80).optional(),
        company: z.string().max(120).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const db = await admin();
    const { error } = await db.from("waitlist").upsert(
      {
        email: data.email,
        kind: data.kind,
        city: data.city ?? null,
        company: data.company ?? null,
      },
      { onConflict: "email,kind", ignoreDuplicates: true },
    );
    if (error && !error.message.includes("duplicate")) return fail("Could not save that. Try again.");
    return { ok: true as const };
  });


/** Public: the Turnstile site key is publishable and safe to send to browsers. */
export const getHumanCheckKey = createServerFn({ method: "GET" }).handler(async () => {
  return { siteKey: process.env["TURNSTILE_SITE_KEY"] ?? null };
});
