import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Panel } from "@/components/site/Section";
import { TokenChip } from "@/components/site/TokenChip";
import { WorldMap, type MapPin } from "@/components/site/WorldMap";
import { claimDrop, getSpawns, RULES } from "@/lib/game.functions";
import { catchRadius, formatDistance, haversine } from "@/lib/geo";
import { CHAIN, RARITY_LABEL, rarityVar } from "@/lib/tokens";
import type { Rarity } from "@/lib/tokens";
import { useT, useLang } from "@/lib/i18n";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "CATCH — the live map" },
      {
        name: "description",
        content:
          "Every live signal near you. Connect a wallet, walk to a spawn, tap, and the fragment lands on BNB Smart Chain.",
      },
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
  place: string;
  lat: number;
  lng: number;
  distance: number | null;
};

type Fix = { lat: number; lng: number; accuracy: number };

const RARITY_LABEL_ZH: Record<Rarity, string> = {
  common: "普通",
  rare: "稀有",
  epic: "史诗",
  legendary: "传奇",
};

function deviceId() {
  const key = "tg.device";
  let v = localStorage.getItem(key);
  if (!v) {
    v = crypto.randomUUID();
    localStorage.setItem(key, v);
  }
  return v;
}

function AppMap() {
  const t = useT();
  const { lang } = useLang();
  const fetchSpawns = useServerFn(getSpawns);
  const claim = useServerFn(claimDrop);

  const [spawns, setSpawns] = useState<Spawn[]>([]);
  const [fix, setFix] = useState<Fix | null>(null);
  const [geoError, setGeoError] = useState("");
  const [wallet, setWallet] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [noteOk, setNoteOk] = useState(false);
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

  /* -------------------------------------------------------------- wallet */
  const connect = useCallback(async () => {
    const eth = (window as any).ethereum;
    if (!eth) {
      setNote(t("No wallet found. Install MetaMask or open this in a wallet browser.", "没有检测到钱包。请安装 MetaMask，或在钱包内置浏览器中打开。"));
      setNoteOk(false);
      return;
    }
    try {
      const accounts: string[] = await eth.request({ method: "eth_requestAccounts" });
      await eth
        .request({ method: "wallet_switchEthereumChain", params: [{ chainId: CHAIN.hexId }] })
        .catch(async () => {
          await eth.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: CHAIN.hexId,
                chainName: CHAIN.name,
                nativeCurrency: CHAIN.currency,
                rpcUrls: [CHAIN.rpc],
                blockExplorerUrls: [CHAIN.explorer],
              },
            ],
          });
        });
      setWallet(accounts[0] ?? "");
    } catch {
      setNote(t("Wallet connection was refused.", "钱包连接被拒绝。"));
      setNoteOk(false);
    }
  }, [t]);

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

  const active = nearby.find((s) => s.id === selected) ?? null;
  const radius = fix ? catchRadius(fix.accuracy) : RULES.baseRadiusM;
  const inRange = !!(active && fix && (active.distance ?? Infinity) <= radius);

  /* ---------------------------------------------------------------- claim */
  async function onCatch() {
    if (!active || !fix || !wallet) return;
    setBusy(true);
    setNote("");
    try {
      const res = await claim({
        data: {
          address: wallet,
          spawnId: active.id,
          lat: fix.lat,
          lng: fix.lng,
          accuracy: fix.accuracy,
          deviceId: deviceId(),
          samples: samples.current.slice(-40),
          motion: motion.current,
          tzOffsetMin: new Date().getTimezoneOffset(),
        },
      });
      if (!res.ok) {
        setNoteOk(false);
        setNote(res.error);
      } else {
        setNoteOk(true);
        setNote(
          res.mode === "live"
            ? t(
                `Caught ${active.amount} ${active.symbol}. Confirm the transfer in your wallet.`,
                `已抓到 ${active.amount} ${active.symbol}，请在钱包里确认这笔转账。`,
              )
            : t(
                `Caught ${active.amount} ${active.symbol}. The vault contract is not deployed yet, so this catch is recorded and will be settled on ${CHAIN.short} at launch.`,
                `已抓到 ${active.amount} ${active.symbol}。金库合约尚未部署，这次领取已记录，上线时会在 ${CHAIN.short} 上结算。`,
              ),
        );
      }
    } catch {
      setNoteOk(false);
      setNote(t("The claim server did not answer. Try again.", "领取服务没有响应，请重试。"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* ------------------------------------------------------------ map */}
        <div>
          <WorldMap
            pins={pins}
            me={fix ? { lat: fix.lat, lng: fix.lng } : null}
            focus={fix ? { lat: fix.lat, lng: fix.lng } : null}
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
            <h2 className="label-caps text-xs text-muted-foreground">{t("Wallet", "钱包")}</h2>
            {wallet ? (
              <p className="mt-2 break-all font-mono text-xs">{wallet}</p>
            ) : (
              <button
                onClick={connect}
                className="label-caps mt-3 w-full rounded-md bg-primary px-5 py-3 text-xs text-primary-foreground shadow-[var(--shadow-glossy)]"
              >
                {t("Connect wallet", "连接钱包")}
              </button>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              {CHAIN.name} · chain id {CHAIN.id}
            </p>
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
              <button
                onClick={startGeo}
                className="label-caps mt-3 w-full rounded-md border border-border bg-card px-5 py-3 text-xs shadow-[var(--shadow-pop)]"
              >
                {t("Enable location", "开启定位")}
              </button>
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
                <button
                  onClick={onCatch}
                  disabled={!wallet || !fix || !inRange || busy}
                  className="label-caps mt-4 w-full rounded-md bg-primary px-5 py-3.5 text-xs text-primary-foreground shadow-[var(--shadow-glossy)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy
                    ? t("Checking…", "校验中…")
                    : !wallet
                      ? t("Connect a wallet first", "请先连接钱包")
                      : !fix
                        ? t("Enable location first", "请先开启定位")
                        : inRange
                          ? t("Catch it", "抓取")
                          : t("Walk closer", "再靠近一点")}
                </button>
              </>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                {t(
                  "Pick a signal from the list to see the distance and the catch button.",
                  "从列表里选一个信号，就能看到距离和抓取按钮。",
                )}
              </p>
            )}
            {note && (
              <p className={`mt-3 text-sm ${noteOk ? "text-primary" : "text-destructive"}`}>
                {note}
              </p>
            )}
          </Panel>

          <Panel>
            <h2 className="label-caps text-xs text-muted-foreground">{t("The rules", "规则")}</h2>
            <ul className="mt-3 space-y-2 text-xs leading-relaxed text-muted-foreground">
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
                {t(`· ${RULES.perWalletPerDay} catches per wallet per day.`, `· 每个钱包每天最多 ${RULES.perWalletPerDay} 次。`)}
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
