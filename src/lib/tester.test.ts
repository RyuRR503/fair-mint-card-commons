import { test } from "node:test";
import assert from "node:assert/strict";
import { isTesterWallet, drainRequest } from "./tester.ts";

const LIST = ["0x27df7f97c14612db21a0064ad430d0e4b0fa930c"];

test("whitelisted test wallet is recognised regardless of case", () => {
  assert.equal(isTesterWallet(LIST, "0x27Df7f97c14612db21a0064ad430d0e4b0fa930C"), true);
});

test("any other wallet is not a tester", () => {
  assert.equal(isTesterWallet(LIST, "0x1111111111111111111111111111111111111111"), false);
  assert.equal(isTesterWallet([], LIST[0]!), false);
});

test("drain request needs wallet + symbol and no code", () => {
  assert.equal(drainRequest({ wallet: LIST[0], symbol: "NVDAB" }), true);
  assert.equal(drainRequest({ wallet: LIST[0], code: "CATCH-1" }), false);
});
