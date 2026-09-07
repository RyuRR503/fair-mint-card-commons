import { useMemo, useRef, useState } from "react";
import { Minus, Plus, Crosshair } from "lucide-react";
import { WORLD_PATH } from "@/lib/world-path";
import { project } from "@/lib/geo";
import { rarityVar, type Rarity } from "@/lib/tokens";
import { TokenChip } from "./TokenChip";
import { cn } from "@/lib/utils";

export type MapPin = {
  key: string;
  lat: number;
  lng: number;
  label: string;
  count: number;
  symbols: string[];
  rarity: Rarity;
};

type Props = {
  pins: MapPin[];
  me?: { lat: number; lng: number } | null;
  focus?: { lat: number; lng: number; zoom?: number } | null;
  onSelect?: (key: string) => void;
  selected?: string | null;
  className?: string;
  height?: string;
};

const LEGEND: { r: Rarity; label: string }[] = [
  { r: "common", label: "COMMON" },
  { r: "rare", label: "RARE" },
  { r: "epic", label: "EPIC" },
  { r: "legendary", label: "LEGENDARY" },
];

export function WorldMap({
  pins,
  me,
  focus,
  onSelect,
  selected,
  className,
  height = "clamp(360px, 52vh, 620px)",
}: Props) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);

  const view = useMemo(() => {
    if (focus) {
      const p = project(focus.lat, focus.lng);
      const z = focus.zoom ?? 6;
      return { z, cx: p.x, cy: p.y };
    }
    return { z: zoom, cx: 0.5 + pan.x, cy: 0.5 + pan.y };
  }, [focus, zoom, pan]);

  const size = 1000 / view.z;
  const minX = Math.max(0, Math.min(1000 - size, view.cx * 1000 - size / 2));
  const minY = Math.max(0, Math.min(1000 - size, view.cy * 1000 - size / 2));

  function pinStyle(lat: number, lng: number) {
    const p = project(lat, lng);
    return {
      left: `${((p.x * 1000 - minX) / size) * 100}%`,
      top: `${((p.y * 1000 - minY) / size) * 100}%`,
    };
  }

  const visible = pins.filter((p) => {
    const q = project(p.lat, p.lng);
    return (
      q.x * 1000 > minX - 20 &&
      q.x * 1000 < minX + size + 20 &&
      q.y * 1000 > minY - 20 &&
      q.y * 1000 < minY + size + 20
    );
  });

  return (
    <div
      className={cn(
        "graded relative select-none overflow-hidden rounded-md border border-border bg-background-deep shadow-[var(--shadow-card)]",
        className,
      )}
      style={{ height }}
      onPointerDown={(e) => {
        if (focus) return;
        drag.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
        (e.target as Element).setPointerCapture?.(e.pointerId);
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d) return;
        const rect = e.currentTarget.getBoundingClientRect();
        setPan({
          x: Math.max(-0.5, Math.min(0.5, d.px - (e.clientX - d.x) / rect.width / view.z)),
          y: Math.max(-0.5, Math.min(0.5, d.py - (e.clientY - d.y) / rect.height / view.z)),
        });
      }}
      onPointerUp={() => (drag.current = null)}
      onPointerLeave={() => (drag.current = null)}
    >
      <svg
        viewBox={`${minX} ${minY} ${size} ${size}`}
        className="absolute inset-0 size-full"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <defs>
          <pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M40 0H0V40"
              fill="none"
              stroke="oklch(0.93 0.006 95 / 0.05)"
              strokeWidth={0.5 / view.z}
            />
          </pattern>
        </defs>
        {/* ocean: near-black, so land reads as a lit surface */}
        <rect x="0" y="0" width="1000" height="1000" fill="oklch(0.11 0.01 250)" />
        <rect x="0" y="0" width="1000" height="1000" fill="url(#map-grid)" />
        <path
          d={WORLD_PATH}
          fill="oklch(0.19 0.014 250)"
          stroke="oklch(0.78 0.14 55 / 0.35)"
          strokeWidth={0.7 / view.z}
        />
      </svg>

      {visible.map((p) => (
        <button
          key={p.key}
          type="button"
          onClick={() => onSelect?.(p.key)}
          className="absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none"
          style={pinStyle(p.lat, p.lng)}
        >
          <span className="relative flex flex-col items-center">
            <span className="flex items-center rounded-sm bg-background-deep/90 p-1 shadow-[var(--shadow-pop)] ring-1 ring-border backdrop-blur-sm">
              {p.symbols.slice(0, 3).map((s, i) => (
                <TokenChip
                  key={`${s}-${i}`}
                  symbol={s}
                  size={22}
                  className={i > 0 ? "-ml-2" : ""}
                />
              ))}
              <span
                className="readout ml-1 grid h-5 min-w-5 place-items-center rounded-sm px-1.5 text-[10px] text-background-deep"
                style={{ background: rarityVar(p.rarity) }}
              >
                {p.count}
              </span>
            </span>
            <span
              className={cn(
                "label-caps mt-1 whitespace-nowrap rounded-sm bg-background-deep/80 px-2 py-0.5 text-[9px] text-muted-foreground backdrop-blur-sm",
                selected === p.key && "bg-primary text-primary-foreground",
              )}
            >
              {p.label}
            </span>
          </span>
        </button>
      ))}

      {me && (
        <span
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={pinStyle(me.lat, me.lng)}
        >
          <span className="absolute inset-0 -z-10 size-4 animate-pulse-ring rounded-full bg-accent" />
          <span className="block size-4 rounded-full border-2 border-card bg-accent shadow-[var(--shadow-pop)]" />
        </span>
      )}

      <div className="glass-panel absolute left-4 top-4 flex items-center gap-2 rounded-sm px-3 py-1.5">
        <span className="size-1.5 animate-pulse rounded-full bg-primary" />
        <span className="readout text-[10px]">
          LIVE · {new Set(pins.map((p) => p.label)).size} CITIES ·{" "}
          {pins.reduce((n, p) => n + p.count, 0)} SPAWNS
        </span>
      </div>

      <div className="glass-panel absolute right-4 top-4 hidden gap-3 rounded-sm px-3 py-1.5 sm:flex">
        {LEGEND.map((l) => (
          <span key={l.r} className="flex items-center gap-1">
            <span className="size-1.5 rounded-full" style={{ background: rarityVar(l.r) }} />
            <span className="readout text-[9px]">{l.label}</span>
          </span>
        ))}
      </div>

      {!focus && (
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <MapBtn onClick={() => setZoom((z) => Math.min(12, z * 1.6))}>
            <Plus className="size-4" />
          </MapBtn>
          <MapBtn onClick={() => setZoom((z) => Math.max(1, z / 1.6))}>
            <Minus className="size-4" />
          </MapBtn>
          <MapBtn
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
          >
            <Crosshair className="size-4" />
          </MapBtn>
        </div>
      )}
    </div>
  );
}

function MapBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="glass-panel grid size-9 place-items-center rounded-sm text-muted-foreground transition-colors duration-300 hover:text-primary"
    >
      {children}
    </button>
  );
}
