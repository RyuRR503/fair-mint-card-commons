import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import type { Map as MlMap, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { rarityVar, RARITY_LABEL, TOKEN_BY_SYMBOL, type Rarity } from "@/lib/tokens";
import { useT } from "@/lib/i18n";
import { CITY_BY_KEY } from "@/lib/cities";
import { haversine, catchRadius, formatDistance } from "@/lib/geo";
import type { MapPin } from "./WorldMap";

export type MapPoint = {
  id?: string;
  symbol: string;
  rarity: Rarity;
  place: string;
  cityKey?: string;
  amount?: number;
  expiresAt?: string;
  lat: number;
  lng: number;
};

type Props = {
  pins: MapPin[];
  points?: MapPoint[];
  me?: { lat: number; lng: number } | null;
  /** Catch radius around the player, drawn as a ring on the map. */
  meRadiusM?: number;
  onSelect?: (key: string) => void;
  selected?: string | null;
  center?: [number, number];
  zoom?: number;
};

const STYLE = "https://tiles.openfreemap.org/styles/dark";
/** Above this zoom the city bubbles step aside and each store shows itself. */
const CITY_MAX_ZOOM = 7.2;

/** maplibre only speaks sRGB, so bake the oklch tokens down to hex in the browser. */
function toHex(value: string): string {
  const v = value.trim();
  const m = v.match(/^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)/i);
  if (!m) return v || "#6ee7b7";
  let L = parseFloat(m[1]!);
  if (m[2] === "%") L /= 100;
  const C = parseFloat(m[3]!);
  const h = (parseFloat(m[4]!) * Math.PI) / 180;
  const a = C * Math.cos(h);
  const bb = C * Math.sin(h);
  const l_ = (L + 0.3963377774 * a + 0.2158037573 * bb) ** 3;
  const m_ = (L - 0.1055613458 * a - 0.0638541728 * bb) ** 3;
  const s_ = (L - 0.0894841775 * a - 1.291485548 * bb) ** 3;
  const lin = [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ];
  const ch = lin.map((u) => {
    const g = u <= 0.0031308 ? 12.92 * u : 1.055 * Math.pow(Math.max(u, 0), 1 / 2.4) - 0.055;
    return Math.round(Math.max(0, Math.min(1, g)) * 255)
      .toString(16)
      .padStart(2, "0");
  });
  return `#${ch.join("")}`;
}

