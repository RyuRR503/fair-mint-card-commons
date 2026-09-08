import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";
import type { MapPin } from "./WorldMap";
import type { MapPoint } from "./GeoMap.client";

const load = () => import("./GeoMap.client");
const GeoMap = lazy(load);

// start pulling the map engine down as soon as this module is evaluated in the
// browser, instead of waiting for hydration to mount the lazy boundary
if (typeof window !== "undefined") void load();

type Props = {
  pins: MapPin[];
  points?: MapPoint[];
  me?: { lat: number; lng: number } | null;
  onSelect?: (key: string) => void;
  selected?: string | null;
  center?: [number, number];
  zoom?: number;
  height?: string;
};

function Skeleton() {
  return (
    <div className="grid size-full place-items-center bg-map-sea">
      <span className="readout text-[10px] text-muted-foreground">LOADING MAP…</span>
    </div>
  );
}

export function LiveMap({ height = "clamp(380px, 58vh, 640px)", ...rest }: Props) {
  return (
    <div
      className="relative overflow-hidden rounded-md border border-border bg-map-sea shadow-[var(--shadow-card)]"
      style={{ height }}
    >
      <ClientOnly fallback={<Skeleton />}>
        <Suspense fallback={<Skeleton />}>
          <GeoMap {...rest} />
        </Suspense>
      </ClientOnly>
    </div>
  );
}
