import { createFileRoute } from "@tanstack/react-router";
import { importCityPlaces, seedSpawns } from "@/lib/sync.functions";
import { CN_CITIES } from "@/lib/cities";

/**
 * Maintenance endpoint: imports real store coordinates from OpenStreetMap
 * and rolls the daily catchable signals. Requires the shared sync token.
 */
export const Route = createFileRoute("/api/public/sync")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = request.headers.get("x-sync-token") ?? "";
        const expected = process.env["SYNC_TOKEN"];
        if (!expected || token !== expected) {
          return new Response("Forbidden", { status: 403 });
        }
        const url = new URL(request.url);
        const cityParam = url.searchParams.get("city");
        const roll = url.searchParams.get("roll") === "1";

        const results: unknown[] = [];
        if (cityParam) {
          const cities = cityParam === "all" ? CN_CITIES.map((c) => c.key) : cityParam.split(",");
          for (const city of cities) {
            try {
              results.push(await importCityPlaces({ data: { token, city } }));
            } catch (e) {
              results.push({ city, error: String(e) });
            }
          }
        }
        let rolled: unknown = null;
        if (roll) rolled = await seedSpawns({ data: { token, city: cityParam ?? "all" } });

        return Response.json({ ok: true, results, rolled });
      },
    },
  },
});
