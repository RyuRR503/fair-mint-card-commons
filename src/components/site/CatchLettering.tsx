import lettering from "@/assets/catch-lettering-final.png";
import letter1 from "@/assets/letters/letter-1.png.asset.json";
import letter2 from "@/assets/letters/letter-2.png.asset.json";
import letter3 from "@/assets/letters/letter-3.png.asset.json";
import letter4 from "@/assets/letters/letter-4.png.asset.json";
import letter5 from "@/assets/letters/letter-5.png.asset.json";

/** The approved wordmark sliced at its five letter gaps; widths sum to the master canvas. */
const LETTERS = [
  { url: letter1.url, width: 300 },
  { url: letter2.url, width: 298 },
  { url: letter3.url, width: 305 },
  { url: letter4.url, width: 302 },
  { url: letter5.url, width: 241 },
];
const CANVAS_WIDTH = 1446;
const CANVAS_HEIGHT = 210;

/**
 * One approved lettering asset shared by every website placement.
 * Each letter rises in on its own beat, then a gold sheen sweeps the finished word.
 */
export function CatchLettering({ className = "" }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label="CATCH"
      className={`catch-word relative inline-flex select-none ${className}`}
      style={{ aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}` }}
    >
      {LETTERS.map((letter, i) => (
        <img
          key={letter.url}
          src={letter.url}
          alt=""
          width={letter.width}
          height={CANVAS_HEIGHT}
          draggable={false}
          className="catch-letter"
          style={{ animationDelay: `${140 + i * 95}ms` }}
        />
      ))}
      <span
        aria-hidden="true"
        className="catch-sheen"
        style={{
          maskImage: `url(${lettering})`,
          WebkitMaskImage: `url(${lettering})`,
        }}
      />
    </span>
  );
}
