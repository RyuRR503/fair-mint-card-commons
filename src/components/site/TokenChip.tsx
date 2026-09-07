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
 * Glossy 3D "app icon" chip standing in for a listed company.
 * Drawn with tokens so it themes cleanly and never ships a bitmap.
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
  const color = token?.color ?? "#9aa6b2";
  const color2 = token?.color2 ?? "#6b7885";
  const glyph = token?.glyph || symbol.slice(0, 2);
  const light = (token?.ink ?? "light") === "light";

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
      <span
        className="absolute inset-0 rounded-[28%]"
        style={{
          background: `linear-gradient(150deg, ${color} 0%, ${color2} 100%)`,
          boxShadow: `0 ${size * 0.18}px ${size * 0.32}px -${size * 0.12}px rgba(20,40,70,.45), inset 0 ${size * 0.05}px ${size * 0.08}px rgba(255,255,255,.55), inset 0 -${size * 0.08}px ${size * 0.12}px rgba(0,0,0,.3)`,
        }}
      />
      <span
        className="absolute rounded-full"
        style={{
          top: size * 0.08,
          left: size * 0.12,
          width: size * 0.55,
          height: size * 0.28,
          background:
            "linear-gradient(180deg, rgba(255,255,255,.75), rgba(255,255,255,0))",
          filter: "blur(1px)",
        }}
      />
      <span
        className="relative font-display font-extrabold leading-none"
        style={{
          fontSize: size * (glyph.length > 1 ? 0.36 : 0.46),
          color: light ? "#fff" : "#1b1b1b",
          textShadow: light ? "0 1px 2px rgba(0,0,0,.35)" : "0 1px 1px rgba(255,255,255,.5)",
        }}
      >
        {glyph}
      </span>
    </span>
  );
}
