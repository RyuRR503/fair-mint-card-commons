import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getMapPoints } from "@/lib/map.functions";
import { retryDisplay } from "./display-retry";
import type { MapPoint } from "@/components/site/GeoMap.client";

/** Loads the per-store signals in the background, after the page is interactive. */
export function useMapPoints(): MapPoint[] {
  const load = useServerFn(getMapPoints);
  const [points, setPoints] = useState<MapPoint[]>([]);

  useEffect(() => {
    let alive = true;
    const controller = new AbortController();
    const w = window as unknown as {
      requestIdleCallback?: (c: () => void) => number;
      setTimeout: (c: () => void, ms: number) => number;
    };
    const idle = (cb: () => void) =>
      w.requestIdleCallback ? w.requestIdleCallback(cb) : w.setTimeout(cb, 200);

    idle(() => {
      retryDisplay(() => load(), controller.signal)
        .then((p) => {
          if (alive) setPoints(p as MapPoint[]);
        })
        .catch(() => {});
    });
    return () => {
      alive = false;
      controller.abort();
    };
  }, [load]);

  return points;
}
