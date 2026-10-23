import { describe, it as test } from "node:test";
import assert from "node:assert/strict";
import { allocate, claimShares, payableClaims } from "./allocation";

const cands = [
  ...Array.from({ length: 50 }, (_, i) => ({ id: `sh${i}`, city: "shanghai" })),
  ...Array.from({ length: 10 }, (_, i) => ({ id: `bj${i}`, city: "beijing" })),
  { id: "x0", city: "xian" },
];

describe("inventory-based point allocation", () => {
  test("points equal what the inventory can pay", () => {
    assert.equal(payableClaims(1, 0.01), 100);
    assert.equal(payableClaims(0, 0.01), 0);
  });
  test("each claim is worth about $2 for common", () => {
    assert.equal(claimShares("common", 200, 0.5), 0.01);
  });
  test("no price keeps the fixed fragment", () => {
    assert.equal(claimShares("common", null, 0.0027), 0.0027);
  });
  test("never more points than the budget", () => {
    assert.equal(allocate(cands, 10, "d").size, 10);
  });
  test("every city gets at least one point", () => {
    const p = allocate(cands, 10, "d");
    assert.ok(p.has("x0"));
    assert.ok([...p].some((id) => id.startsWith("bj")));
  });
  test("one city holds at most 30% of points", () => {
    const p = allocate(cands, 10, "d");
    assert.ok([...p].filter((id) => id.startsWith("sh")).length <= 3);
  });
  test("different day rotates venues", () => {
    const a = [...allocate(cands, 10, "2026-10-23")].sort().join();
    const b = [...allocate(cands, 10, "2026-10-24")].sort().join();
    assert.notEqual(a, b);
  });
});
