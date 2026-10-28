import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { encodeAbiParameters, encodeEventTopics, parseAbiParameters } from "viem";
import { VAULT_ABI } from "./vault";
import { receiptMatchesClaim } from "./claim-receipt";

const vault = "0x1111111111111111111111111111111111111111";
const wallet = "0x2222222222222222222222222222222222222222";
const stock = "0x3333333333333333333333333333333333333333";
const claim = { wallet, tokenAddress: stock, nonce: "123", amountWei: "57700000000000000" };
const receipt = {
  status: "0x1", to: vault,
  logs: [{ address: vault,
    topics: encodeEventTopics({ abi: VAULT_ABI, eventName: "GameRewardClaimed", args: { to: wallet, district: 1, spawnId: `0x${"00".repeat(32)}` } } as never) as string[],
    data: encodeAbiParameters(parseAbiParameters("address,uint256,uint256"), [stock, 57700000000000000n, 123n]),
  }],
};
describe("confirmed payout receipts", () => {
  it("accepts the successful vault event with exact recipient, asset, amount and nonce", () => assert.equal(receiptMatchesClaim(receipt, vault, claim), true));
  it("rejects an unknown transaction", () => assert.equal(receiptMatchesClaim(null, vault, claim), false));
  it("rejects a failed transaction", () => assert.equal(receiptMatchesClaim({ ...receipt, status: "0x0" }, vault, claim), false));
  it("rejects another vault", () => assert.equal(receiptMatchesClaim(receipt, wallet, claim), false));
  it("rejects another recipient", () => assert.equal(receiptMatchesClaim(receipt, vault, { ...claim, wallet: stock }), false));
  it("rejects another asset", () => assert.equal(receiptMatchesClaim(receipt, vault, { ...claim, tokenAddress: wallet }), false));
  it("rejects a different amount", () => assert.equal(receiptMatchesClaim(receipt, vault, { ...claim, amountWei: "1" }), false));
  it("rejects a different nonce", () => assert.equal(receiptMatchesClaim(receipt, vault, { ...claim, nonce: "124" }), false));
  it("rejects a transaction with no reward event", () => assert.equal(receiptMatchesClaim({ ...receipt, logs: [] }, vault, claim), false));
});