/**
 * Claim gate: the Agent wallet must hold CATCH now AND about 10 minutes earlier,
 * so one stash cannot be passed through many wallets within minutes.
 * Uses raw JSON-RPC (Worker-safe). Any read failure counts as not verified.
 */
export const CATCH_TOKEN = "0x8344e021edfe72a8aa8382328edd096565487777";
export const MIN_CATCH_HOLD = 100_000n * 10n ** 18n; // 100,000 CATCH (18 decimals)
/** ~10 minutes of BSC blocks; public RPCs only keep this much recent history. */
export const HOLD_LOOKBACK_BLOCKS = 1200;
const RPCS = [
  "https://bsc-rpc.publicnode.com",
  "https://bsc-mainnet.public.blastapi.io",
  "https://bsc-rpc.publicnode.com",
  "https://bsc.drpc.org",
];

export function holdOk(now: bigint | null, earlier: bigint | null, min = MIN_CATCH_HOLD): boolean {
  return now != null && earlier != null && now >= min && earlier >= min;
}

async function rpc(url: string, method: string, params: unknown[]): Promise<string> {
  const r = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    signal: AbortSignal.timeout(5000),
  });
  const j = (await r.json()) as { result?: string; error?: unknown };
  if (typeof j.result !== "string") throw new Error("rpc");
  return j.result;
}

export async function catchHolding(wallet: string): Promise<{ now: bigint; earlier: bigint } | null> {
  const data = "0x70a08231" + wallet.toLowerCase().replace(/^0x/, "").padStart(64, "0");
  for (const url of RPCS) {
    try {
      const head = BigInt(await rpc(url, "eth_blockNumber", []));
      const past = "0x" + (head - BigInt(HOLD_LOOKBACK_BLOCKS)).toString(16);
      const [a, b] = await Promise.all([
        rpc(url, "eth_call", [{ to: CATCH_TOKEN, data }, "latest"]),
        rpc(url, "eth_call", [{ to: CATCH_TOKEN, data }, past]),
      ]);
      return { now: BigInt(a), earlier: BigInt(b) };
    } catch {
      /* try next RPC */
    }
  }
  return null;
}
