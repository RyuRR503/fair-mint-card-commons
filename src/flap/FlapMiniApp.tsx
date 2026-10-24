import { useMemo, useState } from "react";
import { FlapCatchLettering } from "./FlapArtwork";
import { FlapOfflineMap, type FlapMapPoint } from "./FlapOfflineMap";
import { MAP_TOKENS, TOKEN_BY_SYMBOL, VAULT_ADDRESS, type Rarity } from "@/lib/tokens";
import { formatDistance, haversine } from "@/lib/geo";

/**
 * CATCH layout for the Flap MiniApp (portrait phone, one screen, no page scroll):
 *   1. Top bar      52px  wordmark + city + wallet
 *   2. Radar map    45vh  offline zoomable map, player position from useGeolocation()
 *   3. Action area  flex  nearby points sorted by distance; tap opens the catch sheet
 *   4. Bottom tabs  56px  radar / vault / my catches
 * Data: pass real `spawns`, `me`, `wallet` from the host; demo data is used when absent.
 */

export type FlapSpawn = { id: string; symbol: string; place: string; lat: number; lng: number; rarity: Rarity; usd: number; cooling?: boolean };

const RARITY_ZH: Record<Rarity, string> = { common: "普通", rare: "稀有", epic: "史诗", legendary: "传奇" };

const DEMO_ME = { lat: 31.2235, lng: 121.4455 };
const DEMO_SPAWNS: FlapSpawn[] = [
  { id: "d1", symbol: "AAPLB", place: "Apple 静安寺店", lat: 31.2238, lng: 121.4459, rarity: "rare", usd: 10 },
  { id: "d2", symbol: "TSLAB", place: "特斯拉超充 · 静安", lat: 31.2251, lng: 121.4487, rarity: "common", usd: 5 },
  { id: "d3", symbol: "NVDAB", place: "网鱼网咖 · 南京西路", lat: 31.2289, lng: 121.4512, rarity: "epic", usd: 20 },
  { id: "d4", symbol: "QQQB", place: "招商银行 · 常德路", lat: 31.2207, lng: 121.4431, rarity: "common", usd: 5 },
  { id: "d5", symbol: "MUB", place: "华为手机店 · 愚园路", lat: 31.2218, lng: 121.4398, rarity: "common", usd: 5, cooling: true },
];

type Tab = "radar" | "vault" | "history";

function Coin({ symbol, size = 40 }: { symbol: string; size?: number }) {
  const t = TOKEN_BY_SYMBOL[symbol];
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-bold"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.26,
        background: `linear-gradient(135deg, ${t?.color ?? "#333"}, ${t?.color2 ?? "#111"})`,
        color: t?.ink === "dark" ? "#111" : "#fff",
      }}
    >
      {t?.glyph ?? symbol.slice(0, 4)}
    </span>
  );
}

