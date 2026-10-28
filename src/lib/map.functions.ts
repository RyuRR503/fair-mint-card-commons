import { createServerFn } from "@tanstack/react-start";
import { CN_CITIES } from "@/lib/cities";
import { TOKEN_BY_SYMBOL } from "@/lib/tokens";
import type { CityPin, Rarity } from "@/lib/spawns";
import { createBoundedRead } from "@/lib/bounded-read";
import { dbSnapshotStore, readSnapshot } from "@/lib/display-snapshot";

const RANK: Record<Rarity, number> = { common: 0, rare: 1, epic: 2, legendary: 3 };

const today = () => new Date().toISOString().slice(0, 10);

/** A drop is live when it has never been caught or its cooldown has expired. */
export const OPEN_FILTER = () => `respawn_at.is.null,respawn_at.lte.${new Date().toISOString()}`;

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/**
 * PostgREST caps a single response at 1000 rows, so page through the open
 * spawns instead of trusting one .limit() call.
 */
async function allOpenSpawns(select: string, signal: AbortSignal, max = 6000) {
  const supabaseAdmin = await admin();
  const page = 1000;
  const out: unknown[] = [];
  for (let from = 0; from < max; from += page) {
    const { data, error } = await supabaseAdmin
      .from("spawns")
      .select(select)
      .or(OPEN_FILTER())
      .order("id")
      .range(from, from + page - 1)
      .abortSignal(signal);
    if (error) throw new Error(error.message);
    const rows = data ?? [];
    out.push(...rows);
    if (rows.length < page) break;
  }
  return out;
}

/**
 * Public: light summary for the first paint — city bubbles and counters only.
 * The per-store signals are a separate, bigger payload (getMapPoints) so the
 * page can render before they arrive.
 */
async function loadMapSummary(signal: AbortSignal) {
  const supabaseAdmin = await admin();
  const day = today();

  type Row = { symbol: string; rarity: string | null; places: { city: string } };
  // These independent reads share the deadline; serial network round trips
  // previously exhausted it even when each query itself was fast.
  const [openRows, places] = await Promise.all([
    allOpenSpawns("symbol, rarity, places!inner(city)", signal),
    supabaseAdmin.from("places").select("id", { count: "exact", head: true }).abortSignal(signal),
  ]);
  if (places.error) throw new Error("Place count unavailable");
  const rows = openRows as unknown as Row[];

  const byCity = new Map<string, { count: number; symbols: Set<string>; rarity: Rarity }>();
  for (const row of rows) {
    const city = row.places.city;
    const entry = byCity.get(city) ?? { count: 0, symbols: new Set<string>(), rarity: "common" as Rarity };
    entry.count += 1;
    entry.symbols.add(row.symbol);
    const r = (row.rarity ?? "common") as Rarity;
    if ((RANK[r] ?? 0) > (RANK[entry.rarity] ?? 0)) entry.rarity = r;
    byCity.set(city, entry);
  }

  const pins: CityPin[] = CN_CITIES.flatMap((c) => {
    const e = byCity.get(c.key);
    if (!e) return [];
    return [{
      key: c.key,
      name: c.name,
      nameZh: c.nameZh,
      lat: c.lat,
      lng: c.lng,
      count: e.count,
      symbols: [...e.symbols].slice(0, 3),
      rarity: e.rarity,
    }];
  });

  return {
    pins,
    totalSpawns: rows.length,
    totalCities: pins.length,
    totalPlaces: places.count ?? 0,
    tokens: Object.keys(TOKEN_BY_SYMBOL).length,
    day,
    available: true,
  };
}

const readSummary = createBoundedRead<Awaited<ReturnType<typeof loadMapSummary>>>(20_000, 15_000, 5_000);

export const getMapSummary = createServerFn({ method: "GET" }).handler(async () => {
  try {
    return await readSummary((sig) => readSnapshot(dbSnapshotStore(), "map-summary", loadMapSummary, sig));
  } catch (error) {
    console.warn("[map-summary] Public data unavailable", error instanceof Error ? error.name : "ReadFailure");
    return { pins: [] as CityPin[], totalSpawns: 0, totalCities: 0, totalPlaces: 0,
      tokens: Object.keys(TOKEN_BY_SYMBOL).length, day: today(), available: false };
  }
});

/** Every individual signal, fetched by the browser once the map is on screen. */
async function loadMapPoints(signal: AbortSignal) {
  type Row = {
    id: string;
    symbol: string;
    amount: number | string;
    rarity: string | null;
    places: { name: string; city: string; lat: number; lng: number };
  };

  const rows = (await allOpenSpawns(
    "id, symbol, amount, rarity, respawn_at, places!inner(name, city, lat, lng)",
    signal,
  )) as unknown as Row[];

  return rows.map((r) => ({
    id: r.id,
    symbol: r.symbol,
    amount: TOKEN_BY_SYMBOL[r.symbol]?.fragment ?? Number(r.amount),
    rarity: (r.rarity ?? "common") as Rarity,
    place: r.places.name,
    cityKey: r.places.city,
    expiresAt: null as string | null,
    lat: r.places.lat,
    lng: r.places.lng,
  }));
}

const readPoints = createBoundedRead<Awaited<ReturnType<typeof loadMapPoints>>>(20_000, 15_000, 5_000);
export const getMapPoints = createServerFn({ method: "GET" }).handler(async () => {
  return readPoints((sig) => readSnapshot(dbSnapshotStore(), "map-points", loadMapPoints, sig));
});
