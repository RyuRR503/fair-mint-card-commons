import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";

async function setup() {
  const db = new PGlite();
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated;
    CREATE TABLE spawns(id text PRIMARY KEY, rarity text DEFAULT 'common', respawn_at timestamptz, cooldown_min integer DEFAULT 20, claimed_by text, claimed_at timestamptz, catches_count integer DEFAULT 0);
    CREATE TABLE catches(wallet text, spawn_id text, created_at timestamptz DEFAULT now());
    INSERT INTO spawns(id) VALUES ('point-a'),('point-b');`);
  await db.exec(readFileSync(new URL("../../drizzle/migrations/0004_atomic_claim_insert_guard.sql", import.meta.url), "utf8"));
  return db;
}

describe("database claim reservations", () => {
  it("two concurrent requests for the same point reserve exactly one catch", async () => {
    const db = await setup();
    try {
      const results = await Promise.allSettled([
        db.query("INSERT INTO catches(wallet,spawn_id) VALUES ('wallet-a','point-a')"),
        db.query("INSERT INTO catches(wallet,spawn_id) VALUES ('wallet-b','point-a')"),
      ]);
      assert.equal(results.filter(r => r.status === "fulfilled").length, 1);
      assert.deepEqual((await db.query("SELECT count(*)::integer AS count FROM catches")).rows, [{ count: 1 }]);
      assert.deepEqual((await db.query("SELECT catches_count FROM spawns WHERE id='point-a'")).rows, [{ catches_count: 1 }]);
    } finally { await db.close(); }
  });
  it("the same wallet cannot claim twice within 120 minutes even at different points", async () => {
    const db = await setup();
    try {
      await db.query("INSERT INTO catches(wallet,spawn_id) VALUES ('wallet-a','point-a')");
      await assert.rejects(db.query("INSERT INTO catches(wallet,spawn_id) VALUES ('wallet-a','point-b')"), /CLAIM_WALLET_COOLDOWN/);
      assert.deepEqual((await db.query("SELECT catches_count FROM spawns WHERE id='point-b'")).rows, [{ catches_count: 0 }]);
    } finally { await db.close(); }
  });
  it("wallet limit remains 6 in a rolling 24 hours", async () => {
    const db = await setup();
    try {
      await db.exec("ALTER TABLE catches DISABLE TRIGGER catch_insert_atomic_guard; INSERT INTO catches SELECT 'wallet-a','old-point',now()-make_interval(hours=>g*3) FROM generate_series(1,6) g; ALTER TABLE catches ENABLE TRIGGER catch_insert_atomic_guard;");
      await assert.rejects(db.query("INSERT INTO catches(wallet,spawn_id) VALUES ('wallet-a','point-b')"), /CLAIM_WALLET_DAY_LIMIT/);
    } finally { await db.close(); }
  });
  it("a wallet cannot repeat a point within 24 hours after point cooldown ends", async () => {
    const db = await setup();
    try {
      await db.exec("ALTER TABLE catches DISABLE TRIGGER catch_insert_atomic_guard; INSERT INTO catches VALUES ('wallet-a','point-a',now()-interval '3 hours'); ALTER TABLE catches ENABLE TRIGGER catch_insert_atomic_guard;");
      await assert.rejects(db.query("INSERT INTO catches(wallet,spawn_id) VALUES ('wallet-a','point-a')"), /CLAIM_POINT_REPEAT/);
    } finally { await db.close(); }
  });
  it("a point stops at 24 reservations in 24 hours", async () => {
    const db = await setup();
    try {
      await db.exec("ALTER TABLE catches DISABLE TRIGGER catch_insert_atomic_guard; INSERT INTO catches SELECT 'old-wallet-'||g,'point-a',now()-interval '3 hours' FROM generate_series(1,24) g; ALTER TABLE catches ENABLE TRIGGER catch_insert_atomic_guard;");
      await assert.rejects(db.query("INSERT INTO catches(wallet,spawn_id) VALUES ('wallet-new','point-a')"), /CLAIM_POINT_DAY_LIMIT/);
    } finally { await db.close(); }
  });
});