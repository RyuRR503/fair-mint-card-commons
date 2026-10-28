/**
 * One network cannot appear in two far-apart cities faster than real travel.
 * Same-city sharing (offices, cafés, dorms) is never limited: there is no count quota.
 */
export const NETWORK_SAME_AREA_M = 30_000;
export const NETWORK_AIRPORT_S = 90 * 60;
export const NETWORK_FLIGHT_MS = 250;

export function networkTravelBlocked(
  earlier: { distanceM: number; ageS: number }[],
): boolean {
  return earlier.some(({ distanceM, ageS }) =>
    distanceM >= NETWORK_SAME_AREA_M &&
    distanceM > Math.max(0, ageS - NETWORK_AIRPORT_S) * NETWORK_FLIGHT_MS,
  );
}
