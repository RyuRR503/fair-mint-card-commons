import { createServerFn } from "@tanstack/react-start";
import { CN_CITIES, CITY_BY_KEY } from "@/lib/cities";
import { SYMBOL_BY_WIKIDATA, TOKEN_BY_SYMBOL, TOKENS } from "@/lib/tokens";

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

/**
 * Pull real store locations for one city out of OpenStreetMap and store them.
 * Matched on brand:wikidata so we only keep genuine branded outlets.
 */
export const importCityPlaces = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; city: string }) => d)
  .handler(async ({ data }) => {
    guard(data.token);
    const city = CITY_BY_KEY[data.city];
    if (!city) throw new Error(`Unknown city: ${data.city}`);

    const ids = Object.keys(SYMBOL_BY_WIKIDATA).join("|");
    const query = `[out:json][timeout:180];
nwr["brand:wikidata"~"^(${ids})$"](around:${city.radius},${city.lat},${city.lng});
out center 2000;`;

    const elements = await overpass(query);
    const rows = elements
      .map((el) => {
        const tags = el.tags ?? {};
        const symbol = SYMBOL_BY_WIKIDATA[tags["brand:wikidata"] ?? ""];
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

/**
 * Roll today's catchable signals onto a slice of the real stores.
 * Rarer tokens get fewer live signals per day.
 */
export const rollDailySpawns = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string }) => d)
  .handler(async ({ data }) => {
    guard(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const day = new Date().toISOString().slice(0, 10);
    const expires = new Date();
    expires.setUTCHours(23, 59, 59, 999);

    // how many signals go live per token per city, by rarity
    const perCity: Record<string, number> = {
      common: 6,
      rare: 3,
      epic: 2,
      legendary: 1,
    };

    let created = 0;
    for (const city of CN_CITIES) {
      for (const token of TOKENS) {
        const { data: places, error } = await supabaseAdmin
          .from("places")
          .select("id")
          .eq("city", city.key)
          .eq("symbol", token.symbol);
        if (error) throw new Error(error.message);
        if (!places?.length) continue;

        const want = Math.min(perCity[token.rarity] ?? 1, places.length);
        const picked = [...places].sort(() => Math.random() - 0.5).slice(0, want);
        const rows = picked.map((p) => ({
          id: `${day}-${p.id}`,
          place_id: p.id,
          symbol: token.symbol,
          amount: token.fragment,
          rarity: token.rarity,
          day,
          expires_at: expires.toISOString(),
        }));
        const { error: insErr } = await supabaseAdmin
          .from("spawns")
          .upsert(rows, { onConflict: "place_id,day", ignoreDuplicates: true });
        if (insErr) throw new Error(insErr.message);
        created += rows.length;
      }
    }
    return { day, created };
  });
