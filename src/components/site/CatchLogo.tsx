import { useId } from "react";

/**
 * CATCH logo: wide geometric monoline letters painted with the hero wordmark
 * gradient (primary -> gold -> foreground -> gold). The second C "catches" a
 * glowing agent dot.
 */
export function CatchLogo({ className = "", title = "CATCH" }: { className?: string; title?: string }) {
  const id = `catch-grad-${useId().replace(/:/g, "")}`;
  const paint = `url(#${id})`;
  return (
    <svg
      viewBox="-1 8 455 84"
      role="img"
      aria-label={title}
      className={`catch-logo ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1="90" x2="452" y2="10">
          <stop offset="0" stopColor="var(--primary)" />
          <stop offset="0.38" stopColor="var(--gold)" />
          <stop offset="0.72" stopColor="var(--foreground)" />
          <stop offset="1" stopColor="var(--gold)" />
        </linearGradient>
      </defs>
      <path
        d="M65.5 24.5A36 36 0 1 0 65.5 75.5M100 90L135 12L170 90M111.4 64H158.6M205 14.5H265M235 14.5V90M355.5 24.5A36 36 0 1 0 355.5 75.5M404.5 10V90M447.5 10V90M404.5 50H447.5"
        fill="none"
        stroke={paint}
        strokeWidth="11"
        strokeLinejoin="miter"
      />
      <circle className="catch-logo-eye-glow" cx="330" cy="50" r="15" fill="var(--primary)" />
      <circle className="catch-logo-eye" cx="330" cy="50" r="9" fill={paint} />
    </svg>
  );
}
