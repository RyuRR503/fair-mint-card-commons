import { useId } from "react";

/**
 * CATCH logo: compact geometric monoline letters painted with the hero
 * wordmark gradient (primary -> gold -> foreground -> gold). The second C
 * "catches" a glowing agent dot.
 */
export function CatchLogo({ className = "", title = "CATCH" }: { className?: string; title?: string }) {
  const id = `catch-grad-${useId().replace(/:/g, "")}`;
  const paint = `url(#${id})`;
  return (
    <svg
      viewBox="0 0 352 100"
      role="img"
      aria-label={title}
      className={`catch-logo ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1="92" x2="344" y2="8">
          <stop offset="0" stopColor="var(--primary)" />
          <stop offset="0.38" stopColor="var(--gold)" />
          <stop offset="0.72" stopColor="var(--foreground)" />
          <stop offset="1" stopColor="var(--gold)" />
        </linearGradient>
      </defs>
      <path
        d="M64 30A28 28 0 1 0 64 70M78 90L106 12L134 90M87 64H125M148 14.5H204M176 14.5V90M274 30A28 28 0 1 0 274 70M288 10V90M344 10V90M288 50H344"
        fill="none"
        stroke={paint}
        strokeWidth="11"
        strokeLinejoin="miter"
      />
      <circle className="catch-logo-eye-glow" cx="246" cy="50" r="15" fill="var(--primary)" />
      <circle className="catch-logo-eye" cx="246" cy="50" r="9" fill={paint} />
    </svg>
  );
}
