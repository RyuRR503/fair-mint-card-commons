import { createServerFn } from "@tanstack/react-start";
import { CN_CITIES, CITY_BY_KEY } from "@/lib/cities";
import { TOKEN_BY_SYMBOL, MAP_TOKENS, COOLDOWN_MIN } from "@/lib/tokens";

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
          "User-Agent": "CatchOnChain/1.0 (real-venue map importer; contact via catch.app)",
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

const TESLA = /tesla|特斯拉/i;
const APPLE = /apple/i;
const ANDROID = /华为|huawei|小米|xiaomi|oppo|vivo|荣耀|honor|一加|oneplus|realme|魅族|meizu/i;
const SCIENCE = /科技馆|科学馆|科学技术馆|天文|航天|planetarium|science|technology/i;

/**
 * Map a real-world place to the stock it belongs to. GPUs live in internet
 * cafés, memory in phone shops, chips in computer malls, and so on.
 */
function symbolFor(tags: Record<string, string>): string | null {
  const text = [
    tags["brand"],
    tags["brand:en"],
    tags["brand:zh"],
    tags["name"],
    tags["name:en"],
    tags["name:zh"],
    tags["operator"],
  ]
    .filter(Boolean)
    .join(" | ");
  const shop = tags["shop"];
  const amenity = tags["amenity"];

  if (amenity === "charging_station" || shop === "car") {
    return TESLA.test(text) ? "TSLAON" : null;
  }
  if (tags["tourism"] === "museum" || amenity === "planetarium") {
    const isSpace =
      amenity === "planetarium" ||
      tags["museum"] === "science" ||
      tags["museum"] === "technology" ||
      SCIENCE.test(text);
    return isSpace ? "SPCXON" : null;
  }
  if (
    APPLE.test(text) &&
    (tags["brand:wikidata"] === "Q421253" ||
      shop === "mobile_phone" ||
      shop === "computer" ||
      shop === "electronics")
  ) {
    return "AAPLON";
  }
  if (shop === "mobile_phone") return ANDROID.test(text) ? "GOOGLON" : "MUON";
  if (amenity === "internet_cafe" || tags["leisure"] === "adult_gaming_centre") return "NVDAON";
  if (tags["office"] === "financial" || tags["office"] === "insurance") return "SPYB";
  if (shop === "video_games" || shop === "stationery") return "MSFTON";
  if (amenity === "bank") return "FXION";
  return null;
}

/**
 * Pull real venues for one city out of OpenStreetMap and store them.
 * Banks, internet cafés, computer malls, phone shops, Tesla chargers,
 * gaming/office counters, Android flagships, Apple stores and science museums.
 */
export const importCityPlaces = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; city: string }) => d)
  .handler(async ({ data }) => {
    guard(data.token);
    const city = CITY_BY_KEY[data.city];
    if (!city) throw new Error(`Unknown city: ${data.city}`);

    const area = `(around:${city.radius},${city.lat},${city.lng})`;
    const filters = [
      'nwr["amenity"="bank"]',
      'nwr["amenity"="internet_cafe"]',
      'nwr["leisure"="adult_gaming_centre"]',
      'nwr["shop"="computer"]',
      'nwr["shop"="electronics"]',
      'nwr["office"="financial"]',
      'nwr["office"="insurance"]',
      'nwr["shop"="mobile_phone"]',
      'nwr["shop"="video_games"]',
      'nwr["shop"="stationery"]',
      'nwr["amenity"="charging_station"]',
      'nwr["tourism"="museum"]',
      'nwr["amenity"="planetarium"]',
      'nwr["brand"~"Apple",i]',
    ]
      .map((f) => `  ${f}${area};`)
      .join("\n");
    const query = `[out:json][timeout:180];\n(\n${filters}\n);\nout center 4000;`;

    const elements = await overpass(query);
    const rows = elements
      .map((el) => {
        const tags = el.tags ?? {};
        const symbol = symbolFor(tags);
        const lat = el.lat ?? el.center?.lat;
        const lngVal = el.lon ?? el.center?.lon;
        if (!symbol || lat == null || lngVal == null) return null;

        const token = TOKEN_BY_SYMBOL[symbol]!;
        return {
          osm_type: el.type,
          osm_id: el.id,
          symbol,
          brand: tags["brand"] ?? tags["brand:zh"] ?? tags["brand:en"] ?? token.name,
          name: tags["name"] ?? tags["name:zh"] ?? tags["brand"] ?? token.venueZh,
          city: city.key,
          country: city.country,
          lat,
          lng: lngVal,
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
const PER_CITY: Record<string, number> = { common: 12, rare: 6, epic: 3, legendary: 1 };

/**
 * Seed the permanent drop points. Each drop lives on one real venue forever;
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
