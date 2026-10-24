import { useRef, useState } from "react";
import { WORLD_PATH } from "@/lib/world-path";
import { project } from "@/lib/geo";
import { CITIES } from "@/lib/spawns";

export type FlapMapPoint = { id: string; lat: number; lng: number; label?: string; cooling?: boolean };

type View = { x: number; y: number; w: number };
const ASPECT = 1.25; // height / width of the viewport box
const CHINA: View = { x: 760, y: 160, w: 150 };

const P = (lat: number, lng: number) => {
  const p = project(lat, lng);
  return { x: p.x * 1000, y: p.y * 1000 };
};

/**
 * Zoomable offline map for the Flap sandbox: no tile server, no map library,
 * no layout measurement. Drag to pan, wheel or pinch to zoom, from city level
 * (about 150 units wide) down to street-block level (about 0.02 units).
 */
export function FlapOfflineMap({
  points = [],
  me,
  onSelect,
  className = "",
}: {
  points?: FlapMapPoint[];
  me?: { lat: number; lng: number } | null;
  onSelect?: (id: string) => void;
  className?: string;
}) {
  const [view, setView] = useState<View>(CHINA);
  const ref = useRef<SVGSVGElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<number | null>(null);

  const scale = () => view.w / (ref.current?.clientWidth || 360);
  const zoom = (f: number, cx = view.x + view.w / 2, cy = view.y + (view.w * ASPECT) / 2) =>
    setView((v) => {
      const w = Math.min(1000, Math.max(0.02, v.w * f));
      const k = w / v.w;
      return { w, x: cx - (cx - v.x) * k, y: cy - (cy - v.y) * k };
    });
  const focus = (lat: number, lng: number, w: number) => {
    const p = P(lat, lng);
    setView({ w, x: p.x - w / 2, y: p.y - (w * ASPECT) / 2 });
  };

  const r = view.w / 120; // marker radius in map units, constant on screen

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-border bg-background ${className}`}>
      <svg
        ref={ref}
        viewBox={`${view.x} ${view.y} ${view.w} ${view.w * ASPECT}`}
        className="block w-full touch-none select-none"
        style={{ aspectRatio: `1 / ${ASPECT}` }}
        onWheel={(e) => zoom(e.deltaY > 0 ? 1.2 : 1 / 1.2)}
        onPointerDown={(e) => {
          (e.target as Element).setPointerCapture?.(e.pointerId);
          pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        }}
        onPointerMove={(e) => {
          const prev = pointers.current.get(e.pointerId);
          if (!prev) return;
          const pts = [...pointers.current.values()];
          if (pts.length === 2) {
            const other = pts.find((p) => p !== prev)!;
            const d = Math.hypot(e.clientX - other.x, e.clientY - other.y);
            if (pinch.current) zoom(pinch.current / d);
            pinch.current = d;
          } else {
            const s = scale();
            setView((v) => ({ ...v, x: v.x - (e.clientX - prev.x) * s, y: v.y - (e.clientY - prev.y) * s }));
          }
          pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        }}
        onPointerUp={(e) => {
          pointers.current.delete(e.pointerId);
          pinch.current = null;
        }}
        onPointerCancel={(e) => {
          pointers.current.delete(e.pointerId);
          pinch.current = null;
        }}
      >
        <defs>
          <pattern id="flap-grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M10 0H0V10" fill="none" stroke="var(--border)" strokeWidth="0.15" />
          </pattern>
        </defs>
        <rect x="-500" y="-500" width="2000" height="2000" fill="url(#flap-grid)" />
        <path d={WORLD_PATH} fill="var(--card)" stroke="var(--primary)" strokeOpacity="0.45" strokeWidth={view.w / 600} />
        {CITIES.map((c) => {
          const p = P(c.lat, c.lng);
          return (
            <g key={c.key} onClick={() => focus(c.lat, c.lng, 0.6)} className="cursor-pointer">
              <circle cx={p.x} cy={p.y} r={r * 0.6} fill="var(--primary)" opacity="0.5" />
              {view.w < 60 && (
                <text x={p.x + r} y={p.y + r * 0.4} fontSize={r * 1.6} fill="var(--muted-foreground)">
                  {c.nameZh}
                </text>
              )}
            </g>
          );
        })}
        {points.map((pt) => {
          const p = P(pt.lat, pt.lng);
          return (
            <g key={pt.id} onClick={() => onSelect?.(pt.id)} className="cursor-pointer">
              <circle cx={p.x} cy={p.y} r={r * 1.8} fill="var(--primary)" opacity={pt.cooling ? 0.08 : 0.2} />
              <circle cx={p.x} cy={p.y} r={r * 0.8} fill={pt.cooling ? "var(--muted-foreground)" : "var(--primary)"} />
              {pt.label && view.w < 2 && (
                <text x={p.x + r * 1.4} y={p.y + r * 0.5} fontSize={r * 1.4} fill="var(--foreground)">
                  {pt.label}
                </text>
              )}
            </g>
          );
        })}
        {me && (() => {
          const p = P(me.lat, me.lng);
          return (
            <g>
              <circle cx={p.x} cy={p.y} r={r * 2.4} fill="var(--accent)" opacity="0.25" />
              <circle cx={p.x} cy={p.y} r={r * 0.9} fill="var(--accent)" stroke="var(--background)" strokeWidth={r * 0.3} />
            </g>
          );
        })()}
      </svg>
      <div className="absolute right-3 top-3 flex flex-col gap-2">
        <button type="button" aria-label="放大" onClick={() => zoom(1 / 1.6)} className="h-9 w-9 rounded-lg border border-border bg-card text-lg text-foreground">+</button>
        <button type="button" aria-label="缩小" onClick={() => zoom(1.6)} className="h-9 w-9 rounded-lg border border-border bg-card text-lg text-foreground">−</button>
        <button type="button" aria-label="回到全国" onClick={() => setView(CHINA)} className="h-9 w-9 rounded-lg border border-border bg-card text-xs text-foreground">全国</button>
        {me && (
          <button type="button" aria-label="定位到我" onClick={() => focus(me.lat, me.lng, 0.05)} className="h-9 w-9 rounded-lg border border-border bg-card text-xs text-primary">我</button>
        )}
      </div>
    </div>
  );
}
