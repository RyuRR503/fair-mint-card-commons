import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { cityByKey, type Spawn } from "./spawns";
import { TOKEN_BY_SYMBOL, TOKENS, VAULT_ADDRESS, CHAIN, type Rarity } from "./tokens";
import { catchRadius, haversine, MAX_ACCURACY_M } from "./geo";
import { EIP712_NAME, EIP712_VERSION, VOUCHER_TYPES } from "./vault";


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
    amount: Number(row.amount),
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
async function openSpawns(): Promise<Spawn[]> {
  const supabase = await admin();
  const { data, error } = await supabase
    .from("spawns")
    .select(SPAWN_SELECT)
    .or(`respawn_at.is.null,respawn_at.lte.${new Date().toISOString()}`)
    .limit(4000);
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
 * Token address for a symbol. An env override (TOKEN_SBUXON=0x…) wins, so the
 * nine contract addresses can be filled in without a code change.
 */
function tokenAddressFor(symbol: string, fallback: string) {
  const v = process.env[`TOKEN_${symbol}`];
  return v && v !== ZERO ? v : fallback;
}

function liveMode() {
  return (
    !!process.env["CLAIM_SIGNER_KEY"] &&
    vaultAddress() !== ZERO &&
    vaultAddress() !== VAULT_ADDRESS
  );
}


/* ----------------------------------------------------------------- spawns */

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
    const all = await openSpawns();
    const list: Spawn[] =
      data.lat != null && data.lng != null
        ? all
            .map((s) => ({
              ...s,
              distance: haversine(data.lat!, data.lng!, s.lat, s.lng),
            }))
            .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0))
        : all.map((s) => ({ ...s, distance: null }));
    return { spawns: list.slice(0, data.limit ?? 400), total: all.length };
  });


/* ----------------------------------------------------------------- claims */

const claimInput = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "That is not a wallet address."),
  spawnId: z.string().min(1),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  accuracy: z.number().min(0).max(5000),
  deviceId: z.string().min(6).max(80),
  /** Raw GPS log behind the fix: [lat, lng, accuracy, epochMs] */
  samples: z
    .array(z.tuple([z.number(), z.number(), z.number(), z.number()]))
    .max(200)
    .default([]),
  motion: z.number().min(0).max(100).default(0),
  tzOffsetMin: z.number().min(-900).max(900).default(0),
});

type Fail = { ok: false; error: string };
type Success = {
  ok: true;
  mode: "demo" | "live";
  spawn: Spawn;
  voucher: {
    to: string;
    token: string;
    amount: string;
    spawnId: string;
    nonce: string;
    deadline: number;
  };
  signature: string | null;
  contract: string;
  chainId: number;
};

function fail(error: string): Fail {
  return { ok: false, error };
}

