import { CITY_NIGHT, LETTERING_MASK, LETTER_1, LETTER_2, LETTER_3, LETTER_4, LETTER_5 } from "./inline-assets";

const LETTERS = [
  { url: LETTER_1, width: 300 },
  { url: LETTER_2, width: 298 },
  { url: LETTER_3, width: 305 },
  { url: LETTER_4, width: 302 },
  { url: LETTER_5, width: 241 },
];

/** Original CATCH wordmark (same five slices + gold sheen as catch.fun), fully embedded. */
export function FlapCatchLettering({ className = "" }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label="CATCH"
      className={`catch-word relative inline-flex select-none ${className}`}
      style={{ aspectRatio: "1446 / 210" }}
    >
      {LETTERS.map((l, i) => (
        <img
          key={i}
          src={l.url}
          alt=""
          width={l.width}
          height={210}
          draggable={false}
          className="catch-letter"
          style={{ animationDelay: `${140 + i * 95}ms` }}
        />
      ))}
      <span
        aria-hidden="true"
        className="catch-sheen"
        style={{ maskImage: `url(${LETTERING_MASK})`, WebkitMaskImage: `url(${LETTERING_MASK})` }}
      />
    </span>
  );
}

/** Original Shanghai night photograph as a stationary backdrop, fully embedded. */
export function FlapCityBackdrop({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <img src={CITY_NIGHT} alt="" className="h-full w-full object-cover opacity-70" draggable={false} />
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/30 to-background" />
    </div>
  );
}
