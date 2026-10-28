import { createFileRoute, Link } from "@tanstack/react-router";
import { SITE_PREVIEW_META } from "@/lib/site-preview";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { isPreviewHost } from "@/lib/site-gate";
import { useServerFn } from "@tanstack/react-start";
import { Panel } from "@/components/site/Section";
import { TokenChip } from "@/components/site/TokenChip";
import { type MapPin } from "@/components/site/WorldMap";
import { LiveMap } from "@/components/site/LiveMap";
import type { LegendaryPoint, MapPoint } from "@/components/site/GeoMap.client";

import { claimDrop, getClaimStatus, getHumanCheckKey, getLegendary, getSpawns, RULES } from "@/lib/game.functions";
import { ClaimedFeed } from "@/components/site/ClaimedFeed";
import { HumanCheck, type HumanCheckHandle } from "@/components/site/HumanCheck";
import { isPending, type ClaimPhase } from "@/lib/claim-status";
import { buildAgentCommand, buildBuyCatchCommand } from "@/lib/agent-command";
import { CITY_BY_KEY } from "@/lib/cities";
import { Input } from "@/components/ui/input";
import { catchRadius, formatDistance, haversine } from "@/lib/geo";
import { CHAIN, RARITY_LABEL, rarityVar, TOKEN_BY_SYMBOL, VAULT_ADDRESS } from "@/lib/tokens";
import type { Rarity } from "@/lib/tokens";
import { Button } from "@/components/ui/button";
import { Bot, Check, CircleCheck, Copy, ExternalLink, Loader2, MapPin as MapPinIcon } from "lucide-react";
import { AgentStatus } from "@/components/site/AgentJourney";
import { claimEligibility } from "@/lib/agent-claims";
import { useT, useLang } from "@/lib/i18n";
import { retryDisplay } from "@/lib/display-retry";

/** AI agents call from outside, so always point them at the public site — preview hosts sit behind a login wall (401). */
const AGENT_CLAIM_API = "https://catch.fun/api/public/agent-claim";

/** Claim codes this device received on site, kept locally so the page can follow them. */
type MyClaim = { code: string; spawnId: string; symbol: string; amount: number; place: string; city: string; issuedAt: number };
type ClaimState = { phase: ClaimPhase; txHash: string | null; wallet: string | null; amount: number | null; symbol: string | null };
const MY_CLAIMS_KEY = "catch.myClaims";
function loadMyClaims(): MyClaim[] {
  try {
    const v = JSON.parse(localStorage.getItem(MY_CLAIMS_KEY) ?? "[]");
    return Array.isArray(v) ? (v as MyClaim[]).slice(0, 30) : [];
  } catch {
    return [];
  }
}

const PHASE_TEXT: Record<ClaimPhase, [string, string]> = {
  waiting: ["Waiting for your AI…", "等待 AI 提交…"],
  processing: ["AI is claiming on BSC…", "AI 处理中，正在链上领取…"],
  claimed: ["Received", "已到账"],
  expired: ["Code expired, not used", "领取码已过期，未使用"],
  lapsed: ["Voucher expired, nothing sent", "凭证已过期，未到账"],
};

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "CATCH — the live map" },
      {
        name: "description",
        content:
          "Explore nearby signals and claim real bStocks: phone GPS, a single-use code, then your Binance Agent Wallet claims on BSC.",
      },
      { property: "og:title", content: "CATCH — the live map" },
      { property: "og:description", content: "Explore real-world stock locations and claim them with a Binance Agentic Wallet." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      ...SITE_PREVIEW_META,
    ],
  }),
  component: AppMap,
});

type Spawn = {
  id: string;
  symbol: string;
  amount: number;
  rarity: Rarity;
  city: string;
  cityName: string;
  cityNameZh: string;
  country: string;
  place: string;
  lat: number;
  lng: number;
  distance?: number | null;
};

type Fix = { lat: number; lng: number; accuracy: number };

