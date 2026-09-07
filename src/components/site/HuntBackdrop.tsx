/**
 * CATCH backdrop — "Night Signal": a near-black field, a barely-visible radar
 * grid, one very slow sweep and a handful of amber signal blips. Everything
 * here is atmosphere; it must never compete with the content.
 */
const BLIPS = [
  { top: "17%", left: "11%", delay: "0s", tone: "var(--signal)" },
  { top: "35%", left: "84%", delay: "2.2s", tone: "var(--accent)" },
  { top: "63%", left: "24%", delay: "4.1s", tone: "var(--signal)" },
  { top: "76%", left: "70%", delay: "1.3s", tone: "var(--signal)" },
  { top: "47%", left: "55%", delay: "5.4s", tone: "var(--accent)" },
];

export function HuntBackdrop() {
  return (
    <div aria-hidden className="hunt-bg pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="grid-field absolute inset-0" />

      {/* volumetric sweep — slow enough to read as breathing, not spinning */}
      <div className="absolute -right-56 -top-56 size-[52rem] opacity-40">
        <div className="map-sweep size-full rounded-full" />
      </div>

      {BLIPS.map((b, i) => (
        <span
          key={i}
          className="absolute size-1.5 rounded-full"
          style={{ top: b.top, left: b.left }}
        >
          <span
            className="animate-pulse-ring absolute inset-0 rounded-full"
            style={{ background: b.tone, animationDelay: b.delay, opacity: 0.35 }}
          />
          <span
            className="absolute inset-0 rounded-full"
            style={{ background: b.tone, opacity: 0.55 }}
          />
        </span>
      ))}

      {/* vignette: drop the corners ~35% so the frame feels like a lens */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 40%, transparent 55%, var(--background-deep) 100%)",
        }}
      />

      <div
        className="absolute inset-x-0 bottom-0 h-72"
        style={{ background: "linear-gradient(180deg, transparent, var(--background))" }}
      />
    </div>
  );
}
