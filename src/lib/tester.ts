/** Owner test wallets: no claim limits at all. Membership lives in the test_wallets table. */
export function isTesterWallet(list: readonly string[], wallet: string): boolean {
  const w = wallet.trim().toLowerCase();
  return /^0x[a-f0-9]{40}$/.test(w) && list.some((x) => x.toLowerCase() === w);
}

/** Pick the request mode: a tester may omit the code and drain a whole district. */
export function drainRequest(body: { code?: unknown; wallet?: unknown; symbol?: unknown }) {
  return typeof body.wallet === "string" && typeof body.symbol === "string" && body.code === undefined;
}