export function FlapMiniApp({
  spawns = DEMO_SPAWNS,
  me = DEMO_ME,
  wallet = "0x3A1c…9F2b",
  city = "上海",
  catchRadiusM = 50,
  onCatch,
}: {
  spawns?: FlapSpawn[];
  me?: { lat: number; lng: number } | null;
  wallet?: string;
  city?: string;
  catchRadiusM?: number;
  /** Call our backend claimDrop here; return the 15-minute claim code. */
  onCatch?: (spawn: FlapSpawn) => Promise<string>;
}) {
  const [tab, setTab] = useState<Tab>("radar");
  const [selected, setSelected] = useState<FlapSpawn | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<{ code: string; spawn: FlapSpawn; at: number }[]>([]);

  const nearby = useMemo(
    () =>
      spawns
        .map((s) => ({ ...s, dist: me ? haversine(me.lat, me.lng, s.lat, s.lng) : null }))
        .sort((a, b) => (a.dist ?? 1e12) - (b.dist ?? 1e12)),
    [spawns, me],
  );
  const mapPoints: FlapMapPoint[] = spawns.map((s) => ({ id: s.id, lat: s.lat, lng: s.lng, label: s.place, cooling: !!s.cooling }));

  const open = (s: FlapSpawn) => {
    setSelected(s);
    setCode(null);
  };
  const doCatch = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      const c = onCatch ? await onCatch(selected) : Math.random().toString(36).slice(2, 8).toUpperCase();
      setCode(c);
      setHistory((h) => [{ code: c, spawn: selected, at: Date.now() }, ...h]);
    } finally {
      setBusy(false);
    }
  };
  const selDist = selected && me ? haversine(me.lat, me.lng, selected.lat, selected.lng) : null;
  const inRange = selDist != null && selDist <= catchRadiusM;

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-background text-foreground">
      {/* 1. Top bar */}
      <header className="z-20 flex h-[52px] shrink-0 items-center justify-between border-b border-primary/20 bg-background/90 px-4 backdrop-blur">
        <FlapCatchLettering className="h-5" />
        <div className="flex items-center gap-2 text-xs">
          <span className="rounded-md border border-primary/40 bg-primary/10 px-2 py-0.5 text-primary">{city}</span>
          <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-muted-foreground">{wallet}</span>
        </div>
      </header>

      <main className="relative flex min-h-0 flex-1 flex-col">
        {tab === "radar" && (
          <>
            {/* 2. Radar map */}
            <div className="relative h-[45vh] shrink-0 overflow-hidden border-b border-primary/20">
              <FlapOfflineMap
                points={mapPoints}
                me={me}
                onSelect={(id) => {
                  const s = spawns.find((x) => x.id === id);
                  if (s) open(s);
                }}
                className="h-full rounded-none border-0"
              />
            </div>

            {/* 3. Nearby list */}
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">附近点位（由近到远）</span>
                <span className="text-primary">{nearby.filter((s) => !s.cooling).length} 处可捕获</span>
              </div>
              {nearby.map((s) => (
                <button
                  key={s.id}
                  onClick={() => open(s)}
                  disabled={s.cooling}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 text-left transition hover:border-primary/50 disabled:opacity-45"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <Coin symbol={s.symbol} />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{s.place}</span>
                      <span className="block text-xs text-muted-foreground">
                        {RARITY_ZH[s.rarity]} · {s.symbol} · 约 ${s.usd}
                      </span>
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block font-mono text-sm font-bold text-primary">
                      {s.dist != null ? formatDistance(s.dist) : "--"}
                    </span>
                    <span className="block text-[10px] text-muted-foreground">
                      {s.cooling ? "冷却中" : s.dist != null && s.dist <= catchRadiusM ? "在范围内" : "走近一些"}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {tab === "vault" && (
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <h2 className="mb-1 text-sm font-bold text-primary">BSC 金库 · 9 支股票</h2>
            <p className="mb-4 break-all font-mono text-[11px] text-muted-foreground">{VAULT_ADDRESS}</p>
            <div className="grid grid-cols-3 gap-3">
              {MAP_TOKENS.map((t) => (
                <div key={t.symbol} className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-3">
                  <Coin symbol={t.symbol} size={44} />
                  <span className="text-xs font-semibold">{t.symbol}</span>
                  <span className="text-center text-[10px] leading-tight text-muted-foreground">{t.venueZh}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "history" && (
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
            <h2 className="text-sm font-bold text-primary">当前钱包的领取记录</h2>
            {history.length === 0 && <p className="text-xs text-muted-foreground">还没有记录。去雷达页捕获第一个点位吧。</p>}
            {history.map((h) => (
              <div key={h.code} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                <Coin symbol={h.spawn.symbol} size={32} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm">{h.spawn.place}</div>
                  <div className="text-[11px] text-muted-foreground">{new Date(h.at).toLocaleTimeString()}</div>
                </div>
                <span className="font-mono text-sm text-primary">{h.code}</span>
              </div>
            ))}
          </div>
        )}

        {/* Catch sheet */}
        {selected && (
          <div className="absolute inset-0 z-30 flex items-end bg-background/70" onClick={() => setSelected(null)}>
            <div className="w-full rounded-t-2xl border-t border-primary/40 bg-card p-5 pb-6" onClick={(e) => e.stopPropagation()}>
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted" />
              <div className="flex items-center gap-3">
                <Coin symbol={selected.symbol} size={52} />
                <div>
                  <div className="font-semibold">{selected.place}</div>
                  <div className="text-xs text-muted-foreground">
                    {RARITY_ZH[selected.rarity]} · {selected.symbol} · 约 ${selected.usd} · 距您 {selDist != null ? formatDistance(selDist) : "--"}
                  </div>
                </div>
              </div>
              {code ? (
                <div className="mt-5 rounded-xl border border-primary/40 bg-primary/10 p-4 text-center">
                  <div className="text-xs text-muted-foreground">领取码（15 分钟内有效，交给你的 AI）</div>
                  <div className="mt-1 font-mono text-3xl font-bold tracking-[0.3em] text-primary">{code}</div>
                </div>
              ) : (
                <button
                  onClick={doCatch}
                  disabled={!inRange || busy}
                  className="mt-5 h-12 w-full rounded-xl bg-primary font-bold text-primary-foreground disabled:opacity-40"
                >
                  {busy ? "现场核验中…" : inRange ? "捕获" : `再走近一些（需 ${catchRadiusM} 米内）`}
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* 4. Bottom tabs */}
      <nav className="z-20 flex h-14 shrink-0 items-center justify-around border-t border-border bg-background text-xs">
        {(
          [
            ["radar", "寻宝雷达"],
            ["vault", "9 股金库"],
            ["history", "我的记录"],
          ] as [Tab, string][]
        ).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`flex h-full flex-1 items-center justify-center ${tab === k ? "font-bold text-primary" : "text-muted-foreground"}`}
          >
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
