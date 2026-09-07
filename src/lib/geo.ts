export function haversine(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): number {
  const R = 6371008.8;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/** Catch radius: 40 m plus half the reported error, capped at the ceiling. */
export const BASE_RADIUS_M = 40;
export const MAX_ACCURACY_M = 65;
export const LEGENDARY_RADIUS_M = 25;

export function catchRadius(accuracyM: number): number {
  const acc = Math.max(0, Math.min(accuracyM, MAX_ACCURACY_M));
  return BASE_RADIUS_M + acc / 2;
}

export function formatDistance(m: number): string {
  if (m < 1000) return `${Math.round(m)} m`;
  if (m < 100000) return `${(m / 1000).toFixed(1)} km`;
  return `${Math.round(m / 1000)} km`;
}

/** Equirectangular projection to a 0..1 box, clipped to sane latitudes. */
export function project(lat: number, lng: number) {
  const x = (lng + 180) / 360;
  const clamped = Math.max(-72, Math.min(78, lat));
  const y = (78 - clamped) / 150;
  return { x, y };
}
