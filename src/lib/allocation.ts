import type { Rarity } from "./tokens";

/** Target USD value of one claim, by rarity. */
export const TIER_USD: Record<Rarity, number> = {
  common: 5,
  rare: 10,
  epic: 20,
  legendary: 150,
};

/** Largest share of one stock's live points a single city may hold. */
export const CITY_CAP_SHARE = 0.3;
/** Guaranteed points per city (per stock) before the venue-weighted split. */
export const CITY_MIN = 1;

/** Shares per claim so each claim is worth its tier's USD value; falls back without a price. */
export function claimShares(rarity: Rarity, priceUsd: number | null, fallback: number): number {
  if (!priceUsd || priceUsd <= 0) return fallback;
  const raw = TIER_USD[rarity] / priceUsd;
  return Number(raw.toPrecision(3));
}

/** How many claims the live inventory can actually pay. */
export function payableClaims(inventory: number, shares: number): number {
  if (!(inventory > 0) || !(shares > 0)) return 0;
  return Math.floor(inventory / shares + 1e-9);
}

/** Stable pseudo-random rank for daily rotation. */
function rank(seed: string, id: string): number {
  let h = 2166136261;
  const s = seed + "|" + id;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export type Candidate = { id: string; city: string };

/**
 * Picks `budget` points for one stock: a minimum per city, then by venue count,
 * never more than CITY_CAP_SHARE of the budget in one city (unless nothing else is left).
 * `seed` (e.g. the date) rotates which venues are chosen each day.
 */
export function allocate(cands: Candidate[], budget: number, seed: string): Set<string> {
  const picked = new Set<string>();
  if (budget <= 0 || cands.length === 0) return picked;
  const byCity = new Map<string, Candidate[]>();
  for (const c of cands) {
    const l = byCity.get(c.city) ?? [];
    l.push(c);
    byCity.set(c.city, l);
  }
  for (const l of byCity.values()) l.sort((a, b) => rank(seed, a.id) - rank(seed, b.id));
  const cities = [...byCity.keys()].sort((a, b) => rank(seed, a) - rank(seed, b));
  const used = new Map<string, number>(cities.map((c) => [c, 0]));
  const take = (city: string) => {
    const n = used.get(city)!;
    picked.add(byCity.get(city)![n]!.id);
    used.set(city, n + 1);
  };
  const cap = Math.max(CITY_MIN, Math.floor(budget * CITY_CAP_SHARE));
  // 1. minimum per city
  for (let r = 0; r < CITY_MIN; r++)
    for (const c of cities) {
      if (picked.size >= budget) return picked;
      if (used.get(c)! < byCity.get(c)!.length) take(c);
    }
  // 2. venue-weighted fill, respecting the cap; then relax cap if venues run out
  for (const capped of [true, false]) {
    while (picked.size < budget) {
      let best: string | null = null;
      let score = -1;
      for (const c of cities) {
        const n = used.get(c)!;
        const total = byCity.get(c)!.length;
        if (n >= total || (capped && n >= cap)) continue;
        const s = total / (n + 1);
        if (s > score) { score = s; best = c; }
      }
      if (!best) break;
      take(best);
    }
  }
  return picked;
}
