import { describe, expect, it } from "vitest";
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
    expect(v.action).toBe("allow");
    expect(v.score).toBe(0);
  });

  it("flags a device feeding a second wallet but does not block", () => {
    const v = scoreBehavior({ ...clean, walletsPerDevice24h: 2 });
    expect(v.action).toBe("flag");
    expect(v.score).toBeGreaterThanOrEqual(BEHAVIOR_LIMITS.flagScore);
  });

  it("hard-blocks a device feeding 3+ wallets in 24h even with no other signal", () => {
    const v = scoreBehavior({ ...clean, walletsPerDevice24h: BEHAVIOR_LIMITS.maxWalletsPerDevice24h });
    expect(v.action).toBe("block");
  });

  it("blocks when combined soft signals reach the block score", () => {
    const v = scoreBehavior({
      ...clean,
      walletsPerDevice24h: 2, // 40
      devicesPerWallet7d: 3, // 30
    });
    expect(v.action).toBe("block");
  });

  it("flags machine-regular claim intervals", () => {
    const v = scoreBehavior({ ...clean, intervalMinutes: [120, 120, 120, 120] });
    expect(v.action).toBe("flag");
    expect(v.reasons.join(" ")).toContain("machine-regular");
  });

  it("flags a device seen in 3+ cities in a week", () => {
    const v = scoreBehavior({ ...clean, citiesPerDevice7d: 3 });
    expect(v.action).toBe("flag");
  });

  it("flags heavy single-device claim volume", () => {
    const v = scoreBehavior({ ...clean, deviceClaims24h: 8 });
    expect(v.action).toBe("flag");
  });
});
