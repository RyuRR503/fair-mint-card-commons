/** Where a claim code is in its life, as shown to the person who got it on site. */
export type ClaimPhase = "waiting" | "expired" | "processing" | "claimed" | "lapsed";

export function claimPhase(s: {
  now: number; // ms
  codeExpiresAt: number; // ms
  codeUsed: boolean; // AI traded it for a voucher
  txHash: string | null;
  nonceUsedOnChain: boolean;
  voucherDeadline: number | null; // ms
}): ClaimPhase {
  if (!s.codeUsed) return s.now > s.codeExpiresAt ? "expired" : "waiting";
  if (s.txHash || s.nonceUsedOnChain) return "claimed";
  if (s.voucherDeadline != null && s.now > s.voucherDeadline) return "lapsed";
  return "processing";
}

/** Phases that can still change, so the page keeps checking. */
export const isPending = (p: ClaimPhase) => p === "waiting" || p === "processing";
