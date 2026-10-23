import { describe, expect, it } from "vitest";
import { claimPhase, isPending } from "./claim-status";

const base = { now: 1000, codeExpiresAt: 2000, codeUsed: false, txHash: null, nonceUsedOnChain: false, voucherDeadline: null };

describe("claimPhase", () => {
  it("unused code before expiry waits for the AI", () => expect(claimPhase(base)).toBe("waiting"));
  it("unused code after 15 minutes is expired", () => expect(claimPhase({ ...base, now: 3000 })).toBe("expired"));
  it("redeemed code without a chain claim is processing", () => expect(claimPhase({ ...base, codeUsed: true, voucherDeadline: 5000 })).toBe("processing"));
  it("nonce burned on chain counts as received", () => expect(claimPhase({ ...base, codeUsed: true, nonceUsedOnChain: true })).toBe("claimed"));
  it("voucher past its deadline and never used has lapsed", () => expect(claimPhase({ ...base, codeUsed: true, now: 6000, voucherDeadline: 5000 })).toBe("lapsed"));
  it("only waiting and processing keep polling", () => {
    expect(isPending("processing")).toBe(true);
    expect(isPending("claimed")).toBe(false);
  });
});
