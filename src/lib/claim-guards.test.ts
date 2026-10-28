import { test } from "node:test";
import assert from "node:assert/strict";
import { pinSnapped, redeemTooSoon } from "./claim-guards";

const t0 = 1_000_000;
test("redeeming a code 19.9 s after it was issued is refused", () => {
  assert.equal(redeemTooSoon(t0, t0 + 19_900), true);
});
test("redeeming a code 1 s after it was issued is refused", () => {
  assert.equal(redeemTooSoon(t0, t0 + 1_000), true);
});
test("redeeming a code exactly 20 s after it was issued is allowed", () => {
  assert.equal(redeemTooSoon(t0, t0 + 20_000), false);
});
test("a fix 2.9 m from the pin with 11 m accuracy is refused", () => {
  assert.equal(pinSnapped(2.9, 11), true);
});
test("a fix exactly 3 m from the pin with 11 m accuracy is allowed", () => {
  assert.equal(pinSnapped(3, 11), false);
});
test("a fix 1 m from the pin with 11.37 m accuracy is allowed", () => {
  assert.equal(pinSnapped(1, 11.37), false);
});
test("a fix 9 m from the pin with 8 m accuracy is allowed", () => {
  assert.equal(pinSnapped(9, 8), false);
});
