/**
 * Behaviour profiling for claim anti-abuse. Pure scoring, no I/O.
 *
 * GPS checks catch lazy spoofers; this layer catches the patient ones by
 * looking at how a device/wallet behaves over days, not at one fix.
 * Three outcomes: allow, flag (record only, never blocks a real player on
 * one odd signal), block (extreme signals only).
 */

export type BehaviorSignals = {
  /** Distinct wallets that redeemed codes issued to this device, last 24h. */
  walletsPerDevice24h: number;
  /** Distinct wallets that redeemed codes issued to this device, last 7d. */
  walletsPerDevice7d: number;
  /** Distinct devices this wallet claimed from, last 7d. */
  devicesPerWallet7d: number;
  /** Distinct cities this device appeared in, last 7d. */
  citiesPerDevice7d: number;
  /** Claims (catches) made through this device, last 24h. */
  deviceClaims24h: number;
  /** Minutes between this wallet's consecutive catches, oldest first. */
  intervalMinutes: number[];
};

export type BehaviorVerdict = {
  score: number;
  reasons: string[];
  action: "allow" | "flag" | "block";
};

export const BEHAVIOR_LIMITS = {
  /** One device feeding this many wallets in 24h is a code farm. Hard block. */
  maxWalletsPerDevice24h: 3,
  /** Score at or above this blocks; below it only flags. */
  blockScore: 60,
  flagScore: 30,
} as const;

/** Coefficient of variation: how regular the intervals are. Bots are metronomes. */
function regularity(intervals: number[]): number {
  if (intervals.length < 3) return 1;
  const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  if (mean <= 0) return 1;
  const variance =
    intervals.reduce((a, b) => a + (b - mean) ** 2, 0) / intervals.length;
  return Math.sqrt(variance) / mean;
}

export function scoreBehavior(s: BehaviorSignals): BehaviorVerdict {
  let score = 0;
  const reasons: string[] = [];

  if (s.walletsPerDevice24h >= 2) {
    score += 40;
    reasons.push(`device fed ${s.walletsPerDevice24h} wallets in 24h`);
  }
  if (s.walletsPerDevice7d >= 4) {
    score += 25;
    reasons.push(`device fed ${s.walletsPerDevice7d} wallets in 7d`);
  }
  if (s.devicesPerWallet7d >= 3) {
    score += 30;
    reasons.push(`wallet claimed from ${s.devicesPerWallet7d} devices in 7d`);
  }
  if (s.citiesPerDevice7d >= 3) {
    score += 30;
    reasons.push(`device seen in ${s.citiesPerDevice7d} cities in 7d`);
  }
  if (s.deviceClaims24h >= 8) {
    score += 25;
    reasons.push(`${s.deviceClaims24h} claims through one device in 24h`);
  }
  if (s.intervalMinutes.length >= 3 && regularity(s.intervalMinutes) < 0.05) {
    score += 25;
    reasons.push("claim intervals are machine-regular");
  }

  // Hard rule: a device handing codes to 3+ different wallets in a day is a
  // farm no matter what the rest of the profile looks like.
  const hardBlock = s.walletsPerDevice24h >= BEHAVIOR_LIMITS.maxWalletsPerDevice24h;

  const action =
    hardBlock || score >= BEHAVIOR_LIMITS.blockScore
      ? "block"
      : score >= BEHAVIOR_LIMITS.flagScore
        ? "flag"
        : "allow";

  return { score, reasons, action };
}
