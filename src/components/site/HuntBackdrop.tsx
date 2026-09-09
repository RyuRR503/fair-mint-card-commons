/**
 * CATCH backdrop — "Daylight Field": warm paper, a faint survey grid and a few
 * quiet signal-green markers. Pure atmosphere; it must never compete with
 * content, and it must never look like a dark HUD.
 */
const MARKERS = [
  { top: "18%", left: "9%", delay: "0s", tone: "var(--signal)" },
  { top: "34%", left: "86%", delay: "2.4s", tone: "var(--sky-deep)" },
  { top: "62%", left: "22%", delay: "4.3s", tone: "var(--signal)" },
  { top: "78%", left: "72%", delay: "1.4s", tone: "var(--alert)" },
];

export function HuntBackdrop() {
  return (
    <div aria-hidden className="hunt-bg pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="grid-field absolute inset-0" />

      {MARKERS.map((m, i) => (
        <span
          key={i}
          className="absolute size-1.5 rounded-full"
          style={{ top: m.top, left: m.left }}
        >
          <span
            className="animate-pulse-ring absolute inset-0 rounded-full"
            style={{ background: m.tone, animationDelay: m.delay, opacity: 0.3 }}
          />
          <span
            className="absolute inset-0 rounded-full"
            style={{ background: m.tone, opacity: 0.5 }}
          />
        </span>
      ))}

      <div
        className="absolute inset-x-0 bottom-0 h-72"
        style={{ background: "linear-gradient(180deg, transparent, var(--background))" }}
      />
    </div>
  );
}
