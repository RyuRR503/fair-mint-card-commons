/**
 * CATCH backdrop — a dark radar field: gradient glow, scanning grid,
 * a slow sweep arm and a few drifting signal blips.
 */
const BLIPS = [
  { top: "18%", left: "12%", delay: "0s", tone: "var(--signal)" },
  { top: "34%", left: "82%", delay: "1.4s", tone: "var(--alert)" },
  { top: "62%", left: "26%", delay: "2.6s", tone: "var(--signal)" },
  { top: "74%", left: "68%", delay: "0.8s", tone: "var(--gold)" },
  { top: "48%", left: "54%", delay: "3.4s", tone: "var(--signal)" },
];

export function HuntBackdrop() {
  return (
    <div aria-hidden className="hunt-bg pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="grid-field absolute inset-0" />

      <div className="absolute -right-40 -top-40 size-[46rem] opacity-25">
        <div
          className="animate-sweep size-full rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, color-mix(in oklab, var(--signal) 45%, transparent) 24deg, transparent 42deg)",
          }}
        />
      </div>

      {BLIPS.map((b, i) => (
        <span key={i} className="absolute size-2 rounded-full" style={{ top: b.top, left: b.left }}>
          <span
            className="animate-pulse-ring absolute inset-0 rounded-full"
            style={{ background: b.tone, animationDelay: b.delay, opacity: 0.5 }}
          />
          <span className="absolute inset-0 rounded-full" style={{ background: b.tone, opacity: 0.7 }} />
        </span>
      ))}

      <div
        className="absolute inset-x-0 bottom-0 h-64"
        style={{ background: "linear-gradient(180deg, transparent, var(--background))" }}
      />
    </div>
  );
}
