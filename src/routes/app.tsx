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

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "Touch Grass — the map" },
      {
        name: "description",
        content:
          "Every live drop near you. Connect a wallet, walk to a spawn, tap, and the fragment lands on BNB Smart Chain.",
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
      .catch(() => setNote("Could not load the map. Try again in a moment."));
  }, [fetchSpawns, fix?.lat, fix?.lng]);

  /* ---------------------------------------------------------- geolocation */
  const startGeo = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setGeoError("This browser has no location support.");
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
      () => setGeoError("Location is blocked. The game does not work without it."),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 },
    );
  }, []);

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
      setNote("No wallet found. Install MetaMask or open this in a wallet browser.");
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
      setNote("Wallet connection was refused.");
      setNoteOk(false);
    }
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
      label: city,
      count: list.length,
      symbols: list.slice(0, 3).map((s) => s.symbol),
      rarity: list.some((s) => s.rarity === "epic")
        ? "epic"
        : list.some((s) => s.rarity === "rare")
          ? "rare"
          : "common",
    }));
  }, [spawns]);

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
            ? `Caught ${active.amount} ${active.symbol}. Confirm the transfer in your wallet.`
            : `Caught ${active.amount} ${active.symbol}. The vault contract is not deployed yet, so this catch is recorded and will be settled on ${CHAIN.short} at launch.`,
        );
      }
    } catch {
      setNoteOk(false);
      setNote("The claim server did not answer. Try again.");
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
            me={fix ? { lat: fix.lat, lng: fix.lng } : undefined}
            focus={fix ? { lat: fix.lat, lng: fix.lng } : undefined}
            height={520}
          />
          <Panel className="mt-4">
            <h2 className="label-caps text-xs text-muted-foreground">Nearby drops</h2>
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
                      className="label-caps rounded-full px-2.5 py-1 text-[9px] text-primary-foreground"
                      style={{ background: rarityVar(s.rarity) }}
                    >
                      {RARITY_LABEL[s.rarity]}
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
            <h2 className="label-caps text-xs text-muted-foreground">Wallet</h2>
            {wallet ? (
              <p className="mt-2 break-all font-mono text-xs">{wallet}</p>
            ) : (
              <button
                onClick={connect}
                className="label-caps mt-3 w-full rounded-full bg-primary px-5 py-3 text-xs text-primary-foreground shadow-[var(--shadow-glossy)]"
              >
                Connect wallet
              </button>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              {CHAIN.name} · chain id {CHAIN.id}
            </p>
          </Panel>

          <Panel>
            <h2 className="label-caps text-xs text-muted-foreground">Location</h2>
            {fix ? (
              <>
                <p className="mt-2 font-mono text-xs">
                  {fix.lat.toFixed(5)}, {fix.lng.toFixed(5)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  ±{Math.round(fix.accuracy)} m · catch radius {Math.round(radius)} m ·{" "}
                  {samples.current.length} readings
                </p>
              </>
            ) : (
              <button
                onClick={startGeo}
                className="label-caps mt-3 w-full rounded-full bg-card px-5 py-3 text-xs shadow-[var(--shadow-pop)]"
              >
                Enable location
              </button>
            )}
            {geoError && <p className="mt-2 text-xs text-destructive">{geoError}</p>}
          </Panel>

          <Panel>
            <h2 className="label-caps text-xs text-muted-foreground">Selected drop</h2>
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
                    ? `${formatDistance(active.distance)} away`
                    : "Enable location to measure the distance."}
                </p>
                <button
                  onClick={onCatch}
                  disabled={!wallet || !fix || !inRange || busy}
                  className="label-caps mt-4 w-full rounded-full bg-primary px-5 py-3.5 text-xs text-primary-foreground shadow-[var(--shadow-glossy)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy
                    ? "Checking…"
                    : !wallet
                      ? "Connect a wallet first"
                      : !fix
                        ? "Enable location first"
                        : inRange
                          ? "Catch it"
                          : "Walk closer"}
                </button>
              </>
            ) : (
              <p className="mt-2 text-sm text-foreground/70">
                Pick a drop from the list to see the distance and the catch button.
              </p>
            )}
            {note && (
              <p className={`mt-3 text-sm ${noteOk ? "text-primary-foreground" : "text-destructive"}`}>
                {note}
              </p>
            )}
          </Panel>

          <Panel>
            <h2 className="label-caps text-xs text-muted-foreground">The rules</h2>
            <ul className="mt-3 space-y-2 text-xs leading-relaxed text-foreground/70">
              <li>· GPS accuracy under {RULES.maxAccuracyM} m.</li>
              <li>
                · Catch radius {RULES.baseRadiusM}–{RULES.maxRadiusM} m, scaled to your own error.
              </li>
              <li>
                · Keep the app open {RULES.minFixSeconds} s so the log has at least{" "}
                {RULES.minFixSamples} readings.
              </li>
              <li>· {RULES.perWalletPerDay} catches per wallet per day.</li>
              <li>· {RULES.walletCooldownMin} minutes between catches.</li>
            </ul>
          </Panel>
        </aside>
      </div>
    </div>
  );
}
