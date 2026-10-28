import { test } from "node:test";
import assert from "node:assert/strict";
import { hourlyCapCheck, payoutCapCheck } from "./hourly-cap";

const price = { AAPLB: 345, GOOGLB: 325, NOFEED: null };

test("hourly $500 cap allows a claim that keeps the hour under $500", () => {
  assert.equal(hourlyCapCheck([{ symbol: "AAPLB", amount: 1 }], { symbol: "GOOGLB", amount: 0.4 }, price, 500).ok, true);
});
test("hourly $500 cap refuses a claim that pushes the hour over $500", () => {
  const r = hourlyCapCheck([{ symbol: "AAPLB", amount: 1.2 }], { symbol: "GOOGLB", amount: 0.4 }, price, 500);
  assert.equal(r.ok, false);
  assert.equal(!r.ok && r.reason, "cap");
});
test("hourly cap refuses instead of skipping when a price is missing", () => {
  const r = hourlyCapCheck([{ symbol: "NOFEED", amount: 0.01 }], { symbol: "AAPLB", amount: 0.01 }, price, 500);
  assert.equal(!r.ok && r.reason, "price");
});

test("daily $500 cap allows a claim that keeps the 24h window under $500", () => {
  assert.equal(payoutCapCheck([{ symbol: "AAPLB", amount: 1 }], { symbol: "GOOGLB", amount: 0.4 }, price, 500).ok, true);
});
test("daily $500 cap refuses a claim that pushes the 24h window over $500", () => {
  const r = payoutCapCheck([{ symbol: "AAPLB", amount: 1.2 }], { symbol: "GOOGLB", amount: 0.4 }, price, 500);
  assert.equal(r.ok, false);
  assert.equal(!r.ok && r.reason, "cap");
});
test("daily cap refuses instead of skipping when a price is missing", () => {
  const r = payoutCapCheck([{ symbol: "NOFEED", amount: 0.01 }], { symbol: "AAPLB", amount: 0.01 }, price, 500);
  assert.equal(!r.ok && r.reason, "price");
});

import { budgetStatus } from "./hourly-cap";
test("budget frees when the oldest payout leaves the hour window", () => {
  const rows = [
    { symbol: "A", amount: 3, created_at: "2026-10-28T10:00:00Z" },
    { symbol: "A", amount: 2, created_at: "2026-10-28T10:20:00Z" },
  ];
  const s = budgetStatus(rows, { A: 10 }, 50, 3600e3, 5);
  assert.equal(s.spentUsd, 50);
  assert.equal(s.freesAtMs, new Date("2026-10-28T11:00:00Z").getTime());
});
test("budget with room has no countdown", () => {
  const s = budgetStatus([{ symbol: "A", amount: 1, created_at: "2026-10-28T10:00:00Z" }], { A: 10 }, 50, 3600e3, 5);
  assert.equal(s.freesAtMs, null);
});
