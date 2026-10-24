import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { BEHAVIOR_LIMITS, scoreBehavior } from "./behavior";

const clean = {
  walletsPerDevice24h: 1,
  walletsPerDevice7d: 1,
  devicesPerWallet7d: 1,
  citiesPerDevice7d: 1,
  deviceClaims24h: 2,
  intervalMinutes: [130, 95, 180, 122],
};

describe("scoreBehavior", () => {
  it("allows a normal player", () => {
    const v = scoreBehavior(clean);
    assert.equal(v.action, "allow");
    assert.equal(v.score, 0);
  });

  it("flags a device feeding a second wallet but does not block", () => {
    const v = scoreBehavior({ ...clean, walletsPerDevice24h: 2 });
    assert.equal(v.action, "flag");
    assert.ok(v.score >= BEHAVIOR_LIMITS.flagScore);
  });

  it("hard-blocks a device feeding 3+ wallets in 24h even with no other signal", () => {
    const v = scoreBehavior({ ...clean, walletsPerDevice24h: BEHAVIOR_LIMITS.maxWalletsPerDevice24h });
    assert.equal(v.action, "block");
  });

  it("blocks when combined soft signals reach the block score", () => {
    const v = scoreBehavior({
      ...clean,
      walletsPerDevice24h: 2, // 40
      devicesPerWallet7d: 3, // 30
    });
    assert.equal(v.action, "block");
  });

  it("scores machine-regular claim intervals (weak alone, stacks with others)", () => {
    const v = scoreBehavior({ ...clean, intervalMinutes: [120, 120, 120, 120] });
    assert.equal(v.score, 25);
    assert.ok(v.reasons.join(" ").includes("machine-regular"));
    const combined = scoreBehavior({
      ...clean,
      intervalMinutes: [120, 120, 120, 120], // 25
      citiesPerDevice7d: 3, // 30
    });
    assert.equal(combined.action, "flag");
  });

  it("flags a device seen in 3+ cities in a week", () => {
    const v = scoreBehavior({ ...clean, citiesPerDevice7d: 3 });
    assert.equal(v.action, "flag");
  });

  it("scores heavy single-device claim volume (weak alone, stacks with others)", () => {
    const v = scoreBehavior({ ...clean, deviceClaims24h: 8 });
    assert.equal(v.score, 25);
  });
});
