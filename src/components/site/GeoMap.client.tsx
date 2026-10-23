import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import type { Map as MlMap, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import { isPreviewHost } from "@/lib/site-gate";

// Under Vite, maplibre-gl 6 cannot locate its worker on its own and leaves the
// basemap blank ("Worker failed to load"); point it at the bundled worker.
maplibregl.setWorkerUrl(maplibreWorkerUrl);
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
  /** Taken recently; shown greyed until it respawns at this ISO time. */
  respawnAt?: string;
  lat: number;
  lng: number;
};

/** The next timed legendary drop, drawn as one gold marker on the map. */
export type LegendaryPoint = {
  id: string;
  place: string;
  city: string;
  lat: number;
  lng: number;
  startsAt: string;
  durationMin: number;
};

type Props = {
  pins: MapPin[];
  points?: MapPoint[];
  legendary?: LegendaryPoint | null;
  me?: { lat: number; lng: number } | null;
  /** Catch radius around the player, drawn as a ring on the map. */
  meRadiusM?: number;
  onSelect?: (key: string) => void;
  onSelectPoint?: (id: string) => void;
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
  legendary,
  me,
  meRadiusM,
  onSelect,
  onSelectPoint,
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
      const rarityColor = color;
      const tone = ["case", ["==", ["get", "cooling"], 1], "#5b5f63", rarityColor] as unknown as maplibregl.DataDrivenPropertyValueSpecification<string>;

      m.addLayer({
        id: "signal-glow",
        type: "circle",
        source: "signals",
        paint: {
          "circle-color": tone,
          "circle-blur": 1,
          "circle-opacity": ["case", ["==", ["get", "cooling"], 1], 0, 0.35],
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 3, 2.5, 5, 4, 12, 12, 16, 22],
        },
      });
      m.addLayer({
        id: "signal-dot",
        type: "circle",
        source: "signals",
        paint: {
          "circle-color": tone,
          "circle-opacity": ["case", ["==", ["get", "cooling"], 1], 0.55, 1],
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
      const openSignal = (f: { properties: Record<string, string>; geometry: { coordinates: number[] } }) => {
        const p = f.properties as Record<string, string>;
        if (p["id"]) onSelectPoint?.(p["id"]);
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
        const respawn = p["respawnAt"] ? new Date(p["respawnAt"]).getTime() : 0;
        const coolMin = respawn ? Math.max(1, Math.ceil((respawn - Date.now()) / 60000)) : 0;
        const coolText = coolMin >= 60 ? tr(`${Math.floor(coolMin / 60)}h ${coolMin % 60}m`, `${Math.floor(coolMin / 60)} 小时 ${coolMin % 60} 分`) : tr(`${coolMin} min`, `${coolMin} 分钟`);
        const status = respawn
          ? { cls: "is-off", text: tr(`Taken · back in about ${coolText}`, `已被领取 · 约 ${coolText}后刷新`) }
          : expired
          ? { cls: "is-off", text: tr("Expired", "已过期") }
          : inRange
            ? { cls: "is-on", text: tr("In range · get the claim code", "已在范围内 · 可获取领取码") }
            : dist !== null
              ? { cls: "is-far", text: tr(`${formatDistance(dist)} away`, `距你 ${formatDistance(dist)}`) }
              : { cls: "is-ok", text: tr("Open · claim on site with your Agent Wallet", "开放中 · 到现场用 Agent 钱包领取") };
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
              <div class="catch-pop-hint">${esc(tr("Claims need on-site location verification and an Agent Wallet.", "领取须通过现场定位校验，并由 Agent 钱包提交。"))}</div>
              ${isPreviewHost(window.location.host) ? `<div class="catch-pop-hint">${esc(tr("Preview: after closing this card, use “Test: put me at this point” in the right panel.", "预览版：关掉这张卡片后，在右侧面板点“测试：把我的位置设到这个点位”。"))}</div>` : ""}
            </div>`,
          )
          .addTo(m);
      };
      for (const layer of ["signal-dot", "signal-label"] as const) {
        m.on("click", layer, (e) => {
          const f = e.features?.[0];
          if (f) openSignal(f as unknown as { properties: Record<string, string>; geometry: { coordinates: number[] } });
        });
      }
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
            id: p.id ?? "",
            symbol: p.symbol,
            rarity: p.rarity,
            place: p.place,
            cityKey: p.cityKey ?? "",
            amount: p.amount ?? 0,
            expiresAt: p.expiresAt ?? "",
            respawnAt: p.respawnAt ?? "",
            cooling: p.respawnAt ? 1 : 0,
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

  // the next legendary drop: one gold marker, tap for the event card
  useEffect(() => {
    const m = map.current;
    if (!m || !legendary) return;

    const el = document.createElement("button");
    el.type = "button";
    el.className = "catch-legend";
    el.title = tRef.current("Legendary event", "传奇活动");
    el.innerHTML =
      `<span class="catch-legend-dot"></span>` +
      `<span class="catch-legend-label">SPCX · ${tRef.current("legendary", "传奇")}</span>`;

    const popup = new maplibregl.Popup({
      closeButton: true,
      closeOnClick: true,
      offset: 14,
      maxWidth: "280px",
      className: "catch-popup",
    });
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      onSelectPoint?.(legendary.id);
      m.flyTo({ center: [legendary.lng, legendary.lat], zoom: 13, duration: 1200, essential: true });

      const tr = tRef.current;
      const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!);
      const start = new Date(legendary.startsAt).getTime();
      const end = start + legendary.durationMin * 60000;
      const now = Date.now();
      const live = now >= start && now <= end;
      const mins = live ? Math.max(1, Math.ceil((end - now) / 60000)) : Math.max(1, Math.ceil((start - now) / 60000));
      const status = live
        ? { cls: "is-on", text: tr(`Live now · open for about ${mins} more min`, `正在进行 · 剩余约 ${mins} 分钟`) }
        : {
            cls: "is-far",
            text: tr(
              `Opens in about ${mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`}`,
              `约 ${mins >= 60 ? `${Math.floor(mins / 60)} 小时 ${mins % 60} 分` : `${mins} 分钟`}后开始`,
            ),
          };
      popup
        .setLngLat([legendary.lng, legendary.lat])
        .setHTML(
          `<div class="catch-pop" style="--pin:${rarityVar("legendary")}">
            <div class="catch-pop-top">
              <span class="catch-pop-sym">SPCXB</span>
              <span class="catch-pop-rar">${esc(tr(RARITY_LABEL.legendary, "传说"))}</span>
            </div>
            <div class="catch-pop-amt">1 <span>SPCXB</span></div>
            <div class="catch-pop-place">${esc(legendary.place)} · ${esc(legendary.city)}</div>
            <div class="catch-pop-time">${esc(new Date(legendary.startsAt).toLocaleString())}</div>
            <div class="catch-pop-status ${status.cls}">${esc(status.text)}</div>
            <div class="catch-pop-hint">${esc(tr("Timed event only — it has no permanent store pins. Rules on the legendary page.", "传奇为限时活动，无常驻点位，规则见「传奇活动」页。"))}</div>
          </div>`,
        )
        .addTo(m);
    });

    const mk = new maplibregl.Marker({ element: el, anchor: "center" })
      .setLngLat([legendary.lng, legendary.lat])
      .addTo(m);
    return () => {
      mk.remove();
    };
  }, [legendary, onSelectPoint]);

  // own position: a pulsing dot plus the catch radius drawn to scale
  useEffect(() => {
    const m = map.current;
    if (!m || !me) return;
    const el = document.createElement("div");
    el.className = "catch-me";
    el.title = tRef.current("You are here", "你在这里");
    const mk = new maplibregl.Marker({ element: el }).setLngLat([me.lng, me.lat]).addTo(m);

    const radius = meRadiusM ?? 0;
    const SRC = "me-range";
    const ring = () => {
      const steps = 64;
      const latR = radius / 111320;
      const lngR = radius / (111320 * Math.cos((me.lat * Math.PI) / 180) || 1);
      const coords: [number, number][] = [];
      for (let i = 0; i <= steps; i++) {
        const a = (i / steps) * Math.PI * 2;
        coords.push([me.lng + lngR * Math.cos(a), me.lat + latR * Math.sin(a)]);
      }
      return {
        type: "Feature" as const,
        properties: {},
        geometry: { type: "Polygon" as const, coordinates: [coords] },
      };
    };

    const draw = () => {
      if (radius <= 0) return;
      const data = ring();
      const existing = m.getSource(SRC) as maplibregl.GeoJSONSource | undefined;
      if (existing) {
        existing.setData(data);
        return;
      }
      m.addSource(SRC, { type: "geojson", data });
      m.addLayer({
        id: "me-range-fill",
        type: "fill",
        source: SRC,
        paint: { "fill-color": toHex(getComputedStyle(document.documentElement).getPropertyValue("--primary")), "fill-opacity": 0.1 },
      });
      m.addLayer({
        id: "me-range-line",
        type: "line",
        source: SRC,
        paint: { "line-color": toHex(getComputedStyle(document.documentElement).getPropertyValue("--primary")), "line-width": 1.5, "line-opacity": 0.6 },
      });
    };

    if (ready.current) draw();
    else m.once("load", draw);

    return () => {
      mk.remove();
      if (m.getLayer("me-range-fill")) m.removeLayer("me-range-fill");
      if (m.getLayer("me-range-line")) m.removeLayer("me-range-line");
      if (m.getSource(SRC)) m.removeSource(SRC);
    };
  }, [me, meRadiusM]);

  // camera
  useEffect(() => {
    const m = map.current;
    if (!m || !center) return;
    m.flyTo({ center, zoom: zoom ?? 12, duration: 1200, essential: true });
  }, [center, zoom]);

  return <div ref={box} className="catch-map size-full" />;
}
