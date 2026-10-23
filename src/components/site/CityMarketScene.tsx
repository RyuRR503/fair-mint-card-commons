import { useEffect, useRef } from "react";

/** Scroll handoff only; the location-stock animation lives in CitySignals. */
export function CityMarketScene() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = host.current;
    const page = element?.closest<HTMLElement>(".home-continuum");
    if (!element || !page) return;
    const hero = page.querySelector<HTMLElement>(".agent-hero");
    const arrival = page.querySelector<HTMLElement>(".city-map-arrival");
    if (!hero) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const shots = Array.from(page.querySelectorAll<HTMLElement>("[data-scroll-shot]"));
    let scrollFrame = 0;
    let progress = 0;
    const updateScroll = () => {
      scrollFrame = 0;
      const box = page.getBoundingClientRect();
      const distance = Math.max(hero.offsetHeight, (arrival?.offsetTop ?? hero.offsetHeight * 2) - window.innerHeight * 0.35);
      progress = Math.min(1, Math.max(0, (64 - box.top) / distance));
      page.style.setProperty("--city-scroll-fade", String(Math.min(1, progress * 1.15)));
      page.style.setProperty("--journey-progress", String(progress));
      for (const shot of shots) {
        const entry = Math.min(1, Math.max(0, (window.innerHeight - shot.getBoundingClientRect().top) / (window.innerHeight * 0.72)));
        shot.style.transform = reduced.matches ? "none" : `translate3d(0, ${(1 - entry) * 22}px, 0)`;
        // Reading is never gated by the scene, including when WebGL is unavailable.
        shot.style.opacity = String(reduced.matches ? 1 : 0.75 + entry * 0.25);
      }
    };
    const queueScroll = () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll); };
    window.addEventListener("scroll", queueScroll, { passive: true });
    window.addEventListener("resize", queueScroll);
    reduced.addEventListener("change", queueScroll);
    updateScroll();

    return () => {
      cancelAnimationFrame(scrollFrame);
      window.removeEventListener("scroll", queueScroll);
      window.removeEventListener("resize", queueScroll);
      reduced.removeEventListener("change", queueScroll);
      page.style.removeProperty("--city-scroll-fade");
      page.style.removeProperty("--journey-progress");
      shots.forEach((shot) => { shot.style.removeProperty("transform"); shot.style.removeProperty("opacity"); });
    };
  }, []);

  return <div ref={host} className="city-scroll-controller" aria-hidden="true" />;
}
