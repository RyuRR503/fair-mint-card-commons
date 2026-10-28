import { decodeEventLog } from "viem";
import { VAULT_ABI } from "./vault";

export type ReceiptClaim = { wallet: string; nonce: string; tokenAddress: string; amountWei: string };
export type ClaimReceipt = {
  status?: string;
  to?: string | null;
  logs?: { address: string; data: string; topics: string[]; removed?: boolean }[];
};

/** A submitted hash alone is not evidence of a payout. */
export function receiptMatchesClaim(receipt: ClaimReceipt | null, vault: string, claim: ReceiptClaim): boolean {
  if (!receipt || receipt.status !== "0x1" || receipt.to?.toLowerCase() !== vault.toLowerCase()) return false;
  return (receipt.logs ?? []).some((log) => {
    if (log.removed || log.address.toLowerCase() !== vault.toLowerCase()) return false;
    try {
      const event = decodeEventLog({
        abi: VAULT_ABI,
        data: log.data as `0x${string}`,
        topics: log.topics as [`0x${string}`, ...`0x${string}`[]],
        strict: true,
      });
      if (event.eventName !== "GameRewardClaimed") return false;
      const args = event.args as unknown as { to: string; stock: string; amount: bigint; nonce: bigint };
      return args.to.toLowerCase() === claim.wallet.toLowerCase()
        && args.stock.toLowerCase() === claim.tokenAddress.toLowerCase()
        && args.amount === BigInt(claim.amountWei)
        && args.nonce === BigInt(claim.nonce);
    } catch {
      return false;
    }
  });
}