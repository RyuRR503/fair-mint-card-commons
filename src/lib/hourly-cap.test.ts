import { describe, expect, it } from "vitest";
import { hourlyCapCheck } from "./hourly-cap";

const price = { AAPLB: 345, GOOGLB: 325, NOFEED: null };

describe("hourly $500 cap", () => {
  it("allows a claim that keeps the hour under $500", () => {
    expect(hourlyCapCheck([{ symbol: "AAPLB", amount: 1 }], { symbol: "GOOGLB", amount: 0.4 }, price, 500).ok).toBe(true);
  });
  it("refuses a claim that pushes the hour over $500", () => {
    const r = hourlyCapCheck([{ symbol: "AAPLB", amount: 1.2 }], { symbol: "GOOGLB", amount: 0.4 }, price, 500);
    expect(r).toMatchObject({ ok: false, reason: "cap" });
  });
  it("refuses instead of skipping when a price is missing", () => {
    const r = hourlyCapCheck([{ symbol: "NOFEED", amount: 0.01 }], { symbol: "AAPLB", amount: 0.01 }, price, 500);
    expect(r).toMatchObject({ ok: false, reason: "price" });
  });
});