const RARITY_LABEL_ZH: Record<Rarity, string> = {
  common: "普通",
  rare: "稀有",
  epic: "史诗",
  legendary: "传奇",
};

function AppMap() {
  const t = useT();
  const { lang } = useLang();
  const fetchSpawns = useServerFn(getSpawns);
  const requestClaim = useServerFn(claimDrop);
  const loadHumanKey = useServerFn(getHumanCheckKey);
  const human = useRef<HumanCheckHandle>(null);
  const [humanKey, setHumanKey] = useState<string | null>(null);
  useEffect(() => {
    if (isPreviewHost(window.location.host)) return;
    loadHumanKey().then((r) => setHumanKey(r.siteKey)).catch(() => {});
  }, [loadHumanKey]);
  const [busy, setBusy] = useState(false);
  const [claimError, setClaimError] = useState<{ en: string; zh: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [issued, setIssued] = useState<null | { spawnId: string; code: string; amount: number; symbol: string; place: string; deadline: number; chainId: number }>(null);



  const [spawns, setSpawns] = useState<Spawn[]>([]);
  const [cooling, setCooling] = useState<(Spawn & { respawnAt: string })[]>([]);
  const [myClaims, setMyClaims] = useState<MyClaim[]>([]);
  const [claimStates, setClaimStates] = useState<Record<string, ClaimState>>({});
  const [celebrate, setCelebrate] = useState<null | { amount: number; symbol: string }>(null);
  const [spawnTick, setSpawnTick] = useState(0);

  /* ------------------------------------------------- next legendary drop */
  const fetchLegendary = useServerFn(getLegendary);
  const [legendary, setLegendary] = useState<LegendaryPoint | null>(null);
  useEffect(() => {
    let alive = true;
    fetchLegendary()
      .then((r: { next?: { place: string; city: string; lat: number; lng: number; starts_at: string; duration_min: number } | null }) => {
        if (!alive) return;
        const n = r?.next;
        setLegendary(
          n
            ? {
                id: "legendary-event",
                place: n.place,
                city: n.city,
                lat: n.lat,
                lng: n.lng,
                startsAt: n.starts_at,
                durationMin: n.duration_min,
              }
            : null,
        );
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [fetchLegendary]);
  const fetchStatus = useServerFn(getClaimStatus);
  useEffect(() => setMyClaims(loadMyClaims()), []);
  const [fix, setFix] = useState<Fix | null>(null);
  const [geoError, setGeoError] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const samples = useRef<[number, number, number, number][]>([]);
  const motion = useRef(0);

  /* ------------------------------------------------------------- spawns */
  useEffect(() => {
    const controller = new AbortController();
    // Distances already update locally. GPS jitter must not reload the whole map.
    retryDisplay(() => fetchSpawns({ data: { limit: 600 } }), controller.signal)
      .then((r) => {
        if (controller.signal.aborted) return;
        setSpawns(r.spawns as Spawn[]);
        setCooling((r.cooling ?? []) as (Spawn & { respawnAt: string })[]);
        setNote("");
      })
      .catch(() => { if (!controller.signal.aborted) setNote(t("Could not load the map. Try again in a moment.", "地图加载失败，请稍后再试。")); });
    return () => controller.abort();
  }, [fetchSpawns, t, spawnTick]);

  /* ------------------------------------------------ follow my claim codes */
  const pendingCodes = myClaims.filter((c) => {
    const st = claimStates[c.code];
    return !st || isPending(st.phase);
  }).map((c) => c.code);
  const pendingKey = pendingCodes.join(",");
  useEffect(() => {
    if (!pendingKey) return;
    let stop = false;
    const tick = async () => {
      try {
        const r = await fetchStatus({ data: { codes: pendingKey.split(",") } });
        if (stop) return;
        setClaimStates((prev) => {
          const next = { ...prev };
          let changed = false;
          for (const st of r.statuses) {
            const before = prev[st.code]?.phase;
            next[st.code] = { phase: st.phase, txHash: st.txHash, wallet: st.wallet, amount: st.amount, symbol: st.symbol };
            if (before !== st.phase) changed = true;
            if (before && before !== "claimed" && st.phase === "claimed" && st.amount != null && st.symbol)
              setCelebrate({ amount: st.amount, symbol: st.symbol });
          }
          if (changed) setSpawnTick((n) => n + 1);
          return next;
        });
      } catch {
        /* try again on the next tick */
      }
    };
    void tick();
    const id = window.setInterval(tick, 8000);
    return () => {
      stop = true;
      window.clearInterval(id);
    };
  }, [pendingKey, fetchStatus]);

  useEffect(() => {
    if (!celebrate) return;
    const id = window.setTimeout(() => setCelebrate(null), 3200);
    return () => window.clearTimeout(id);
  }, [celebrate]);

  /* ---------------------------------------------------------- geolocation */
  const startGeo = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setGeoError(t("This browser has no location support.", "当前浏览器不支持定位。"));
      return;
    }
    // iPhone only reports motion after an explicit permission prompt from a tap.
    const DM = (window as unknown as { DeviceMotionEvent?: { requestPermission?: () => Promise<string> } }).DeviceMotionEvent;
    DM?.requestPermission?.().catch(() => {});
    navigator.geolocation.watchPosition(
      (p) => {
        setGeoError("");
        const s: [number, number, number, number] = [
          p.coords.latitude,
          p.coords.longitude,
          p.coords.accuracy,
          p.timestamp,
        ];
        samples.current = [...samples.current.slice(-60), s];
        setFix({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy });
      },
      () => setGeoError(t("Location permission was denied. Enable it to measure your distance from locations.", "定位权限未获授权。请允许定位以查看点位距离。")),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 },
    );
  }, [t]);

  useEffect(() => {
    const onMotion = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity;
      if (!a) return;
      const m = Math.abs(a.x ?? 0) + Math.abs(a.y ?? 0) + Math.abs(a.z ?? 0);
      motion.current = Math.min(100, Math.max(motion.current * 0.9, m));
    };
    window.addEventListener("devicemotion", onMotion);
    return () => window.removeEventListener("devicemotion", onMotion);
  }, []);

  /* --------------------------------------------------------------- lists */
  const nearby = useMemo(() => {
    if (!fix) return spawns.slice(0, 40);
    return spawns
      .map((s) => ({ ...s, distance: haversine(fix.lat, fix.lng, s.lat, s.lng) }))
      .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0))
      .slice(0, 40);
  }, [spawns, fix]);

  const pins: MapPin[] = useMemo(() => {
    const by = new Map<string, Spawn[]>();
    for (const s of spawns) {
      const arr = by.get(s.city) ?? [];
      arr.push(s);
      by.set(s.city, arr);
    }
    return [...by.entries()].map(([city, list]) => ({
      key: city,
      lat: list[0]!.lat,
      lng: list[0]!.lng,
      label: t(list[0]!.cityName, list[0]!.cityNameZh),
      count: list.length,
      symbols: list.slice(0, 3).map((s) => s.symbol),
      rarity: list.some((s) => s.rarity === "epic")
        ? "epic"
        : list.some((s) => s.rarity === "rare")
          ? "rare"
          : "common",
    }));
  }, [spawns, t]);

  const points: MapPoint[] = useMemo(
    () =>
      spawns.map((s) => ({
        id: s.id,
        symbol: s.symbol,
        rarity: s.rarity,
        place: s.place,
        cityKey: s.city,
        amount: s.amount,
        lat: s.lat,
        lng: s.lng,
      })).concat(
        cooling.map((s) => ({
          id: s.id,
          symbol: s.symbol,
          rarity: s.rarity,
          place: s.place,
          cityKey: s.city,
          amount: s.amount,
          lat: s.lat,
          lng: s.lng,
          respawnAt: s.respawnAt,
        })),
      ),
    [spawns, cooling],
  );



  const active = useMemo(() => {
    const s = spawns.find((x) => x.id === selected) ?? cooling.find((x) => x.id === selected) ?? null;
    if (!s) return null;
    return { ...s, distance: fix ? haversine(fix.lat, fix.lng, s.lat, s.lng) : null };
  }, [spawns, cooling, selected, fix]);
  const activeCooling = active ? cooling.find((c) => c.id === active.id) ?? null : null;
  const issuedState = issued && issued.spawnId === active?.id ? claimStates[issued.code] : undefined;
  const radius = fix ? catchRadius(fix.accuracy) : RULES.baseRadiusM;
  const inRange = !!(active && fix && (active.distance ?? Infinity) <= radius);
  const command = issued && issued.spawnId === active?.id ? buildAgentCommand({ lang: lang === "zh" ? "zh" : "en", api: AGENT_CLAIM_API, tokenAddress: TOKEN_BY_SYMBOL[issued.symbol]?.address ?? "", vaultAddress: VAULT_ADDRESS, ...issued }) : null;

  async function getCommand() {
    if (!active || !fix) return;
    const humanToken = human.current?.token() ?? undefined;
    if (humanKey && !humanToken) {
      setClaimError({ en: "Please complete the human check below first.", zh: "请先完成下方的真人验证。" });
      return;
    }
    setBusy(true);
    setClaimError(null);
    setCopied(false);
    let deviceId = localStorage.getItem("catch.deviceId");
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem("catch.deviceId", deviceId);
    }
    try {
      const r = await requestClaim({
        data: {
          spawnId: active.id,
          lat: fix.lat,
          lng: fix.lng,
          accuracy: fix.accuracy,
          deviceId,
          samples: samples.current,
          motion: Math.round(motion.current),
          tzOffsetMin: new Date().getTimezoneOffset(),
          humanToken,
        },
      });
      if (!r.ok) setClaimError({ en: r.error, zh: r.errorZh ?? r.error });
      else {
        setIssued({ spawnId: active.id, code: r.code, amount: r.spawn.amount, symbol: r.spawn.symbol, place: r.spawn.place, deadline: r.expiresAt, chainId: r.chainId });
        const rec: MyClaim = { code: r.code, spawnId: active.id, symbol: r.spawn.symbol, amount: r.spawn.amount, place: r.spawn.place, city: lang === "zh" ? active.cityNameZh : active.cityName, issuedAt: Date.now() };
        setMyClaims((prev) => {
          const next = [rec, ...prev.filter((c) => c.code !== rec.code)].slice(0, 30);
          localStorage.setItem(MY_CLAIMS_KEY, JSON.stringify(next));
          return next;
        });
      }
    } catch {
      setClaimError({ en: "Could not reach the claim server. Try again.", zh: "无法连接领取服务，请重试。" });
    } finally {
      human.current?.reset();
      setBusy(false);
    }
  }


  async function copyCommand() {
    if (!command) return;
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
    } catch {
      setClaimError({ en: "Copy unavailable. Select the text instead.", zh: "无法复制，请手动选中文字复制。" });
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-7"><p className="label-caps flex items-center gap-2 text-primary"><Bot className="size-4" />BINANCE AGENTIC WALLET</p><h1 className="mt-3 text-3xl sm:text-4xl">{t("Explore tokenized stock locations", "浏览代币化美股点位")}</h1><div className="mt-5"><AgentStatus /></div></div>
      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* ------------------------------------------------------------ map */}
        <div className="min-w-0">
          <LiveMap
            pins={pins}
            points={points}
            legendary={legendary}
            me={fix ? { lat: fix.lat, lng: fix.lng } : null}
            meRadiusM={radius}
            selected={selected}
            onSelectPoint={(id) => setSelected(id)}
            {...(fix ? { center: [fix.lng, fix.lat] as [number, number], zoom: 13 } : {})}

            height="520px"
          />

          <Panel className="mt-4">
            <h2 className="label-caps text-xs text-muted-foreground">{t("Nearby signals", "附近点位")}</h2>
            <ul className="mt-3 max-h-72 divide-y divide-border/60 overflow-y-auto">
              {nearby.map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => setSelected(s.id)}
                    className={`flex w-full items-center gap-3 py-3 text-left text-sm ${
                      selected === s.id ? "opacity-100" : "opacity-80 hover:opacity-100"
                    }`}
                  >
                    <TokenChip symbol={s.symbol} size={32} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">
                        {s.amount} {s.symbol} · {s.place}
                      </span>
                      <span className="label-caps text-[10px] text-muted-foreground">
                        {s.city}
                      </span>
                    </span>
                    <span
                      className="label-caps rounded-md px-2.5 py-1 text-[9px] text-primary-foreground"
                      style={{ background: rarityVar(s.rarity) }}
                    >
                      {lang === "zh" ? RARITY_LABEL_ZH[s.rarity] : RARITY_LABEL[s.rarity]}
                    </span>
                    <span className="w-20 text-right font-mono text-[11px] text-muted-foreground">
                      {s.distance != null ? formatDistance(s.distance) : "—"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel className="mt-4">
            <ClaimedFeed zh={lang === "zh"} />
          </Panel>
        </div>

        {/* -------------------------------------------------------- sidebar */}
        <aside className="min-w-0 space-y-4">
          <Panel>
            <h2 className="flex items-center gap-2 text-sm font-semibold"><Bot className="size-4 text-primary" />{t("Agent Wallet", "Agent 钱包")}</h2>
            <p className="mt-3 text-sm">{t("Binance Agentic Wallet", "币安 Agent AI 钱包")}</p>
            <ol className="mt-3 space-y-1.5 text-xs text-muted-foreground">
              <li>{t("1. Walk to a live point and enable location.", "1. 走到开放中的点位，开启定位。")}</li>
              <li>{t("2. Keep the page open 20 s, then get the claim code.", "2. 保持页面 20 秒，获取领取码。")}</li>
              <li>{t("3. Paste the instruction to your AI. It adds its own wallet, previews, and claims on BSC after you confirm.", "3. 把指令发给 AI：它自动带上自己的钱包地址，先预览，你确认后在 BSC 上领取。")}</li>
            </ol>
            <p className="mt-3 text-xs text-muted-foreground">{t("The vault only pays wallets holding a Binance Agent ID, and only to themselves.", "金库只向持有币安 Agent ID 的钱包付款，且只能领给自己。")}</p>
            <Link to="/agent-guide" className="mt-3 inline-block text-xs text-primary underline">{t("First time? Set up your Agent Wallet →", "第一次用？查看 Agent 钱包设置教程 →")}</Link>
            <p className="mt-3 text-xs text-muted-foreground">{CHAIN.name} · {t("All rarities are Agent-only", "所有稀有度均仅限 Agent")}</p>
          </Panel>
          <Panel>
            <h2 className="label-caps text-xs text-muted-foreground">{t("Location", "定位")}</h2>
            {fix ? (
              <>
                <p className="mt-2 font-mono text-xs">
                  {fix.lat.toFixed(5)}, {fix.lng.toFixed(5)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t(
                    `±${Math.round(fix.accuracy)} m · catch radius ${Math.round(radius)} m · ${samples.current.length} readings`,
                    `±${Math.round(fix.accuracy)} 米 · 领取半径 ${Math.round(radius)} 米 · ${samples.current.length} 条采样`,
                  )}
                </p>
              </>
            ) : (
              <Button
                variant="outline"
                onClick={startGeo}
                className="label-caps mt-3 w-full rounded-md border border-border bg-card px-5 py-3 text-xs shadow-[var(--shadow-pop)]"
              >
                <MapPinIcon />{t("Enable location", "开启定位")}
              </Button>
            )}
            {geoError && <p className="mt-2 text-xs text-destructive">{geoError}</p>}
          </Panel>

          <Panel>
            <h2 className="label-caps text-xs text-muted-foreground">{t("Selected signal", "已选点位")}</h2>
            {legendary && selected === legendary.id ? (
              <>
                <div className="mt-3 flex items-center gap-3">
                  <TokenChip symbol="SPCXB" size={54} />
                  <div>
                    <p className="font-display text-lg">1 SPCXB</p>
                    <p className="text-xs text-muted-foreground">
                      {legendary.place},{" "}
                      {lang === "zh"
                        ? CITY_BY_KEY[legendary.city]?.nameZh ?? legendary.city
                        : CITY_BY_KEY[legendary.city]?.name ?? legendary.city}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  {new Date(legendary.startsAt).toLocaleString(lang === "zh" ? "zh-CN" : "en-US")} ·{" "}
                  {t(`open for ${legendary.durationMin} minutes`, `开放 ${legendary.durationMin} 分钟`)}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {t(
                    "Legendary is a timed event: it has no permanent pins and no map claim code. See the legendary page for the rules.",
                    "传奇是限时活动：无常驻点位，不使用地图领取码，规则见「传奇活动」页。",
                  )}
                </p>
                <Link to="/legendary" className="mt-3 inline-block text-xs text-primary underline">
                  {t("Open the legendary page →", "打开传奇活动页 →")}
                </Link>
              </>
            ) : active ? (
              <>
                <div className="mt-3 flex items-center gap-3">
                  <TokenChip symbol={active.symbol} size={54} />
                  <div>
                    <p className="font-display text-lg">
                      {active.amount} {active.symbol}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {active.place}, {active.city}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  {active.distance != null
                    ? t(`${formatDistance(active.distance)} away`, `距离 ${formatDistance(active.distance)}`)
                    : t("Enable location to measure the distance.", "开启定位后可查看点位距离。")}
                </p>
<Button
                  disabled={busy || !fix || !!activeCooling || claimEligibility(active.rarity, "agent") !== "ready"}
                  onClick={getCommand}
                  className="mt-4 w-full"
                >
                  <Bot />{busy ? t("Verifying location…", "正在校验定位…") : t("Get claim code", "获取领取码")}
                </Button>
                {humanKey && <HumanCheck ref={human} siteKey={humanKey} lang={lang === "zh" ? "zh" : "en"} />}
                <p className="mt-2 text-xs text-muted-foreground">{!fix ? t("Enable location first and keep this page open for 20 seconds.", "请先开启定位，并保持页面打开 20 秒。") : inRange ? t("You are in range. Get the code and paste the whole instruction to your AI.", "你已在领取范围内。获取领取码后，把整段指令发给你的 AI 即可。") : t("Walk closer to the venue. AI cannot replace your presence.", "请走到点位附近；现场定位须由你本人完成。")}</p>
                {activeCooling && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {t(
                      `Taken. This point comes back in about ${Math.max(1, Math.ceil((new Date(activeCooling.respawnAt).getTime() - Date.now()) / 60000))} min.`,
                      `已被领取，约 ${Math.max(1, Math.ceil((new Date(activeCooling.respawnAt).getTime() - Date.now()) / 60000))} 分钟后重新出现。`,
                    )}
                  </p>
                )}
                {issued && issued.spawnId === active.id && (
                  <ClaimStatusLine state={issuedState} fallback={{ amount: issued.amount, symbol: issued.symbol }} />
                )}
                {claimError && <p role="alert" className="mt-2 text-xs text-destructive">{lang === "zh" ? claimError.zh : claimError.en}</p>}
                {command && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-start gap-2 border-l-2 border-primary bg-secondary/35 p-3">
                      <code className="max-h-48 flex-1 overflow-y-auto whitespace-pre-wrap break-all font-mono text-[11px] leading-relaxed text-primary">{command}</code>
                      <Button variant="ghost" size="icon" onClick={copyCommand} aria-label={t("Copy Agent command", "复制 Agent 指令")}>{copied ? <Check /> : <Copy />}</Button>
                    </div>
                    <p role="status" className="text-xs text-muted-foreground">{copied ? t("Copied. Paste it to your AI; it previews first, then executes after you confirm.", "已复制。发给你的 AI，它会先预览，你确认后再执行。") : t(`Valid for ${RULES.voucherTtlMin} minutes, single use. Don't share it — whoever's AI uses it first gets the reward.`, `${RULES.voucherTtlMin} 分钟内有效，只能用一次。请勿外传，谁的 AI 先用就归谁。`)}</p>
                  </div>
                )}
              </>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                {t(
                  "Pick a signal to see its distance and Agent claim status.",
                  "请选择点位，查看距离与 Agent 领取状态。",
                )}
              </p>
            )}
            {note && (
              <p className="mt-3 text-sm text-destructive">
                {note}
              </p>
            )}
          </Panel>

          <Panel>
            <h2 className="label-caps text-xs text-muted-foreground">{t("Claims from this browser", "本机领取记录")}</h2>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{t(
              "This browser saves the claim codes you request and follows each code through your AI's redemption and on-chain result. No wallet login is needed. These are not all transactions from your Agent Wallet; another device, browser or cleared browser data will not show this history.",
              "这里按本浏览器保存的领取码，追踪 AI 兑换凭证与链上到账结果，无需登录钱包。这不是 Agent 钱包的全部交易记录；换设备、换浏览器或清除浏览器数据后，这些记录不会保留。",
            )}</p>
            {myClaims.length === 0 ? (
              <p className="mt-2 text-xs text-muted-foreground">{t("Codes you get on site appear here, with their on-chain result.", "在现场获取的领取码会显示在这里，并附上链上结果。")}</p>
            ) : (
              <ul className="mt-3 max-h-80 divide-y divide-border/60 overflow-y-auto">
                {myClaims.map((c) => {
                  const st = claimStates[c.code];
                  return (
                    <li key={c.code} className="flex items-start gap-3 py-3">
                      <TokenChip symbol={c.symbol} size={28} />
                      <div className="min-w-0 flex-1 text-xs">
                        <p className="truncate">
                          <span className="font-mono">{st?.amount ?? c.amount} {c.symbol}</span> · {c.place}
                        </p>
                        <p className="mt-0.5 text-muted-foreground">
                          {c.city} · {new Date(c.issuedAt).toLocaleString(lang === "zh" ? "zh-CN" : "en-US", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                        <ClaimStatusLine state={st} compact />
                        {st?.wallet && <a href={`${CHAIN.explorer}/address/${st.wallet}`} target="_blank" rel="noreferrer" className="mt-1 inline-flex max-w-full items-center gap-1 text-primary underline underline-offset-4"><span>{t("Recipient Agent Wallet", "收款 Agent 钱包")} · {st.wallet.slice(0, 6)}…{st.wallet.slice(-4)}</span><ExternalLink className="h-3 w-3 shrink-0" /></a>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          <Panel>
            <h2 className="label-caps text-xs text-muted-foreground">{t("The rules", "规则")}</h2>
            <ul className="mt-3 space-y-2 text-xs leading-relaxed text-muted-foreground">
              <li>{t("· Every rarity requires an Agent Wallet, including legendary.", "· 普通、稀有、史诗、传奇，全部仅限 Agent 钱包。")}</li>
              <li>{t("· The Agent Wallet must hold at least 100,000 CATCH, held for about 10 minutes.", "· Agent 钱包需持有至少 10 万个 CATCH，且已持有约 10 分钟。")}</li>
              <li>
                <button
                  type="button"
                  className="text-primary underline underline-offset-4"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(buildBuyCatchCommand(lang === "zh" ? "zh" : "en", "0x8344e021edfe72a8aa8382328edd096565487777"));
                      alert(t("Buy command copied. Paste it to your AI.", "买入指令已复制，粘贴给你的 AI 即可。"));
                    } catch {}
                  }}
                >
                  {t("Copy the “buy 100,000 CATCH” command for your AI", "复制「买入 10 万 CATCH」AI 指令")}
                </button>
              </li>
              <li>{t("· Flow: phone GPS → 15-minute command → AI → Agent claim.", "· 流程：手机定位 → 15 分钟指令 → AI → Agent 领取。")}</li>
              <li>
                {t(`· GPS accuracy under ${RULES.maxAccuracyM} m.`, `· GPS 精度需优于 ${RULES.maxAccuracyM} 米。`)}
              </li>
              <li>
                {t(
                  `· Catch radius ${RULES.baseRadiusM}–${RULES.maxRadiusM} m, scaled to your own error.`,
                  `· 领取半径 ${RULES.baseRadiusM}–${RULES.maxRadiusM} 米，随定位误差调整。`,
                )}
              </li>
              <li>
                {t(
                  `· Keep the page open ${RULES.minFixSeconds} s so the log has at least ${RULES.minFixSamples} readings.`,
                  `· 保持页面打开至少 ${RULES.minFixSeconds} 秒，以完成不少于 ${RULES.minFixSamples} 次定位采样。`,
                )}
              </li>
              <li>
                {t(`· ${RULES.perWalletPerDay} catches per Agent Wallet per day.`, `· 每个 Agent 钱包每天最多 ${RULES.perWalletPerDay} 次。`)}
              </li>
              <li>
                {t(`· ${RULES.walletCooldownMin} minutes between catches.`, `· 两次领取之间间隔 ${RULES.walletCooldownMin} 分钟。`)}
              </li>
            </ul>
          </Panel>
        </aside>
      </div>
      {celebrate && (
        <div role="status" aria-live="polite" className="claim-celebrate pointer-events-none fixed inset-0 z-50 grid place-items-center">
          <div className="claim-celebrate-ring" />
          <div className="claim-celebrate-card text-center">
            <CircleCheck className="mx-auto size-8 text-primary" />
            <p className="mt-2 font-display text-4xl text-primary">+{celebrate.amount} {celebrate.symbol}</p>
            <p className="mt-1 text-sm text-foreground">{t("Received in your Agent Wallet", "已到账你的 Agent 钱包")}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ClaimStatusLine({ state, fallback, compact }: { state: ClaimState | undefined; fallback?: { amount: number; symbol: string }; compact?: boolean }) {
  const t = useT();
  const phase: ClaimPhase = state?.phase ?? "waiting";
  const [en, zh] = PHASE_TEXT[phase];
  const amount = state?.amount ?? fallback?.amount;
  const symbol = state?.symbol ?? fallback?.symbol;
  const tone =
    phase === "claimed" ? "text-primary" : phase === "expired" || phase === "lapsed" ? "text-muted-foreground" : "text-foreground";
  const label = phase === "claimed" && amount != null && symbol ? t(`Received ${amount} ${symbol}`, `已到账 ${amount} ${symbol}`) : t(en, zh);
  const link = state?.txHash
    ? `${CHAIN.explorer}/tx/${state.txHash}`
    : phase === "claimed" && state?.wallet
      ? `${CHAIN.explorer}/address/${state.wallet}#tokentxns`
      : null;
  return (
    <div className={compact ? "mt-1" : "mt-3 rounded-md border border-border bg-secondary/35 p-3"}>
      <p className={`flex items-center gap-1.5 text-xs ${tone}`}>
        {phase === "claimed" ? <CircleCheck className="size-3.5" /> : isPending(phase) ? <Loader2 className="size-3.5 animate-spin motion-reduce:animate-none" /> : null}
        {label}
      </p>
      {link && (
        <a href={link} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-[11px] text-primary underline">
          {state?.txHash ? t("View transaction on BscScan", "在 BscScan 查看交易") : t("View wallet on BscScan", "在 BscScan 查看钱包")}
          <ExternalLink className="size-3" />
        </a>
      )}
    </div>
  );
}
