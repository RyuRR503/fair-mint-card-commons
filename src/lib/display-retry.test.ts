import { test } from "node:test";
import assert from "node:assert/strict";
import { retryDisplay } from "./display-retry";
test("display retries recover from a transient failure", async () => {
  let calls = 0;
  assert.equal(await retryDisplay(async () => { if (++calls < 2) throw new Error("offline"); return 12; }, new AbortController().signal, 1), 12);
  assert.equal(calls, 2);
});
test("display retries stop at four attempts", async () => {
  let calls = 0;
  await assert.rejects(retryDisplay(async () => { calls++; throw new Error("offline"); }, new AbortController().signal, 1));
  assert.equal(calls, 4);
});
test("unmount cancellation prevents further reads", async () => {
  const controller = new AbortController(); let calls = 0;
  const task = retryDisplay(async () => { calls++; throw new Error("offline"); }, controller.signal, 1000);
  setTimeout(() => controller.abort(), 1);
  await assert.rejects(task, /cancelled/);
  assert.equal(calls, 1);
});