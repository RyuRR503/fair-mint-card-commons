/**
 * Cross-isolate display snapshot: every visitor reads one precomputed row; only
 * the request that wins a short database lease rebuilds it. Display only — never
 * use for claim eligibility or payouts.
 */
export type SnapshotRow<T> = { payload: T | null; builtAt: number } | null;

export interface SnapshotStore<T> {
  read(key: string, signal: AbortSignal): Promise<SnapshotRow<T>>;
  lease(key: string, staleSeconds: number, leaseSeconds: number): Promise<boolean>;
  write(key: string, payload: T): Promise<void>;
}

export const SNAPSHOT_FRESH_MS = 45_000;
/** Older than this, a snapshot is treated as unavailable instead of shown. */
export const SNAPSHOT_MAX_AGE_MS = 10 * 60_000;

export async function readSnapshot<T>(
  store: SnapshotStore<T>,
  key: string,
  build: (signal: AbortSignal) => Promise<T>,
  signal: AbortSignal,
  now: () => number = Date.now,
): Promise<T> {
  const row = await store.read(key, signal);
  const age = row?.payload != null ? now() - row.builtAt : Infinity;
  if (age < SNAPSHOT_FRESH_MS) return row!.payload as T;

  const usable = age < SNAPSHOT_MAX_AGE_MS ? (row!.payload as T) : null;
  const won = await store.lease(key, Math.floor(SNAPSHOT_FRESH_MS / 1000), 20);
  if (!won) {
    if (usable != null) return usable;
    throw new Error("Snapshot is being rebuilt");
  }
  try {
    const value = await build(signal);
    await store.write(key, value);
    return value;
  } catch (error) {
    if (usable != null) return usable;
    throw error;
  }
}

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export function dbSnapshotStore<T>(): SnapshotStore<T> {
  return {
    async read(key, signal) {
      const { data, error } = await (await admin())
        .from("display_snapshots").select("payload, built_at").eq("key", key).abortSignal(signal).maybeSingle();
      if (error) throw new Error("Snapshot read failed");
      return data ? { payload: data.payload as T | null, builtAt: Date.parse(data.built_at) } : null;
    },
    async lease(key, staleSeconds, leaseSeconds) {
      const { data, error } = await (await admin()).rpc("claim_display_lease", {
        _key: key, _stale_seconds: staleSeconds, _lease_seconds: leaseSeconds,
      });
      if (error) throw new Error("Snapshot lease failed");
      return data === true;
    },
    async write(key, payload) {
      const { error } = await (await admin()).from("display_snapshots").upsert({
        key, payload: payload as never, built_at: new Date().toISOString(), lease_until: new Date(0).toISOString(),
      });
      if (error) throw new Error("Snapshot write failed");
    },
  };
}
