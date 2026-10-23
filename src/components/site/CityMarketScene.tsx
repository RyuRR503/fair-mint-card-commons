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
    const journey = page.querySelector<HTMLElement>(".city-handoff");
    const steps = Array.from(page.querySelectorAll<HTMLElement>(".city-handoff .agent-steps li"));
    const copy = page.querySelector<HTMLElement>(".hero-copy");
    let scrollFrame = 0;
    let progress = 0;
    const updateScroll = () => {
      scrollFrame = 0;
      const box = page.getBoundingClientRect();
      const distance = Math.max(hero.offsetHeight, (arrival?.offsetTop ?? hero.offsetHeight * 2) - window.innerHeight * 0.35);
      progress = Math.min(1, Math.max(0, (64 - box.top) / distance));
      page.style.setProperty("--city-scroll-fade", String(Math.min(1, progress * 1.15)));
      page.style.setProperty("--journey-progress", String(progress));
      const paused = page.dataset.motionPaused === "true";
      const staticMotion = reduced.matches || paused;
      page.style.setProperty("--hero-scroll-offset", staticMotion ? "0px" : `${-Math.min(1, progress * 2) * 36}px`);
      if (journey) {
        const journeyBox = journey.getBoundingClientRect();
        const travel = Math.max(1, journey.offsetHeight - window.innerHeight * 0.7);
        const stage = Math.min(1, Math.max(0, (150 - journeyBox.top) / travel));
        journey.style.setProperty("--agent-scroll-progress", String(staticMotion ? 1 : stage));
        steps.forEach((step, index) => step.toggleAttribute("data-step-active", staticMotion || index === Math.min(2, Math.floor(stage * 3))));
      }
      for (const shot of shots) {
        const entry = Math.min(1, Math.max(0, (window.innerHeight - shot.getBoundingClientRect().top) / (window.innerHeight * 0.72)));
        shot.style.transform = staticMotion ? "none" : `translate3d(0, ${(1 - entry) * 48}px, 0)`;
        // Reading is never gated by the scene, including when WebGL is unavailable.
        shot.style.opacity = String(staticMotion ? 1 : 0.65 + entry * 0.35);
      }
    };
    const queueScroll = () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll); };
    window.addEventListener("scroll", queueScroll, { passive: true });
    window.addEventListener("resize", queueScroll);
    reduced.addEventListener("change", queueScroll);
    const playback = new MutationObserver(queueScroll);
    playback.observe(page, { attributes: true, attributeFilter: ["data-motion-paused"] });
    const resize = new ResizeObserver(queueScroll);
    resize.observe(page);
    updateScroll();

    return () => {
      cancelAnimationFrame(scrollFrame);
      playback.disconnect();
      resize.disconnect();
      window.removeEventListener("scroll", queueScroll);
      window.removeEventListener("resize", queueScroll);
      reduced.removeEventListener("change", queueScroll);
      page.style.removeProperty("--city-scroll-fade");
      page.style.removeProperty("--journey-progress");
      page.style.removeProperty("--hero-scroll-offset");
      journey?.style.removeProperty("--agent-scroll-progress");
      steps.forEach((step) => step.removeAttribute("data-step-active"));
      shots.forEach((shot) => { shot.style.removeProperty("transform"); shot.style.removeProperty("opacity"); });
    };
  }, []);

  return <div ref={host} className="city-scroll-controller" aria-hidden="true" />;
}
