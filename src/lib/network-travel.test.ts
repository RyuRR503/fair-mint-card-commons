import { test } from "node:test";
import assert from "node:assert/strict";
import { networkTravelBlocked } from "./network-travel";

test("twenty claims on one shared Wi-Fi in the same city are never limited", () => {
  const same = Array.from({ length: 20 }, (_, i) => ({ distanceM: 500 + i * 100, ageS: i * 60 }));
  assert.equal(networkTravelBlocked(same), false);
});
test("one network in Beijing then Shanghai 20 minutes later is refused", () => {
  assert.equal(networkTravelBlocked([{ distanceM: 1_070_000, ageS: 20 * 60 }]), true);
});
test("one network in a far city 6 hours later is allowed", () => {
  assert.equal(networkTravelBlocked([{ distanceM: 1_070_000, ageS: 6 * 3600 }]), false);
});
