import { test } from "node:test";
import assert from "node:assert/strict";
import { encodeFunctionData, decodeFunctionData } from "viem";
import { vaultAbi } from "./vault-abi";
import { FAGENT, liveSupply, redemptionReady } from "./config";
import { mintCommand, bidCommand } from "./commands";

test("the selected deployed vault is distinct from its token and factory", () => {
  assert.equal(FAGENT.vault, "0x188d8932ddc1715e541e82ce1c1ad4b91427ef5e");
  assert.equal(FAGENT.token, "0x568fb6350fd3645196f3bc679c2c8556eb537777");
  assert.notEqual(FAGENT.factory, FAGENT.vault);
});
test("live supply counts materialized NFTs separately from activated team rights", () => {
  assert.deepEqual(liveSupply(19, 0, 770000), { minted: 19, remaining: 769981, batch: 1, batchPaid: 19, activatedTeam: 1 });
  assert.equal(liveSupply(9500, 500, 770000).batch, 2);
  assert.equal(liveSupply(731500, 38500, 770000).remaining, 0);
});
test("open-batch redemption unlocks at exactly 7 days, not one second earlier", () => {
  assert.equal(redemptionReady(false, 100, 604800, 604899), false);
  assert.equal(redemptionReady(false, 100, 604800, 604900), true);
  assert.equal(redemptionReady(true, 100, 604800, 101), true);
});
test("selected ABI supports count-based mint, not obsolete mint()", () => {
  const data = encodeFunctionData({ abi: vaultAbi, functionName: "mint", args: [2n] });
  assert.deepEqual(decodeFunctionData({ abi: vaultAbi, data }).args, [2n]);
  assert.ok(mintCommand(2).includes("value=4000000000000000 wei"));
  assert.throws(() => mintCommand(8));
});
test("human batch 1 maps to batchPlusOne 1 and 5 cards escrow exactly 0.01 BNB", () => {
  const command = bidCommand("0.002", 5, 1);
  assert.ok(command.includes("参数 2000000000000000、5、1"));
  assert.ok(command.includes("value=10000000000000000 wei"));
});
test("order commands reject invalid amount, quantity and batch", () => {
  assert.throws(() => bidCommand("0", 1, 0));
  assert.throws(() => bidCommand("0.002", 4294967296, 0));
  assert.throws(() => bidCommand("0.002", 1, 78));
  assert.throws(() => bidCommand("0.0000000000000000001", 1, 0));
});