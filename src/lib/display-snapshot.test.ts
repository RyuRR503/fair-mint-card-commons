import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readSnapshot, type SnapshotStore } from "./display-snapshot";

function store(row: { payload: number; builtAt: number } | null, leaseWins: boolean) {
  const calls = { builds: 0, writes: 0 };
  const s: SnapshotStore<number> = {
    read: async () => row,
    lease: async () => leaseWins,
    write: async () => { calls.writes++; },
  };
  return { s, calls };
}
const sig = new AbortController().signal;
const NOW = 1_000_000_000;

describe("display snapshot", () => {
  it("serves a 30-second-old snapshot without rebuilding", async () => {
    const { s } = store({ payload: 7, builtAt: NOW - 30_000 }, true);
    let builds = 0;
    assert.equal(await readSnapshot(s, "k", async () => { builds++; return 9; }, sig, () => NOW), 7);
    assert.equal(builds, 0);
  });

  it("only the lease winner rebuilds; others get the recent snapshot", async () => {
    const { s } = store({ payload: 7, builtAt: NOW - 60_000 }, false);
    let builds = 0;
    assert.equal(await readSnapshot(s, "k", async () => { builds++; return 9; }, sig, () => NOW), 7);
    assert.equal(builds, 0);
  });

  it("lease winner rebuilds and stores the new snapshot", async () => {
    const { s, calls } = store({ payload: 7, builtAt: NOW - 60_000 }, true);
    assert.equal(await readSnapshot(s, "k", async () => 9, sig, () => NOW), 9);
    assert.equal(calls.writes, 1);
  });

  it("never shows a snapshot older than 10 minutes", async () => {
    const { s } = store({ payload: 7, builtAt: NOW - 11 * 60_000 }, false);
    await assert.rejects(readSnapshot(s, "k", async () => 9, sig, () => NOW));
  });
});
