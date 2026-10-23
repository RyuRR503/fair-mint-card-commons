import { describe, it as test } from "node:test";
import assert from "node:assert/strict";
import { AGENT_CLAIMS, claimEligibility } from "./agent-claims";

describe("Agent-only claim presentation policy", () => {
  for (const rarity of ["common", "rare", "epic", "legendary"] as const) {
    test(`${rarity} excludes ordinary wallets`, () => {
      assert.equal(claimEligibility(rarity, "ordinary"), "agent-required");
    });
    test(`${rarity} is claimable by an Agent wallet`, () => {
      assert.equal(claimEligibility(rarity, "agent"), "ready");
    });
  }
  test("intended commands expire after 15 minutes", () => {
    assert.equal(AGENT_CLAIMS.commandTtlMinutes, 15);
  });
});