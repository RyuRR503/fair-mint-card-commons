import { createFileRoute, Link } from "@tanstack/react-router";
import { SITE_PREVIEW_META } from "@/lib/site-preview";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Panel } from "@/components/site/Section";
import { TokenChip } from "@/components/site/TokenChip";
import { type MapPin } from "@/components/site/WorldMap";
import { LiveMap } from "@/components/site/LiveMap";
import type { MapPoint } from "@/components/site/GeoMap.client";

import { claimDrop, getSpawns, RULES } from "@/lib/game.functions";
import { buildAgentCommand } from "@/lib/agent-command";
import { isPreviewHost } from "@/lib/site-gate";
import { Input } from "@/components/ui/input";
import { catchRadius, formatDistance, haversine } from "@/lib/geo";
import { CHAIN, RARITY_LABEL, rarityVar, TOKEN_BY_SYMBOL, VAULT_ADDRESS } from "@/lib/tokens";
import type { Rarity } from "@/lib/tokens";
import { Button } from "@/components/ui/button";
import { Bot, Check, Copy, MapPin as MapPinIcon } from "lucide-react";
import { AgentStatus } from "@/components/site/AgentJourney";
import { claimEligibility } from "@/lib/agent-claims";
import { useT, useLang } from "@/lib/i18n";

/** AI agents call from outside, so always point them at the public site — preview hosts sit behind a login wall (401). */
const AGENT_CLAIM_API = "https://catch.fun/api/public/agent-claim";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "CATCH — the live map" },
      {
        name: "description",
        content:
          "Explore nearby signals and preview the phone GPS to AI command to Agent Wallet claim flow. Live Agent claims are pending.",
      },
      { property: "og:title", content: "CATCH — the live map" },
      { property: "og:description", content: "Explore real-world stock locations and the planned Binance Agentic Wallet claim experience." },
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
  const [busy, setBusy] = useState(false);
  const [claimError, setClaimError] = useState<{ en: string; zh: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [issued, setIssued] = useState<null | { spawnId: string; code: string; amount: number; symbol: string; place: string; deadline: number; chainId: number }>(null);
  const [testMode, setTestMode] = useState(false);
  useEffect(() => {
    setTestMode(isPreviewHost(window.location.host));
  }, []);



  const [spawns, setSpawns] = useState<Spawn[]>([]);
  const [fix, setFix] = useState<Fix | null>(null);
  const [geoError, setGeoError] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const samples = useRef<[number, number, number, number][]>([]);
  const motion = useRef(0);

  /* ------------------------------------------------------------- spawns */
  useEffect(() => {
    fetchSpawns({ data: fix ? { lat: fix.lat, lng: fix.lng, limit: 600 } : { limit: 600 } })
      .then((r) => setSpawns(r.spawns as Spawn[]))
      .catch(() => setNote(t("Could not load the map. Try again in a moment.", "地图加载失败，请稍后再试。")));
  }, [fetchSpawns, fix?.lat, fix?.lng, t]);

  /* ---------------------------------------------------------- geolocation */
  const startGeo = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setGeoError(t("This browser has no location support.", "当前浏览器不支持定位。"));
      return;
    }
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
      })),
    [spawns],
  );



  const active = useMemo(() => {
    const s = spawns.find((x) => x.id === selected) ?? null;
    if (!s) return null;
    return { ...s, distance: fix ? haversine(fix.lat, fix.lng, s.lat, s.lng) : null };
  }, [spawns, selected, fix]);
  const radius = fix ? catchRadius(fix.accuracy) : RULES.baseRadiusM;
  const inRange = !!(active && fix && (active.distance ?? Infinity) <= radius);
  const command = issued && issued.spawnId === active?.id ? buildAgentCommand({ lang: lang === "zh" ? "zh" : "en", api: AGENT_CLAIM_API, tokenAddress: TOKEN_BY_SYMBOL[issued.symbol]?.address ?? "", vaultAddress: VAULT_ADDRESS, ...issued }) : null;

  async function getCommand() {
    if (!active || !fix) return;
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
        },
      });
      if (!r.ok) setClaimError({ en: r.error, zh: r.errorZh ?? r.error });
      else setIssued({ spawnId: active.id, code: r.code, amount: r.spawn.amount, symbol: r.spawn.symbol, place: r.spawn.place, deadline: r.expiresAt, chainId: r.chainId });
    } catch {
      setClaimError({ en: "Could not reach the claim server. Try again.", zh: "无法连接领取服务，请重试。" });
    } finally {
      setBusy(false);
    }
  }

  /** Preview-only: place the device next to the selected point. The server skips on-site checks only on preview hosts. */
  function teleportToActive() {
    if (!active) return;
    const now = Date.now();
    const lat = active.lat + 0.00004;
    const lng = active.lng + 0.00004;
    samples.current = Array.from({ length: 6 }, (_, i) => [lat + i * 0.000005, lng - i * 0.000004, 10 + i, now - (5 - i) * 5000] as [number, number, number, number]);
    motion.current = 12;
    setFix({ lat, lng, accuracy: 12 });
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
            {active ? (
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
                {testMode && (
                  <Button variant="outline" size="sm" onClick={teleportToActive} className="mt-4 w-full">
                    <MapPinIcon />{t("Test: put me at this point", "测试：把我的位置设到这个点位")}
                  </Button>
                )}
<Button
                  disabled={busy || !fix || claimEligibility(active.rarity, "agent") !== "ready"}
                  onClick={getCommand}
                  className="mt-4 w-full"
                >
                  <Bot />{busy ? t("Verifying location…", "正在校验定位…") : t("Get claim code", "获取领取码")}
                </Button>
                <p className="mt-2 text-xs text-muted-foreground">{!fix ? t("Enable location first and keep this page open for 20 seconds.", "请先开启定位，并保持页面打开 20 秒。") : inRange ? t("You are in range. Get the code and paste the whole instruction to your AI.", "你已在领取范围内。获取领取码后，把整段指令发给你的 AI 即可。") : t("Walk closer to the venue. AI cannot replace your presence.", "请走到点位附近；现场定位须由你本人完成。")}</p>
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
            <h2 className="label-caps text-xs text-muted-foreground">{t("The rules", "规则")}</h2>
            <ul className="mt-3 space-y-2 text-xs leading-relaxed text-muted-foreground">
              <li>{t("· Every rarity requires an Agent Wallet, including legendary.", "· 普通、稀有、史诗、传奇，全部仅限 Agent 钱包。")}</li>
              <li>{t("· Planned flow: phone GPS → 15-minute command → AI → Agent claim.", "· 计划流程：手机定位 → 15 分钟指令 → AI → Agent 领取。")}</li>
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
    </div>
  );
}
