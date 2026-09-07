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
 * A ticker plate, not a glossy crypto coin.
 * Near-black silhouette + a single rim light in the company's hue, the way a
 * subject reads against a dark set. Corner ticks make it a captured frame.
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
  const hue = token?.color ?? "#c9a227";
  const glyph = token?.glyph || symbol.slice(0, 2);
  const corner = Math.max(3, size * 0.16);

  return (
    <span
      className={cn("relative inline-grid place-items-center", float && "animate-float", className)}
      style={{
        width: size,
        height: size,
        // @ts-expect-error custom property
        "--spin": `${spin}deg`,
        animationDelay: `${delay}s`,
      }}
      aria-label={symbol}
    >
      {/* plate */}
      <span
        className="absolute inset-0 rounded-[6%]"
        style={{
          background:
            "linear-gradient(160deg, oklch(0.22 0.014 250), oklch(0.13 0.01 250))",
          boxShadow: `inset 0 0 0 1px ${hue}55, 0 ${size * 0.1}px ${size * 0.3}px -${size * 0.12}px rgba(0,0,0,.9)`,
        }}
      />
      {/* rim light along the top-left edge */}
      <span
        className="absolute inset-0 rounded-[6%]"
        style={{
          background: `linear-gradient(150deg, ${hue}33 0%, transparent 42%)`,
        }}
      />
      {/* focus corners */}
      {[
        { top: 0, left: 0, borderTop: 1, borderLeft: 1 },
        { top: 0, right: 0, borderTop: 1, borderRight: 1 },
        { bottom: 0, left: 0, borderBottom: 1, borderLeft: 1 },
        { bottom: 0, right: 0, borderBottom: 1, borderRight: 1 },
      ].map((pos, i) => (
        <span
          key={i}
          className="absolute"
          style={{
            width: corner,
            height: corner,
            borderStyle: "solid",
            borderColor: `${hue}aa`,
            borderWidth: 0,
            ...pos,
            borderTopWidth: (pos as any).borderTop ? 1 : 0,
            borderBottomWidth: (pos as any).borderBottom ? 1 : 0,
            borderLeftWidth: (pos as any).borderLeft ? 1 : 0,
            borderRightWidth: (pos as any).borderRight ? 1 : 0,
          }}
        />
      ))}
      <span
        className="relative font-mono font-semibold leading-none"
        style={{
          fontSize: size * (glyph.length > 1 ? 0.3 : 0.4),
          letterSpacing: "0.04em",
          color: hue,
          textShadow: `0 0 ${size * 0.28}px ${hue}66`,
        }}
      >
        {glyph}
      </span>
    </span>
  );
}