/** The whole physical check, then a voucher. Never trusts the client. */
export const claimDrop = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => claimInput.parse(d))
  .handler(async ({ data }): Promise<Fail | Success> => {
    const wallet = data.address.toLowerCase();
    const { data: row } = await (await admin())
      .from("spawns")
      .select(SPAWN_SELECT)
      .eq("id", data.spawnId)
      .maybeSingle();
    if (!row) return fail("That drop does not exist any more.");
    const spawnRow = row as unknown as SpawnRow;
    if (spawnRow.respawn_at && new Date(spawnRow.respawn_at).getTime() > Date.now()) {
      const mins = Math.ceil((new Date(spawnRow.respawn_at).getTime() - Date.now()) / 60000);
      return fail(`Someone just took this one. It comes back in ${mins} min.`);
    }
    const spawn = toSpawn(row as unknown as SpawnRow);
    if (spawn.rarity === "legendary")
      return fail("Legendary drops are claimed during their event window, with the code on site.");

    // 1. accuracy + radius
    if (data.accuracy > RULES.maxAccuracyM)
      return fail(
        `Your GPS is off by ${Math.round(data.accuracy)} m. It has to be under ${RULES.maxAccuracyM} m — step outside and wait a few seconds.`,
      );
    const distance = haversine(data.lat, data.lng, spawn.lat, spawn.lng);
    const radius = catchRadius(data.accuracy);
    if (distance > radius)
      return fail(
        `You are ${Math.round(distance)} m away. Get within ${Math.round(radius)} m of ${spawn.place}.`,
      );

    // 2. proof of presence: a real chipset wobbles
    if (data.samples.length < RULES.minFixSamples)
      return fail(
        `Keep the app open for ${RULES.minFixSeconds} seconds first — we need at least ${RULES.minFixSamples} readings behind your fix.`,
      );
    const span =
      (Math.max(...data.samples.map((s) => s[3])) -
        Math.min(...data.samples.map((s) => s[3]))) /
      1000;
    if (span < RULES.minFixSeconds - 2)
      return fail(`Your GPS log only covers ${Math.round(span)} s. Stand still for 20 seconds.`);
    const jitter = Math.max(
      ...data.samples.map((s) => haversine(s[0], s[1], data.lat, data.lng)),
    );
    const accSet = new Set(data.samples.map((s) => Math.round(s[2] * 10)));
    if (jitter < 0.3 || accSet.size < 2)
      return fail("That position does not move like a real GPS chipset. Mock locations are refused.");
    if (distance < 0.5)
      return fail("Your fix lands on the pin to the centimetre. No phone does that.");

    // 3. motion: emulators sit perfectly still
    if (data.motion === 0)
      return fail("No motion at all from the device. Hold the phone in your hand and try again.");

    const db = await admin();
    const now = Date.now();
    const dayAgo = new Date(now - 864e5).toISOString();

    // 4. caps
    const { data: walletDay } = await db
      .from("catches")
      .select("id, spawn_id, created_at")
      .eq("wallet", wallet)
      .gte("created_at", dayAgo);
    const mine = walletDay ?? [];
    if (mine.length >= RULES.perWalletPerDay)
      return fail(`You have caught ${RULES.perWalletPerDay} drops today. Come back after midnight UTC.`);
    if (mine.some((c) => c.spawn_id === data.spawnId))
      return fail("You already caught this drop in the last 24 hours. Find another one.");
    const lastMine = mine
      .map((c) => new Date(c.created_at).getTime())
      .sort((a, b) => b - a)[0];
    if (lastMine && now - lastMine < RULES.walletCooldownMin * 60000)
      return fail(
        `Cooldown: ${Math.ceil((RULES.walletCooldownMin * 60000 - (now - lastMine)) / 60000)} minutes before your next catch.`,
      );

    // the drop's own cooldown is authoritative and was checked above (respawn_at)

    // 5. travel: no teleporting, no city hopping
    const { data: fixes } = await db
      .from("position_log")
      .select("lat, lng, city, created_at")
      .or(`wallet.eq.${wallet},device_id.eq.${data.deviceId}`)
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
        return fail("That is further than anybody could have travelled since your last fix.");
      if (
        last.city !== spawn.city &&
        now - new Date(last.created_at).getTime() < 3600_000
      )
        return fail("Two different cities inside one hour. Not on this device.");
    }

    // 6. device clock vs the timezone of where you claim to stand
    const expectedOffset = (spawn.lng / 15) * 60;
    if (Math.abs(-data.tzOffsetMin - expectedOffset) > RULES.clockSkewHours * 60)
      return fail("Your device clock does not match the timezone of that place.");

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
    const payout = token.fragment;
    const amountWei = parseUnits(payout.toString(), token.decimals).toString();

    const voucher = {
      to: data.address,
      token: tokenAddress,
      amount: amountWei,
      spawnId: spawnIdHash,
      nonce,
      deadline,
    };

    let signature: string | null = null;
    if (mode === "live") {
      try {
        const { privateKeyToAccount } = await import("viem/accounts");
        const raw = process.env["CLAIM_SIGNER_KEY"]!;
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
          primaryType: "Voucher",
          message: {
            to: voucher.to as `0x${string}`,
            token: voucher.token as `0x${string}`,
            amount: BigInt(voucher.amount),
            spawnId: voucher.spawnId,
            nonce: BigInt(voucher.nonce),
            deadline: BigInt(voucher.deadline),
          },
        });
      } catch (e) {
        return fail("The claim server could not sign your voucher. Nothing was spent.");
      }
    }

    await db.from("catches").insert({
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

    // the drop goes on cooldown and respawns by itself
    const cooldown = spawnRow.cooldown_min ?? RULES.dropCooldownMin;
    await db
      .from("spawns")
      .update({
        claimed_by: wallet,
        claimed_at: new Date().toISOString(),
        respawn_at: new Date(now + cooldown * 60000).toISOString(),
      })
      .eq("id", spawn.id);

    return {
      ok: true,
      mode,
      spawn,
      voucher,
      signature,
      contract,
      chainId: CHAIN.id,
    };
  });

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
    await db
      .from("catches")
      .update({ tx_hash: data.txHash, settled_at: new Date().toISOString() })
      .eq("nonce", data.nonce)
      .is("tx_hash", null);
    return { ok: true as const };
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

/* ---------------------------------------------------------------- reserves */

export const getVault = createServerFn({ method: "GET" }).handler(async () => {
  const vault = vaultAddress();
  const rpc = CHAIN.rpc;
  const live = liveMode();

  async function balanceOf(tokenAddress: string): Promise<number | null> {
    if (!live) return null;
    try {
      const body = {
        jsonrpc: "2.0",
        id: 1,
        method: "eth_call",
        params: [
          {
            to: tokenAddress,
            data: `0x70a08231000000000000000000000000${vault.slice(2)}`,
          },
          "latest",
        ],
      };
      const res = await fetch(rpc, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as { result?: string };
      if (!json.result) return null;
      return Number(BigInt(json.result)) / 1e18;
    } catch {
      return null;
    }
  }

  const balances = await Promise.all(
    TOKENS.map(async (t) => {
      const address = tokenAddressFor(t.symbol, t.address);
      const onChain = await balanceOf(address);
      // Demo reserve so the page is never empty before the vault is funded.
      const balance = onChain ?? t.fragment * (t.rarity === "legendary" ? 1 : 25);
      return {
        symbol: t.symbol,
        address,
        balance,

        fragment: t.fragment,
        drops: Math.floor(balance / t.fragment),
        rarity: t.rarity,
        onChain: onChain != null,
      };
    }),
  );

  return {
    vault,
    live,
    explorer: CHAIN.explorer,
    chainId: CHAIN.id,
    treasuryBnb: live ? 0 : 12.4,
    balances,
    payableDrops: balances.reduce((n, b) => n + b.drops, 0),
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
        code: z.string().min(3).max(20),
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
    if (data.code.trim().toUpperCase() !== event.code.toUpperCase())
      return fail("Wrong code. It is physically stuck at the spot.");

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
