import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import type { Map as MlMap, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { rarityVar, type Rarity } from "@/lib/tokens";
import type { MapPin } from "./WorldMap";

export type MapPoint = {
  symbol: string;
  rarity: Rarity;
  place: string;
  lat: number;
  lng: number;
};

type Props = {
  pins: MapPin[];
  points?: MapPoint[];
  me?: { lat: number; lng: number } | null;
  onSelect?: (key: string) => void;
  selected?: string | null;
  center?: [number, number];
  zoom?: number;
};

const STYLE = "https://tiles.openfreemap.org/styles/dark";
/** Above this zoom the city bubbles step aside and each store shows itself. */
const CITY_MAX_ZOOM = 7.2;

/** maplibre needs literal colours, so resolve the rarity tokens once in the browser. */
function rarityColors(): Record<Rarity, string> {
  const cs = getComputedStyle(document.documentElement);
  const read = (r: Rarity) => {
    const raw = rarityVar(r);
    const name = raw.match(/var\((--[^)]+)\)/)?.[1];
    return (name ? cs.getPropertyValue(name).trim() : raw) || "#6ee7b7";
  };
  return {
    common: read("common"),
    rare: read("rare"),
    epic: read("epic"),
    legendary: read("legendary"),
  };
}

export default function GeoMap({
  pins,
  points = [],
  me,
  onSelect,
  selected,
  center,
  zoom,
}: Props) {
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<MlMap | null>(null);
  const markers = useRef<Marker[]>([]);
  const ready = useRef(false);

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
    m.on("load", () => {
      ready.current = true;
      const c = rarityColors();
      m.addSource("signals", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      const color: maplibregl.DataDrivenPropertyValueSpecification<string> = [
        "match",
        ["get", "rarity"],
        "rare",
        c.rare,
        "epic",
        c.epic,
        "legendary",
        c.legendary,
        c.common,
      ] as unknown as maplibregl.DataDrivenPropertyValueSpecification<string>;

      m.addLayer({
        id: "signal-glow",
        type: "circle",
        source: "signals",
        paint: {
          "circle-color": color,
          "circle-blur": 1,
          "circle-opacity": 0.35,
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 5, 4, 12, 12, 16, 22],
        },
      });
      m.addLayer({
        id: "signal-dot",
        type: "circle",
        source: "signals",
        paint: {
          "circle-color": color,
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 5, 1.6, 10, 3.5, 14, 6, 17, 9],
          "circle-stroke-width": ["interpolate", ["linear"], ["zoom"], 10, 0, 13, 1.5],
          "circle-stroke-color": "#0a0d0c",
        },
      });
      m.addLayer({
        id: "signal-label",
        type: "symbol",
        source: "signals",
        minzoom: 10.5,
        layout: {
          "text-field": ["concat", ["get", "symbol"], "  ·  ", ["get", "place"]],
          "text-font": ["Noto Sans Regular"],
          "text-size": ["interpolate", ["linear"], ["zoom"], 11, 10, 15, 12],
          "text-offset": [0, 1.2],
          "text-anchor": "top",
          "text-allow-overlap": false,
          "text-max-width": 14,
        },
        paint: {
          "text-color": "#e8f5ef",
          "text-halo-color": "#05070699",
          "text-halo-width": 1.4,
        },
      });
    });
    const syncCity = () => {
      const hide = m.getZoom() >= CITY_MAX_ZOOM;
      for (const mk of markers.current) {
        mk.getElement().style.display = hide ? "none" : "";
      }
    };
    m.on("zoom", syncCity);
    map.current = m;
    return () => {
      m.remove();
      map.current = null;
      ready.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // individual store signals
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    const push = () => {
      const src = m.getSource("signals") as maplibregl.GeoJSONSource | undefined;
      if (!src) return;
      src.setData({
        type: "FeatureCollection",
        features: points.map((p) => ({
          type: "Feature" as const,
          geometry: { type: "Point" as const, coordinates: [p.lng, p.lat] },
          properties: { symbol: p.symbol, rarity: p.rarity, place: p.place },
        })),
      });
    };
    if (ready.current) push();
    else m.once("load", push);
  }, [points]);

  // city bubbles
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
      el.style.display = m.getZoom() >= CITY_MAX_ZOOM ? "none" : "";
      el.innerHTML =
        `<span class="catch-pin-dot"></span>` +
        `<span class="catch-pin-label">${p.label} <b>${p.count}</b></span>`;
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onSelect?.(p.key);
        m.flyTo({ center: [p.lng, p.lat], zoom: 12, duration: 1400, essential: true });
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
