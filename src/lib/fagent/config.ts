export const FAGENT = {
  chainId: 56,
  token: "0x568fb6350fd3645196f3bc679c2c8556eb537777",
  vault: "0x188d8932ddc1715e541e82ce1c1ad4b91427ef5e",
  factory: "0x55cb2c65d4b186c829ac2b994f9305a315c59849",
} as const;

export function liveSupply(paid: number, teamMinted: number, total: number, paidPerBatch = 9500) {
  return { minted: paid + teamMinted, remaining: total - paid - teamMinted, batch: Math.min(77, Math.floor(paid / paidPerBatch) + 1), batchPaid: paid === 731500 ? paidPerBatch : paid % paidPerBatch, activatedTeam: Math.floor(paid / 19) };
}
export function redemptionReady(accounted: boolean, openedAt: number, releaseSeconds: number, chainTime: number) {
  return accounted || (openedAt > 0 && chainTime >= openedAt + releaseSeconds);
}
export const explorer = (address: string) => `https://bscscan.com/address/${address}`;