function rarityColors(): Record<Rarity, string> {
  const cs = getComputedStyle(document.documentElement);
  const read = (r: Rarity) => {
    const raw = rarityVar(r);
    const name = raw.match(/var\((--[^)]+)\)/)?.[1];
    return toHex(name ? cs.getPropertyValue(name).trim() : raw);
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
  meRadiusM,
  onSelect,
  selected,
  center,
  zoom,
}: Props) {
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<MlMap | null>(null);
  const markers = useRef<Marker[]>([]);
  const ready = useRef(false);
  const t = useT();
  const tRef = useRef(t);
  tRef.current = t;
  const meRef = useRef(me);
  meRef.current = me;


  useEffect(() => {
    if (!box.current || map.current) return;
    const m = new maplibregl.Map({
      container: box.current,
      style: STYLE,
      center: center ?? [113.5, 32.5],
      zoom: zoom ?? 3.4,
      attributionControl: { compact: true },
      // first paint matters more than polish: skip tile cross-fades, cap the
      // zoom range so fewer tile levels are fetched, and never refetch expiry
      maxZoom: 16,
      fadeDuration: 0,
      refreshExpiredTiles: false,
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
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 3, 2.5, 5, 4, 12, 12, 16, 22],
        },
      });
      m.addLayer({
        id: "signal-dot",
        type: "circle",
        source: "signals",
        paint: {
          "circle-color": color,
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 3, 1.4, 5, 2.2, 10, 3.5, 14, 6, 17, 9],
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

      // tap a store signal -> card with token, amount, place and countdown
      const popup = new maplibregl.Popup({
        closeButton: true,
        closeOnClick: true,
        offset: 14,
        maxWidth: "280px",
        className: "catch-popup",
      });
      m.on("click", "signal-dot", (e) => {
        const f = e.features?.[0];
        if (!f) return;
        const p = f.properties as Record<string, string>;
        const tr = tRef.current;
        const tok = TOKEN_BY_SYMBOL[p["symbol"] ?? ""];
        const rarity = (p["rarity"] ?? "common") as Rarity;
        const rarityZh: Record<Rarity, string> = { common: "普通", rare: "稀有", epic: "史诗", legendary: "传说" };
        const amount = Number(p["amount"] ?? 0);
        const exp = p["expiresAt"] ? new Date(p["expiresAt"]) : null;
        const left = exp ? Math.max(0, Math.round((exp.getTime() - Date.now()) / 60000)) : null;
        const timeText =
          left === null
            ? ""
            : left > 60
              ? tr(`${Math.floor(left / 60)}h ${left % 60}m left`, `剩余 ${Math.floor(left / 60)} 小时 ${left % 60} 分`)
              : tr(`${left}m left`, `剩余 ${left} 分钟`);
        const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!);
        const coords = (f.geometry as { coordinates: number[] }).coordinates.slice(0, 2) as [number, number];
        const [lng, lat] = coords;
        const city = CITY_BY_KEY[p["cityKey"] ?? ""];
        const cityText = city ? tr(city.name, city.nameZh) : "";
        const expired = left !== null && left <= 0;
        const here = meRef.current;
        const dist = here ? haversine(here.lat, here.lng, lat, lng) : null;
        const inRange = dist !== null && dist <= catchRadius(20);
        const status = expired
          ? { cls: "is-off", text: tr("Expired", "已过期") }
          : inRange
            ? { cls: "is-on", text: tr("In range - catchable", "已在范围内，可捕捉") }
            : dist !== null
              ? { cls: "is-far", text: tr(`${formatDistance(dist)} away`, `距你 ${formatDistance(dist)}`) }
              : { cls: "is-ok", text: tr("Catchable on site", "到现场即可捕捉") };
        popup
          .setLngLat(coords)
          .setHTML(
            `<div class="catch-pop" style="--pin:${rarityVar(rarity)}">
              <div class="catch-pop-top">
                <span class="catch-pop-sym">${esc(p["symbol"] ?? "")}</span>
                <span class="catch-pop-rar">${esc(tr(RARITY_LABEL[rarity], rarityZh[rarity]))}</span>
              </div>
              <div class="catch-pop-name">${esc(tok ? tr(tok.name, tok.nameZh) : "")}</div>
              <div class="catch-pop-amt">${amount} <span>${esc(p["symbol"] ?? "")}</span></div>
              <div class="catch-pop-place">${esc(p["place"] ?? "")}${cityText ? ` &middot; ${esc(cityText)}` : ""}</div>
              <div class="catch-pop-geo">${lat.toFixed(5)}, ${lng.toFixed(5)}</div>
              <div class="catch-pop-status ${status.cls}">${esc(status.text)}</div>
              ${timeText && !expired ? `<div class="catch-pop-time">${esc(timeText)}</div>` : ""}
              <div class="catch-pop-hint">${esc(tr("Walk here and tap Catch in the app", "走到这里，在 app 里点 Catch 领取"))}</div>
            </div>`,
          )
          .addTo(m);
      });
      m.on("mouseenter", "signal-dot", () => {
        m.getCanvas().style.cursor = "pointer";
      });
      m.on("mouseleave", "signal-dot", () => {
        m.getCanvas().style.cursor = "";
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
    if (import.meta.env.DEV) (window as unknown as Record<string, unknown>)["__catchMap"] = m;
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
          properties: {
            symbol: p.symbol,
            rarity: p.rarity,
            place: p.place,
            cityKey: p.cityKey ?? "",
            amount: p.amount ?? 0,
            expiresAt: p.expiresAt ?? "",
          },
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
