import cloud from "@/assets/cloud.png";

const CLOUDS = [
  { top: "6%", left: "-4%", w: 420, o: 0.9, d: 0 },
  { top: "18%", left: "62%", w: 340, o: 0.75, d: 1.4 },
  { top: "44%", left: "12%", w: 300, o: 0.55, d: 2.2 },
  { top: "70%", left: "72%", w: 460, o: 0.7, d: 0.8 },
  { top: "88%", left: "26%", w: 380, o: 0.5, d: 3 },
];

/** Fixed sky gradient plus drifting clouds behind every page. */
export function SkyBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden sky-bg">
      {CLOUDS.map((c, i) => (
        <img
          key={i}
          src={cloud}
          alt=""
          loading="lazy"
          width={1024}
          height={640}
          className="absolute animate-float select-none"
          style={{
            top: c.top,
            left: c.left,
            width: c.w,
            opacity: c.o,
            animationDelay: `${c.d}s`,
            animationDuration: `${9 + i}s`,
          }}
        />
      ))}
    </div>
  );
}
