/**
 * TEMPORARY one-off importer: loads the venue dump prepared on disk and
 * rebuilds places + permanent spawns. Deleted right after the import runs.
 */
import { createFileRoute } from "@tanstack/react-router";
import { readFile } from "node:fs/promises";
import { COOLDOWN_MIN, TOKEN_BY_SYMBOL, type Rarity } from "@/lib/tokens";

const TOKEN = "tmp-venue-import-3f9a2c";
const CAP: Record<Rarity, number> = { common: 18, rare: 10, epic: 5, legendary: 6 };

type Row = {
  osm_type: string;
  osm_id: number;
  symbol: string;
  brand: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
};

export const Route = createFileRoute("/api/public/tmp-import")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (request.headers.get("x-import-token") !== TOKEN) {
          return new Response("forbidden", { status: 403 });
        }
        const raw = await readFile("/tmp/venues/places.json", "utf8");
        const all = JSON.parse(raw) as Row[];

        const seen = new Set<string>();
        const byGroup = new Map<string, Row[]>();
        for (const r of all) {
          const k = `${r.osm_type}/${r.osm_id}`;
          if (seen.has(k)) continue;
          seen.add(k);
          const g = `${r.city}|${r.symbol}`;
          const list = byGroup.get(g) ?? [];
          list.push(r);
          byGroup.set(g, list);
        }

        const places: Row[] = [];
        const spawnKeys = new Set<string>();
        for (const [g, list] of byGroup) {
          const symbol = g.split("|")[1]!;
          const token = TOKEN_BY_SYMBOL[symbol];
          if (!token) continue;
          const shuffled = [...list].sort(() => Math.random() - 0.5);
          const picked = shuffled.slice(0, CAP[token.rarity]);
          places.push(...picked);
          if (!token.eventOnly) for (const p of picked) spawnKeys.add(`${p.osm_type}/${p.osm_id}`);
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        for (let i = 0; i < places.length; i += 400) {
          const chunk = places.slice(i, i + 400).map((p) => ({
            osm_type: p.osm_type,
            osm_id: p.osm_id,
            symbol: p.symbol,
            brand: (p.brand || p.name || p.symbol).slice(0, 40),
            name: (p.name || p.brand || p.symbol).slice(0, 60),
            city: p.city,
            country: "CN",
            lat: p.lat,
            lng: p.lng,
          }));
          const { error } = await supabaseAdmin
            .from("places")
            .upsert(chunk, { onConflict: "osm_type,osm_id" });
          if (error) return new Response(`places: ${error.message}`, { status: 500 });
        }

        const { data: stored, error: readErr } = await supabaseAdmin
          .from("places")
          .select("id,osm_type,osm_id,symbol")
          .limit(20000);
        if (readErr) return new Response(`read: ${readErr.message}`, { status: 500 });

        const spawnRows = (stored ?? [])
          .filter((p) => spawnKeys.has(`${p.osm_type}/${p.osm_id}`))
          .map((p) => {
            const t = TOKEN_BY_SYMBOL[p.symbol]!;
            return {
              id: `sp-${p.id}`,
              place_id: p.id,
              symbol: p.symbol,
              amount: t.fragment,
              rarity: t.rarity,
              cooldown_min: COOLDOWN_MIN[t.rarity],
              day: null,
              expires_at: null,
              respawn_at: null,
            };
          });
        for (let i = 0; i < spawnRows.length; i += 400) {
          const { error } = await supabaseAdmin
            .from("spawns")
            .upsert(spawnRows.slice(i, i + 400), { onConflict: "place_id", ignoreDuplicates: true });
          if (error) return new Response(`spawns: ${error.message}`, { status: 500 });
        }

        return Response.json({ places: places.length, spawns: spawnRows.length });
      },
    },
  },
});
