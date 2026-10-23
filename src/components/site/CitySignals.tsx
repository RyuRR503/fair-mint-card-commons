import { ArrowUpRight } from "lucide-react";

const SIGNALS = [
  { symbol: "AAPLB", place: "Apple Store", className: "signal-apple", coord: "31.2304 / 121.4737" },
  { symbol: "NVDAB", place: "网吧", className: "signal-nvidia", coord: "31.2397 / 121.4998" },
  { symbol: "TSLAB", place: "超充站", className: "signal-tesla", coord: "31.2243 / 121.4689" },
];

/** Decorative city coordinates, not GPS fixes or live claim statuses. */
export function CitySignals() {
  return (
    <div className="city-signals" aria-hidden="true">
      <svg className="city-routes" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M74 36 L86 18" /><path d="M74 36 L66 66" /><path d="M66 66 L86 18" />
      </svg>
      {SIGNALS.map((s) => (
        <div key={s.symbol} className={`city-signal ${s.className}`}>
          <i className="signal-lock"><b /><b /></i>
          <span className="signal-tag">{s.symbol}<em>{s.place}</em><ArrowUpRight /></span>
          <small>{s.coord}</small>
        </div>
      ))}
      <div className="signal-handoff"><i /><span>SIGNAL → AGENT</span></div>
      <div className="city-coordinate"><span className="signal-dash" /> HUMAN × AGENT <span>01 / 03</span></div>
    </div>
  );
}