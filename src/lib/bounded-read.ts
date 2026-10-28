/** Per-isolate public display cache; never use for claim eligibility or payouts. */
export function createBoundedRead<T>(ttlMs: number, timeoutMs: number, backoffMs: number) {
  let cached: { value: T; until: number } | undefined;
  let pending: Promise<T> | undefined;
  let retryAt = 0;
  return async (load: (signal: AbortSignal) => Promise<T>): Promise<T> => {
    if (cached && cached.until > Date.now()) return cached.value;
    if (pending) return pending;
    if (retryAt > Date.now()) throw new Error("Public data temporarily unavailable");
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    pending = (async () => {
      try {
        const value = await Promise.race([
          Promise.resolve().then(() => load(controller.signal)),
          new Promise<never>((_, reject) => {
            timer = setTimeout(() => {
              controller.abort();
              reject(new Error("Public data read timed out"));
            }, timeoutMs);
          }),
        ]);
        cached = { value, until: Date.now() + ttlMs };
        return value;
      } catch (error) {
        retryAt = Date.now() + backoffMs;
        // Do not return expired points as if they were currently open.
        throw error;
      } finally {
        if (timer) clearTimeout(timer);
        pending = undefined;
      }
    })();
    return pending;
  };
}