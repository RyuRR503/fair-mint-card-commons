import { it } from "node:test";
import assert from "node:assert/strict";
import { verifyTurnstile } from "./turnstile.server";

it("a claim without a human-check token is refused", async () => {
  assert.equal(await verifyTurnstile(undefined, null), false);
  assert.equal(await verifyTurnstile("", "1.2.3.4"), false);
});
