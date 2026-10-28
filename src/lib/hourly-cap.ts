/**
 * Whole-site hourly payout ceiling. Prices come from the same on-chain book that
 * sizes claims (Chainlink or PancakeSwap pool). A missing price fails closed.
 */
export function hourlyCapCheck(
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
