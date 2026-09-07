import { TOKEN_BY_SYMBOL } from "@/lib/tokens";
import { cn } from "@/lib/utils";

type Props = {
  symbol: string;
  size?: number;
  className?: string;
  float?: boolean;
  spin?: number;
  delay?: number;
};

/**
 * A field-guide specimen tag, not a glossy crypto coin.
 * Printed white card, hairline ink rule, a solid colour band along the top in
 * the company's hue, and the ticker set in mono like a catalogue number.
 */
export function TokenChip({
  symbol,
  size = 56,
  className,
  float,
  spin = 0,
  delay = 0,
}: Props) {
  const token = TOKEN_BY_SYMBOL[symbol];
  const hue = token?.color ?? "#5C7A4A";
  const glyph = token?.glyph || symbol.slice(0, 2);

  return (
    <span
      className={cn(
        "relative inline-grid place-items-center overflow-hidden rounded-[14%] bg-card",
        float && "animate-float",
        className,
      )}
      style={{
        width: size,
        height: size,
        // @ts-expect-error custom property
        "--spin": `${spin}deg`,
        animationDelay: `${delay}s`,
        boxShadow: `inset 0 0 0 1px var(--border), 0 ${size * 0.08}px ${size * 0.2}px -${size * 0.12}px oklch(0.25 0.008 135 / 0.35)`,
      }}
      aria-label={symbol}
    >
      {/* colour band — the only saturated area on the tag */}
      <span
        className="absolute inset-x-0 top-0"
        style={{ height: Math.max(3, size * 0.14), background: hue }}
      />
      {/* punched hole, like a tag tied to a branch */}
      <span
        className="absolute rounded-full bg-background"
        style={{
          width: Math.max(2, size * 0.07),
          height: Math.max(2, size * 0.07),
          top: size * 0.2,
          left: size * 0.1,
          boxShadow: "inset 0 0 0 1px var(--border)",
        }}
      />
      <span
        className="relative mt-[8%] font-mono font-semibold leading-none text-foreground"
        style={{
          fontSize: size * (glyph.length > 1 ? 0.28 : 0.38),
          letterSpacing: "0.02em",
        }}
      >
        {glyph}
      </span>
    </span>
  );
}

