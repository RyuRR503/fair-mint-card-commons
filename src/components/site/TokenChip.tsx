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
 * An instrument-panel token key: dark frosted square, a saturated colour bar
 * along the top in the company's hue, ticker set in mono.
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
  const hue = token?.color ?? "#00FF9D";
  const glyph = token?.glyph || symbol.slice(0, 2);

  return (
    <span
      className={cn(
        "relative inline-grid place-items-center overflow-hidden rounded-[22%] bg-card",
        float && "animate-float",
        className,
      )}
      style={{
        width: size,
        height: size,
        // @ts-expect-error custom property
        "--spin": `${spin}deg`,
        animationDelay: `${delay}s`,
        boxShadow: `inset 0 0 0 1px var(--border), inset 0 1px 0 0 oklch(1 0 0 / 0.1), 0 ${size * 0.12}px ${size * 0.28}px -${size * 0.16}px oklch(0 0 0 / 0.8)`,
      }}
      aria-label={symbol}
    >
      <span
        className="absolute inset-x-0 top-0"
        style={{
          height: Math.max(3, size * 0.1),
          background: hue,
          boxShadow: `0 0 ${size * 0.3}px ${hue}`,
        }}
      />
      <span
        className="relative mt-[6%] font-mono font-semibold leading-none text-foreground"
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


