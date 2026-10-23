import { useId } from "react";

/**
 * CATCH logo drawn as flat vector shapes using the same gradient stops as the
 * hero wordmark (primary -> gold -> foreground -> gold), so it always matches.
 * The A has no crossbar: a glowing "agent eye" dot sits in its place.
 */
export function CatchLogo({ className = "", title = "CATCH" }: { className?: string; title?: string }) {
  const id = useId().replace(/:/g, "");
  const paint = `url(#catch-grad-${id})`;
  const c = "M43 32V27Q43 17 33 17H17Q7 17 7 27V73Q7 83 17 83H33Q43 83 43 73V68";
  return (
    <svg
      viewBox="0 10 286 80"
      role="img"
      aria-label={title}
      className={`catch-logo ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`catch-grad-${id}`} gradientUnits="userSpaceOnUse" x1="0" y1="90" x2="286" y2="10">
          <stop offset="0" stopColor="var(--primary)" />
          <stop offset="0.38" stopColor="var(--gold)" />
          <stop offset="0.72" stopColor="var(--foreground)" />
          <stop offset="1" stopColor="var(--gold)" />
        </linearGradient>
      </defs>
      <g fill={paint}>
        <path d={c} fill="none" stroke={paint} strokeWidth="14" />
        <path d="M60 90L80 10H94L114 90H100L87 36L74 90Z" />
        <rect x="124" y="10" width="46" height="14" />
        <rect x="140" y="10" width="14" height="80" />
        <path d="M223 32V27Q223 17 213 17H197Q187 17 187 27V73Q187 83 197 83H213Q223 83 223 73V68" fill="none" stroke={paint} strokeWidth="14" />
        <rect x="240" y="10" width="14" height="80" />
        <rect x="272" y="10" width="14" height="80" />
        <rect x="240" y="43" width="46" height="14" />
      </g>
      <circle className="catch-logo-eye-glow" cx="87" cy="72" r="9" fill="var(--primary)" />
      <circle className="catch-logo-eye" cx="87" cy="72" r="5.5" fill="var(--primary)" />
    </svg>
  );
}
