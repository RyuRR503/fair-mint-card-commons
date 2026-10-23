import type { Rarity } from "@/lib/tokens";

/** Presentation policy only; not an on-chain identity check. */
export const AGENT_CLAIMS = {
  integrationReady: false,
  commandTtlMinutes: 15,
  requiredWallet: "Binance Agentic Wallet",
} as const;

export function claimEligibility(rarity: Rarity, walletKind: "ordinary" | "agent") {
  const supported = ["common", "rare", "epic", "legendary"].includes(rarity);
  if (!supported || walletKind !== "agent") return "agent-required";
  return AGENT_CLAIMS.integrationReady ? "ready" : "integration-pending";
}