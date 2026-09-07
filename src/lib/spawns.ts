import { TOKENS, type Rarity } from "./tokens";

export type City = {
  name: string;
  country: string;
  lat: number;
  lng: number;
};

export type Spawn = {
  id: string;
  symbol: string;
  amount: number;
  rarity: Rarity;
  city: string;
  country: string;
  place: string;
  lat: number;
  lng: number;
};

export const CITIES: City[] = [
  { name: "Paris", country: "France", lat: 48.8566, lng: 2.3522 },
  { name: "Lyon", country: "France", lat: 45.764, lng: 4.8357 },
  { name: "Bordeaux", country: "France", lat: 44.8378, lng: -0.5792 },
  { name: "Lille", country: "France", lat: 50.6292, lng: 3.0573 },
  { name: "Nantes", country: "France", lat: 47.2184, lng: -1.5536 },
  { name: "Toulouse", country: "France", lat: 43.6047, lng: 1.4442 },
  { name: "Marseille", country: "France", lat: 43.2965, lng: 5.3698 },
  { name: "London", country: "United Kingdom", lat: 51.5072, lng: -0.1276 },
  { name: "Manchester", country: "United Kingdom", lat: 53.4808, lng: -2.2426 },
  { name: "Glasgow", country: "United Kingdom", lat: 55.8642, lng: -4.2518 },
  { name: "Dublin", country: "Ireland", lat: 53.3498, lng: -6.2603 },
  { name: "Amsterdam", country: "Netherlands", lat: 52.3676, lng: 4.9041 },
  { name: "Brussels", country: "Belgium", lat: 50.8503, lng: 4.3517 },
  { name: "Berlin", country: "Germany", lat: 52.52, lng: 13.405 },
  { name: "Munich", country: "Germany", lat: 48.1351, lng: 11.582 },
  { name: "Cologne", country: "Germany", lat: 50.9375, lng: 6.9603 },
  { name: "Hamburg", country: "Germany", lat: 53.5511, lng: 9.9937 },
  { name: "Zurich", country: "Switzerland", lat: 47.3769, lng: 8.5417 },
  { name: "Vienna", country: "Austria", lat: 48.2082, lng: 16.3738 },
  { name: "Milan", country: "Italy", lat: 45.4642, lng: 9.19 },
  { name: "Rome", country: "Italy", lat: 41.9028, lng: 12.4964 },
  { name: "Turin", country: "Italy", lat: 45.0703, lng: 7.6869 },
  { name: "Madrid", country: "Spain", lat: 40.4168, lng: -3.7038 },
  { name: "Barcelona", country: "Spain", lat: 41.3874, lng: 2.1686 },
  { name: "Lisbon", country: "Portugal", lat: 38.7223, lng: -9.1393 },
  { name: "Stockholm", country: "Sweden", lat: 59.3293, lng: 18.0686 },
  { name: "Oslo", country: "Norway", lat: 59.9139, lng: 10.7522 },
  { name: "Copenhagen", country: "Denmark", lat: 55.6761, lng: 12.5683 },
  { name: "Helsinki", country: "Finland", lat: 60.1699, lng: 24.9384 },
  { name: "Warsaw", country: "Poland", lat: 52.2297, lng: 21.0122 },
  { name: "Prague", country: "Czechia", lat: 50.0755, lng: 14.4378 },
  { name: "Budapest", country: "Hungary", lat: 47.4979, lng: 19.0402 },
  { name: "Athens", country: "Greece", lat: 37.9838, lng: 23.7275 },
  { name: "Istanbul", country: "Türkiye", lat: 41.0082, lng: 28.9784 },
  { name: "Dubai", country: "UAE", lat: 25.2048, lng: 55.2708 },
  { name: "Riyadh", country: "Saudi Arabia", lat: 24.7136, lng: 46.6753 },
  { name: "Tel Aviv", country: "Israel", lat: 32.0853, lng: 34.7818 },
  { name: "Cairo", country: "Egypt", lat: 30.0444, lng: 31.2357 },
  { name: "Lagos", country: "Nigeria", lat: 6.5244, lng: 3.3792 },
  { name: "Nairobi", country: "Kenya", lat: -1.2864, lng: 36.8172 },
  { name: "Johannesburg", country: "South Africa", lat: -26.2041, lng: 28.0473 },
  { name: "Mumbai", country: "India", lat: 19.076, lng: 72.8777 },
  { name: "Delhi", country: "India", lat: 28.6139, lng: 77.209 },
  { name: "Bangalore", country: "India", lat: 12.9716, lng: 77.5946 },
  { name: "Hyderabad", country: "India", lat: 17.385, lng: 78.4867 },
  { name: "Singapore", country: "Singapore", lat: 1.3521, lng: 103.8198 },
  { name: "Kuala Lumpur", country: "Malaysia", lat: 3.139, lng: 101.6869 },
  { name: "Bangkok", country: "Thailand", lat: 13.7563, lng: 100.5018 },
  { name: "Jakarta", country: "Indonesia", lat: -6.2088, lng: 106.8456 },
  { name: "Manila", country: "Philippines", lat: 14.5995, lng: 120.9842 },
  { name: "Ho Chi Minh City", country: "Vietnam", lat: 10.8231, lng: 106.6297 },
  { name: "Hong Kong", country: "Hong Kong", lat: 22.3193, lng: 114.1694 },
  { name: "Macau", country: "China", lat: 22.1987, lng: 113.5439 },
  { name: "Shanghai", country: "China", lat: 31.2304, lng: 121.4737 },
  { name: "Beijing", country: "China", lat: 39.9042, lng: 116.4074 },
  { name: "Shenzhen", country: "China", lat: 22.5431, lng: 114.0579 },
  { name: "Guangzhou", country: "China", lat: 23.1291, lng: 113.2644 },
  { name: "Hangzhou", country: "China", lat: 30.2741, lng: 120.1551 },
  { name: "Chengdu", country: "China", lat: 30.5728, lng: 104.0668 },
  { name: "Chongqing", country: "China", lat: 29.5630, lng: 106.5516 },
  { name: "Xi'an", country: "China", lat: 34.3416, lng: 108.9398 },
  { name: "Wuhan", country: "China", lat: 30.5928, lng: 114.3055 },
  { name: "Nanjing", country: "China", lat: 32.0603, lng: 118.7969 },
  { name: "Suzhou", country: "China", lat: 31.2989, lng: 120.5853 },
  { name: "Tianjin", country: "China", lat: 39.3434, lng: 117.3616 },
  { name: "Qingdao", country: "China", lat: 36.0671, lng: 120.3826 },
  { name: "Xiamen", country: "China", lat: 24.4798, lng: 118.0894 },
  { name: "Changsha", country: "China", lat: 28.2282, lng: 112.9388 },
  { name: "Kunming", country: "China", lat: 25.0389, lng: 102.7183 },
  { name: "Shenyang", country: "China", lat: 41.8057, lng: 123.4315 },
  { name: "Zhengzhou", country: "China", lat: 34.7466, lng: 113.6254 },
  { name: "Taipei", country: "Taiwan", lat: 25.033, lng: 121.5654 },

  { name: "Seoul", country: "South Korea", lat: 37.5665, lng: 126.978 },
  { name: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503 },
  { name: "Osaka", country: "Japan", lat: 34.6937, lng: 135.5023 },
  { name: "Sydney", country: "Australia", lat: -33.8688, lng: 151.2093 },
  { name: "Melbourne", country: "Australia", lat: -37.8136, lng: 144.9631 },
  { name: "Brisbane", country: "Australia", lat: -27.4698, lng: 153.0251 },
  { name: "Auckland", country: "New Zealand", lat: -36.8485, lng: 174.7633 },
  { name: "New York", country: "United States", lat: 40.7128, lng: -74.006 },
  { name: "Boston", country: "United States", lat: 42.3601, lng: -71.0589 },
  { name: "Philadelphia", country: "United States", lat: 39.9526, lng: -75.1652 },
  { name: "Washington DC", country: "United States", lat: 38.9072, lng: -77.0369 },
  { name: "Miami", country: "United States", lat: 25.7617, lng: -80.1918 },
  { name: "Atlanta", country: "United States", lat: 33.749, lng: -84.388 },
  { name: "Chicago", country: "United States", lat: 41.8781, lng: -87.6298 },
  { name: "Denver", country: "United States", lat: 39.7392, lng: -104.9903 },
  { name: "Austin", country: "United States", lat: 30.2672, lng: -97.7431 },
  { name: "Dallas", country: "United States", lat: 32.7767, lng: -96.797 },
  { name: "Las Vegas", country: "United States", lat: 36.1699, lng: -115.1398 },
  { name: "Los Angeles", country: "United States", lat: 34.0522, lng: -118.2437 },
  { name: "San Francisco", country: "United States", lat: 37.7749, lng: -122.4194 },
  { name: "Seattle", country: "United States", lat: 47.6062, lng: -122.3321 },
  { name: "Portland", country: "United States", lat: 45.5152, lng: -122.6784 },
  { name: "Toronto", country: "Canada", lat: 43.6532, lng: -79.3832 },
  { name: "Montreal", country: "Canada", lat: 45.5019, lng: -73.5674 },
  { name: "Vancouver", country: "Canada", lat: 49.2827, lng: -123.1207 },
  { name: "Mexico City", country: "Mexico", lat: 19.4326, lng: -99.1332 },
  { name: "São Paulo", country: "Brazil", lat: -23.5505, lng: -46.6333 },
  { name: "Rio de Janeiro", country: "Brazil", lat: -22.9068, lng: -43.1729 },
  { name: "Buenos Aires", country: "Argentina", lat: -34.6037, lng: -58.3816 },
  { name: "Santiago", country: "Chile", lat: -33.4489, lng: -70.6693 },
  { name: "Bogotá", country: "Colombia", lat: 4.711, lng: -74.0721 },
  { name: "Lima", country: "Peru", lat: -12.0464, lng: -77.0428 },
];

