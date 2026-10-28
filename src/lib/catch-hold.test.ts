import { test } from "node:test";
import assert from "node:assert/strict";
import { holdOk, MIN_CATCH_HOLD } from "./catch-hold";

const E18 = 10n ** 18n;
test("threshold is 100,000 CATCH", () => assert.equal(MIN_CATCH_HOLD, 100_000n * E18));
test("holding 100,000 CATCH now and 10 minutes ago can claim", () => {
  assert.equal(holdOk(100_000n * E18, 100_000n * E18), true);
});
test("holding 99,999 CATCH cannot claim", () => {
  assert.equal(holdOk(99_999n * E18, 200_000n * E18), false);
});
test("tokens that arrived within the last 10 minutes do not count", () => {
  assert.equal(holdOk(500_000n * E18, 0n), false);
});
test("an unreadable balance never counts as holding", () => {
  assert.equal(holdOk(null, 100_000n * E18), false);
});
