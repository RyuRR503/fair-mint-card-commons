import { describe, expect, test } from "bun:test";
import { AGENT_CLAIMS, claimEligibility } from "./agent-claims";

describe("Agent-only claim presentation policy", () => {
  for (const rarity of ["common", "rare", "epic", "legendary"] as const) {
    test(`${rarity} excludes ordinary wallets`, () => {
      expect(claimEligibility(rarity, "ordinary")).toBe("agent-required");
    });
    test(`${rarity} cannot claim before integration`, () => {
      expect(claimEligibility(rarity, "agent")).toBe("integration-pending");
    });
  }
  test("intended commands expire after 15 minutes", () => {
    expect(AGENT_CLAIMS.commandTtlMinutes).toBe(15);
  });
});