import { Crosshair, ArrowUpRight } from "lucide-react";

/** Decorative city coordinates, not GPS fixes or live claim statuses. */
export function CitySignals() {
  return (
    <div className="city-signals" aria-hidden="true">
      <div className="city-signal signal-apple"><Crosshair /><span>AAPLB <ArrowUpRight /></span><small>31.2304 / 121.4737</small></div>
      <div className="city-signal signal-nvidia"><Crosshair /><span>NVDAB <ArrowUpRight /></span></div>
      <div className="city-signal signal-tesla"><Crosshair /><span>TSLAB <ArrowUpRight /></span></div>
      <div className="city-coordinate"><span className="signal-dash" /> HUMAN × AGENT <span>01 / 03</span></div>
    </div>
  );
}