const PLACE_TEMPLATES: Record<string, string[]> = {
  AAPL: ["Apple Store", "Apple {city}", "Apple Downtown"],
  GOOGL: ["Google Office", "Google Cloud Hub", "Google {city}"],
  AMZN: ["Amazon Hub Locker", "Amazon Fresh", "Amazon Delivery Station"],
  META: ["Meta Office", "Meta Lab {city}"],
  MSFT: ["Microsoft Office", "Microsoft Experience Centre"],
  TSLA: ["Tesla Supercharger", "Tesla Store", "Tesla Service {city}"],
  GME: ["GameStop", "GameStop Mall", "GameStop {city}"],
  NVDA: ["Nvidia Office", "Nvidia HQ"],
};

/** Deterministic pseudo-random so server and client agree. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

let cache: Spawn[] | null = null;

/** The full spawn table. Same output everywhere, refreshed daily by the keeper. */
export function allSpawns(): Spawn[] {
  if (cache) return cache;
  const out: Spawn[] = [];
  const pool = TOKENS.filter((t) => t.rarity !== "legendary");

  CITIES.forEach((city, ci) => {
    const rand = rng(hash(city.name) + 7);
    const count = 6 + Math.floor(rand() * 5); // 6..10 drops per city
    for (let i = 0; i < count; i++) {
      const token = pool[Math.floor(rand() * pool.length)]!;
      const templates = PLACE_TEMPLATES[token.symbol] ?? ["{city} Spot"];
      const place = (templates[Math.floor(rand() * templates.length)] ?? "{city} Spot").replace(
      
        "{city}",
        city.name,
      );
      out.push({
        id: `${city.name.toLowerCase().replace(/[^a-z]+/g, "-")}-${i}`,
        symbol: token.symbol,
        amount: token.fragment,
        rarity: token.rarity,
        city: city.name,
        country: city.country,
        place,
        lat: city.lat + (rand() - 0.5) * 0.11,
        lng: city.lng + (rand() - 0.5) * 0.16,
      });
    }
    void ci;
  });

  // One legendary: a whole NVDA share, monthly event.
  out.push({
    id: "legendary-nvda-santa-clara",
    symbol: "NVDA",
    amount: 1,
    rarity: "legendary",
    city: "Santa Clara",
    country: "United States",
    place: "Nvidia Voyager HQ",
    lat: 37.3708,
    lng: -121.9631,
  });

  cache = out;
  return out;
}

export function spawnsByCity() {
  const map = new Map<string, { city: City; spawns: Spawn[] }>();
  for (const s of allSpawns()) {
    const city = CITIES.find((c) => c.name === s.city);
    if (!city) continue;
    const entry = map.get(s.city) ?? { city, spawns: [] };
    entry.spawns.push(s);
    map.set(s.city, entry);
  }
  return [...map.values()].sort((a, b) => b.spawns.length - a.spawns.length);
}

export const TOTAL_SPAWNS = allSpawns().length;
export const TOTAL_CITIES = CITIES.length;
