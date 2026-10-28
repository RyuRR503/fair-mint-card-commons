/** Minimum seconds between issuing a claim code and redeeming it. A person copying
 * the code to an AI needs well over this; scripts chaining both calls do not. */
export const MIN_REDEEM_WAIT_S = 20;
/** A reported fix this close to the pin centre, with a whole-metre accuracy, matches
 * mock-location tools that drop the coordinate onto the pin. */
export const PIN_SNAP_M = 3;

export function redeemTooSoon(issuedAtMs: number, nowMs: number): boolean {
  return nowMs - issuedAtMs < MIN_REDEEM_WAIT_S * 1000;
}

export function pinSnapped(distanceM: number, accuracyM: number): boolean {
  return distanceM < PIN_SNAP_M && Number.isInteger(accuracyM);
}
