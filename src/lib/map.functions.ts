import { createServerFn } from "@tanstack/react-start";
import { CN_CITIES } from "@/lib/cities";
import { TOKEN_BY_SYMBOL } from "@/lib/tokens";
import type { CityPin, Rarity } from "@/lib/spawns";

const RANK: Record<Rarity, number> = { common: 0, rare: 1, epic: 2, legendary: 3 };

/** Public: today's live signals grouped per city, for the world map. */
export const getMapSummary = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const day = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabaseAdmin
    .from("spawns")
    .select("symbol, rarity, claimed_by, places!inner(name, city, lat, lng)")
    .eq("day", day)
    .is("claimed_by", null)
    .limit(3000);
  if (error) throw new Error(error.message);

  const byCity = new Map<string, { count: number; symbols: Set<string>; rarity: Rarity }>();
  for (const row of data ?? []) {
    const city = (row as unknown as { places: { city: string } }).places.city;
    const entry = byCity.get(city) ?? { count: 0, symbols: new Set<string>(), rarity: "common" as Rarity };
    entry.count += 1;
    entry.symbols.add(row.symbol);
    const r = (row.rarity ?? "common") as Rarity;
    if ((RANK[r] ?? 0) > (RANK[entry.rarity] ?? 0)) entry.rarity = r;
    byCity.set(city, entry);
  }

  const pins: CityPin[] = CN_CITIES.filter((c) => byCity.has(c.key)).map((c) => {
    const e = byCity.get(c.key)!;
    return {
      key: c.key,
      name: c.name,
      nameZh: c.nameZh,
      lat: c.lat,
      lng: c.lng,
      count: e.count,
      symbols: [...e.symbols].slice(0, 3),
      rarity: e.rarity,
    };
  });

  const { count: placeCount } = await supabaseAdmin
    .from("places")
    .select("id", { count: "exact", head: true });

  return {
    pins,
    totalSpawns: data?.length ?? 0,
    totalCities: pins.length,
    totalPlaces: placeCount ?? 0,
    tokens: Object.keys(TOKEN_BY_SYMBOL).length,
    day,
  };
});
