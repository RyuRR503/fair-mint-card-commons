/**
 * CATCH logo drawn as flat vector shapes in the site's own primary token,
 * so its colour and finish always match buttons and headlines.
 * The A has no crossbar: a glowing "agent eye" dot sits in its place.
 */
export function CatchLogo({ className = "", title = "CATCH" }: { className?: string; title?: string }) {
  const c = "M43 32V27Q43 17 33 17H17Q7 17 7 27V73Q7 83 17 83H33Q43 83 43 73V68";
  return (
    <svg
      viewBox="0 10 286 80"
      role="img"
      aria-label={title}
      className={`catch-logo ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill="var(--primary)">
        <path d={c} fill="none" stroke="var(--primary)" strokeWidth="14" />
        <path d="M60 90L80 10H94L114 90H100L87 36L74 90Z" />
        <rect x="124" y="10" width="46" height="14" />
        <rect x="140" y="10" width="14" height="80" />
        <path d={c} transform="translate(180 0)" fill="none" stroke="var(--primary)" strokeWidth="14" />
        <rect x="240" y="10" width="14" height="80" />
        <rect x="272" y="10" width="14" height="80" />
        <rect x="240" y="43" width="46" height="14" />
      </g>
      <circle className="catch-logo-eye-glow" cx="87" cy="72" r="9" fill="var(--primary)" />
      <circle className="catch-logo-eye" cx="87" cy="72" r="5.5" fill="var(--foreground)" />
    </svg>
  );
}
