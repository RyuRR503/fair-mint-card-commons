/** Bounded recovery after transient display failures; never retries a payout. */
export async function retryDisplay<T>(load: () => Promise<T>, signal: AbortSignal, delayMs = 20_000, attempts = 4): Promise<T> {
  for (let attempt = 0; attempt < attempts; attempt++) {
    if (signal.aborted) throw new Error("Display read cancelled");
    try { return await load(); } catch (error) {
      if (attempt === attempts - 1 || signal.aborted) throw error;
      await new Promise<void>((resolve, reject) => {
        const cancel = () => { clearTimeout(timer); reject(new Error("Display read cancelled")); };
        const timer = setTimeout(() => { signal.removeEventListener("abort", cancel); resolve(); }, delayMs);
        signal.addEventListener("abort", cancel, { once: true });
      });
    }
  }
  throw new Error("Display unavailable");
}