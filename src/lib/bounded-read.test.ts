import { test } from "node:test";
import assert from "node:assert/strict";
import { createBoundedRead } from "./bounded-read";

test("a stalled public read returns within its deadline and aborts the request", async () => {
  const read = createBoundedRead<number>(30, 15, 30);
  let signal: AbortSignal | undefined;
  await assert.rejects(read(async (s) => { signal = s; return new Promise(() => {}); }), /timed out/);
  assert.equal(signal?.aborted, true);
});

test("concurrent visitors share one read and reuse only fresh display data", async () => {
  const read = createBoundedRead<number>(100, 200, 30);
  let calls = 0;
  const load = async () => { calls++; await new Promise((r) => setTimeout(r, 10)); return 42; };
  assert.deepEqual(await Promise.all([read(load), read(load), read(load)]), [42, 42, 42]);
  assert.equal(await read(load), 42);
  assert.equal(calls, 1);
});

test("failed reads back off without presenting stale points", async () => {
  const read = createBoundedRead<number>(1, 100, 100);
  assert.equal(await read(async () => 42), 42);
  await new Promise((r) => setTimeout(r, 5));
  await assert.rejects(read(async () => { throw new Error("offline"); }), /offline/);
  let calls = 0;
  await assert.rejects(read(async () => { calls++; return 99; }), /unavailable/);
  assert.equal(calls, 0);
});