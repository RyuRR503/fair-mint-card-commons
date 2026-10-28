/**
 * Whole-site payout ceiling over a time window (rolling hour or rolling 24h).
 * Prices come from the same on-chain book that sizes claims (Chainlink or
 * PancakeSwap pool). A missing price fails closed.
 */
export function payoutCapCheck(
  recent: { symbol: string; amount: number | string }[],
  next: { symbol: string; amount: number },
  price: Record<string, number | null | undefined>,
  capUsd: number,
): { ok: true; spentUsd: number } | { ok: false; reason: "price" | "cap"; spentUsd: number } {
  let spentUsd = 0;
  for (const c of [...recent, next]) {
    const p = price[c.symbol];
    if (p == null || !Number.isFinite(p) || p <= 0) return { ok: false, reason: "price", spentUsd };
    spentUsd += Number(c.amount) * p;
  }
  return spentUsd > capUsd ? { ok: false, reason: "cap", spentUsd } : { ok: true, spentUsd };
}

/** Back-compat alias: the hourly window uses the same spend-cap check. */
export const hourlyCapCheck = payoutCapCheck;

/**
 * Display-only budget status for a rolling window: how much is spent and, when
 * fewer than `minNextUsd` remain, when enough old payouts roll out of the window.
 */
export function budgetStatus(
  rows: { symbol: string; amount: number | string; created_at: string }[],
  price: Record<string, number | null | undefined>,
  capUsd: number,
  windowMs: number,
  minNextUsd: number,
): { spentUsd: number; capUsd: number; freesAtMs: number | null } {
  const items = rows
    .map((r) => ({ t: new Date(r.created_at).getTime(), usd: Number(r.amount) * (price[r.symbol] ?? 0) }))
    .sort((a, b) => a.t - b.t);
  let spent = items.reduce((s, i) => s + i.usd, 0);
  const spentUsd = spent;
  if (capUsd - spent >= minNextUsd) return { spentUsd, capUsd, freesAtMs: null };
  for (const i of items) {
    spent -= i.usd;
    if (capUsd - spent >= minNextUsd) return { spentUsd, capUsd, freesAtMs: i.t + windowMs };
  }
  return { spentUsd, capUsd, freesAtMs: null };
}
