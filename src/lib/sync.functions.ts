import { createServerFn } from "@tanstack/react-start";
import { CN_CITIES, CITY_BY_KEY } from "@/lib/cities";
import { SYMBOL_BY_WIKIDATA, TOKEN_BY_SYMBOL, MAP_TOKENS, COOLDOWN_MIN } from "@/lib/tokens";

const OVERPASS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

type OverpassEl = {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

function guard(token: string) {
  const expected = process.env["SYNC_TOKEN"];
  if (!expected || token !== expected) throw new Error("Forbidden");
}

async function overpass(query: string): Promise<OverpassEl[]> {
  let lastError = "";
  for (const url of OVERPASS) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "CatchOnChain/1.0 (real-store map importer; contact via catch.app)",
        },
        body: `data=${encodeURIComponent(query)}`,
      });
      if (!res.ok) {
        lastError = `${res.status} ${await res.text()}`;
        continue;
      }
      const json = (await res.json()) as { elements?: OverpassEl[] };
      return json.elements ?? [];
    } catch (e) {
      lastError = String(e);
    }
  }
  throw new Error(`Overpass unreachable: ${lastError}`);
}

/** name/brand fallback matchers, for brands with no reliable wikidata tag */
const NAME_MATCHERS = MAP_TOKENS.filter((t) => t.brands.length).map((t) => ({
  symbol: t.symbol,
  re: new RegExp(t.brands.join("|"), "i"),
}));

function symbolFor(tags: Record<string, string>): string | null {
  const byWiki = SYMBOL_BY_WIKIDATA[tags["brand:wikidata"] ?? ""];
  if (byWiki) return byWiki;
  const text = [tags["brand"], tags["brand:en"], tags["brand:zh"], tags["name"], tags["name:en"], tags["name:zh"]]
    .filter(Boolean)
    .join(" | ");
  if (!text) return null;
  for (const m of NAME_MATCHERS) if (m.re.test(text)) return m.symbol;
  return null;
}

/**
 * Pull real store locations for one city out of OpenStreetMap and store them.
 * Matched on brand:wikidata first, then on brand/name for local chains.
 */
export const importCityPlaces = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; city: string }) => d)
  .handler(async ({ data }) => {
    guard(data.token);
    const city = CITY_BY_KEY[data.city];
    if (!city) throw new Error(`Unknown city: ${data.city}`);

    const ids = Object.keys(SYMBOL_BY_WIKIDATA).join("|");
    const namePattern = MAP_TOKENS.flatMap((t) => t.brands).join("|");
    const area = `(around:${city.radius},${city.lat},${city.lng})`;
    const query = `[out:json][timeout:180];
(
  nwr["brand:wikidata"~"^(${ids})$"]${area};
  nwr["brand"~"${namePattern}",i]${area};
  nwr["name"~"${namePattern}",i]${area};
);
out center 3000;`;

    const elements = await overpass(query);
    const rows = elements
      .map((el) => {
        const tags = el.tags ?? {};
        const symbol = symbolFor(tags);
        const lat = el.lat ?? el.center?.lat;
        const lng = el.lon ?? el.center?.lon;
        if (!symbol || lat == null || lng == null) return null;
        const token = TOKEN_BY_SYMBOL[symbol]!;
        return {
          osm_type: el.type,
          osm_id: el.id,
          symbol,
          brand: tags["brand"] ?? tags["brand:en"] ?? token.name,
          name: tags["name"] ?? tags["name:zh"] ?? tags["brand"] ?? token.nameZh,
          city: city.key,
          country: city.country,
          lat,
          lng,
        };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    for (let i = 0; i < rows.length; i += 500) {
      const { error } = await supabaseAdmin
        .from("places")
        .upsert(rows.slice(i, i + 500), { onConflict: "osm_type,osm_id" });
      if (error) throw new Error(error.message);
    }
    return { city: city.key, found: elements.length, stored: rows.length };
  });

/** How many permanent drops each token gets per city, by rarity. */
const PER_CITY: Record<string, number> = { common: 14, rare: 7, epic: 3, legendary: 1 };

/**
 * Seed the permanent drop points. Each drop lives on one real store forever;
 * catching it puts it on cooldown and it comes back by itself.
 */
export const seedSpawns = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; city?: string }) => d)
  .handler(async ({ data }) => {
    guard(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const cities = data.city && data.city !== "all" ? [CITY_BY_KEY[data.city]!] : CN_CITIES;

    let created = 0;
    for (const city of cities) {
      if (!city) continue;
      for (const token of MAP_TOKENS) {
        const { data: places, error } = await supabaseAdmin
          .from("places")
          .select("id")
          .eq("city", city.key)
          .eq("symbol", token.symbol);
        if (error) throw new Error(error.message);
        if (!places?.length) continue;

        const want = Math.min(PER_CITY[token.rarity] ?? 1, places.length);
        const picked = [...places].sort(() => Math.random() - 0.5).slice(0, want);
        const rows = picked.map((p) => ({
          id: `sp-${p.id}`,
          place_id: p.id,
          symbol: token.symbol,
          amount: token.fragment,
          rarity: token.rarity,
          cooldown_min: COOLDOWN_MIN[token.rarity],
          day: null,
          expires_at: null,
          respawn_at: null,
        }));
        const { error: insErr } = await supabaseAdmin
          .from("spawns")
          .upsert(rows, { onConflict: "place_id", ignoreDuplicates: true });
        if (insErr) throw new Error(insErr.message);
        created += rows.length;
      }
    }
    return { cities: cities.length, created };
  });
