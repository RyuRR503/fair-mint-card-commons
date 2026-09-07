import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import type { Map as MlMap, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { rarityVar } from "@/lib/tokens";
import type { MapPin } from "./WorldMap";

type Props = {
  pins: MapPin[];
  me?: { lat: number; lng: number } | null;
  onSelect?: (key: string) => void;
  selected?: string | null;
  center?: [number, number];
  zoom?: number;
};

const STYLE = "https://tiles.openfreemap.org/styles/dark";

export default function GeoMap({ pins, me, onSelect, selected, center, zoom }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<MlMap | null>(null);
  const markers = useRef<Marker[]>([]);

  useEffect(() => {
    if (!box.current || map.current) return;
    const m = new maplibregl.Map({
      container: box.current,
      style: STYLE,
      center: center ?? [113.5, 32.5],
      zoom: zoom ?? 3.4,
      attributionControl: { compact: true },
    });
    m.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
    m.addControl(new maplibregl.ScaleControl({ unit: "metric" }), "bottom-left");
    map.current = m;
    return () => {
      m.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // pins
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    markers.current.forEach((mk) => mk.remove());
    markers.current = [];

    for (const p of pins) {
      const el = document.createElement("button");
      el.type = "button";
      el.className = "catch-pin" + (selected === p.key ? " is-on" : "");
      el.style.setProperty("--pin", rarityVar(p.rarity));
      el.innerHTML =
        `<span class="catch-pin-dot"></span>` +
        `<span class="catch-pin-label">${p.label} <b>${p.count}</b></span>`;
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onSelect?.(p.key);
      });
      markers.current.push(
        new maplibregl.Marker({ element: el, anchor: "center" })
          .setLngLat([p.lng, p.lat])
          .addTo(m),
      );
    }
  }, [pins, selected, onSelect]);

  // own position
  useEffect(() => {
    const m = map.current;
    if (!m || !me) return;
    const el = document.createElement("div");
    el.className = "catch-me";
    const mk = new maplibregl.Marker({ element: el }).setLngLat([me.lng, me.lat]).addTo(m);
    return () => {
      mk.remove();
    };
  }, [me]);

  // camera
  useEffect(() => {
    const m = map.current;
    if (!m || !center) return;
    m.flyTo({ center, zoom: zoom ?? 12, duration: 1200, essential: true });
  }, [center, zoom]);

  return <div ref={box} className="catch-map size-full" />;
}
