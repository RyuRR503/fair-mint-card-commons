import { test, expect } from "bun:test";
import { CARD_RULES, mintRemaining, mintSplit, batchForCard, canRedeem } from "./agent-card-model";

test("archive supply is 77 batches of 10000 with 9500 paid and 500 team cards", () => {
  expect(CARD_RULES.supply).toBe(770000);
  expect(CARD_RULES.batches * CARD_RULES.cardsPerBatch).toBe(770000);
  expect(CARD_RULES.paidPerBatch).toBe(9500);
  expect(CARD_RULES.teamPerBatch).toBe(500);
});
test("paid mint lifetime quota is 7, never negative", () => {
  expect(mintRemaining(6)).toBe(1);
  expect(mintRemaining(7)).toBe(0);
  expect(mintRemaining(8)).toBe(0);
});
test("0.002 BNB mint splits 80 percent buyback and 20 percent ops", () => {
  expect(CARD_RULES.mintPriceBnb).toBe(0.002);
  expect(mintSplit().buyback).toBeCloseTo(0.0016, 10);
  expect(mintSplit().ops).toBeCloseTo(0.0004, 10);
});
test("redemption unlocks at 9500 paid cards, not 9499", () => {
  expect(canRedeem(9499)).toBe(false);
  expect(canRedeem(9500)).toBe(true);
});
test("human batch numbering changes at token 10000", () => {
  expect(batchForCard(9999)).toBe(1);
  expect(batchForCard(10000)).toBe(2);
});
test("market fill fee is 1 percent", () => {
  expect(CARD_RULES.marketFeeBps).toBe(100);
});