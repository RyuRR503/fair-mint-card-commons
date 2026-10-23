import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Panel } from "@/components/site/Section";
import { TokenChip } from "@/components/site/TokenChip";
import { type MapPin } from "@/components/site/WorldMap";
import { LiveMap } from "@/components/site/LiveMap";
import type { MapPoint } from "@/components/site/GeoMap.client";

import { getSpawns, RULES } from "@/lib/game.functions";
import { catchRadius, formatDistance, haversine } from "@/lib/geo";
import { CHAIN, RARITY_LABEL, rarityVar } from "@/lib/tokens";
import type { Rarity } from "@/lib/tokens";
import { Button } from "@/components/ui/button";
import { Bot, MapPin as MapPinIcon } from "lucide-react";
import { AgentJourney, AgentStatus } from "@/components/site/AgentJourney";
import { claimEligibility } from "@/lib/agent-claims";
import { useT, useLang } from "@/lib/i18n";

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
      setGeoError(t("This browser has no location support.", "这个浏览器不支持定位。"));
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
      () => setGeoError(t("Location is blocked. The game does not work without it.", "定位被拒绝。没有定位就没法玩。")),
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



  const active = nearby.find((s) => s.id === selected) ?? null;
  const radius = fix ? catchRadius(fix.accuracy) : RULES.baseRadiusM;
  const inRange = !!(active && fix && (active.distance ?? Infinity) <= radius);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-7"><p className="label-caps flex items-center gap-2 text-primary"><Bot className="size-4" />BINANCE AGENTIC WALLET</p><h1 className="mt-3 text-3xl sm:text-4xl">{t("Your city. Your Agent.", "你去探索，Agent 来领取。")}</h1><div className="mt-5"><AgentStatus /></div></div>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* ------------------------------------------------------------ map */}
        <div>
          <LiveMap
            pins={pins}
            points={points}
            me={fix ? { lat: fix.lat, lng: fix.lng } : null}
            meRadiusM={radius}
            selected={selected}
            {...(fix ? { center: [fix.lng, fix.lat] as [number, number], zoom: 13 } : {})}

            height="520px"
          />

          <Panel className="mt-4">
            <h2 className="label-caps text-xs text-muted-foreground">{t("Nearby signals", "附近信号")}</h2>
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
        <aside className="space-y-4">
          <Panel>
            <h2 className="flex items-center gap-2 text-sm font-semibold"><Bot className="size-4 text-primary" />{t("Agent Wallet", "Agent 钱包")}</h2>
            <p className="mt-3 text-sm">{t("Binance Agentic Wallet", "币安 Agent AI 钱包")}</p>
            <p className="mt-2 text-xs text-muted-foreground">{t("Identity verification and live claims are not connected. An ordinary wallet connection does not qualify for claiming.", "身份验证与真实领取尚未接通；连接普通钱包不代表拥有领取资格。")}</p>
            <Button disabled className="mt-4 w-full"><Bot />{t("Agent connection pending", "Agent 接入待开放")}</Button>
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
            <h2 className="label-caps text-xs text-muted-foreground">{t("Selected signal", "已选信号")}</h2>
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
                    : t("Enable location to measure the distance.", "开启定位后才能测距。")}
                </p>
                <Button disabled={claimEligibility(active.rarity, "agent") !== "ready"} className="mt-4 w-full"><Bot />{t("Live Agent claims pending", "Agent 真实领取待开放")}</Button>
                <p className="mt-2 text-xs text-muted-foreground">{!fix ? t("Enable location to measure distance. No command is issued in this preview.", "开启定位可测距；本预览不会签发领取指令。") : inRange ? t("You appear nearby; full GPS checks and Agent verification are still required before a live command.", "你已接近点位；真实指令还需完整定位校验与 Agent 身份验证。") : t("Walk closer to the venue. AI cannot replace your presence.", "请靠近真实点位，AI 不能代替你到场。")}</p>
              </>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                {t(
                  "Pick a signal to see its distance and Agent claim status.",
                  "从列表选择信号，查看距离与 Agent 领取状态。",
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
            <AgentJourney compact />
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
                  `· 领取半径 ${RULES.baseRadiusM}–${RULES.maxRadiusM} 米，按你的定位误差浮动。`,
                )}
              </li>
              <li>
                {t(
                  `· Keep the page open ${RULES.minFixSeconds} s so the log has at least ${RULES.minFixSamples} readings.`,
                  `· 页面保持打开 ${RULES.minFixSeconds} 秒，让日志至少有 ${RULES.minFixSamples} 条采样。`,
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
