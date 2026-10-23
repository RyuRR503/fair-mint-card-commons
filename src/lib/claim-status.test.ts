import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { claimPhase, isPending } from "./claim-status";

const base = { now: 1000, codeExpiresAt: 2000, codeUsed: false, txHash: null, nonceUsedOnChain: false, voucherDeadline: null };

describe("claimPhase", () => {
  it("unused code before expiry waits for the AI", () => assert.equal(claimPhase(base), "waiting"));
  it("unused code after 15 minutes is expired", () => assert.equal(claimPhase({ ...base, now: 3000 }), "expired"));
  it("redeemed code without a chain claim is processing", () => assert.equal(claimPhase({ ...base, codeUsed: true, voucherDeadline: 5000 }), "processing"));
  it("nonce burned on chain counts as received", () => assert.equal(claimPhase({ ...base, codeUsed: true, nonceUsedOnChain: true }), "claimed"));
  it("voucher past its deadline and never used has lapsed", () => assert.equal(claimPhase({ ...base, codeUsed: true, now: 6000, voucherDeadline: 5000 }), "lapsed"));
  it("only waiting and processing keep polling", () => {
    assert.equal(isPending("processing"), true);
    assert.equal(isPending("claimed"), false);
  });
});
