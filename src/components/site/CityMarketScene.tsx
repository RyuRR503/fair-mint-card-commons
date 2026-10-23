import { useEffect, useRef } from "react";

/** One decorative signal: measured city origin → the actual three step icons. */
export function CityMarketScene() {
  const host = useRef<HTMLDivElement>(null);
  const paths = useRef<Array<SVGPathElement | null>>([]);
  const dot = useRef<SVGCircleElement>(null);

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
    const stops = [0, 0.44, 0.7, 0.94];
    let scrollFrame = 0;
    let progress = 0;
    let signalStage = 0;
    const updateScroll = () => {
      scrollFrame = 0;
      const box = page.getBoundingClientRect();
      const distance = Math.max(hero.offsetHeight, (arrival?.offsetTop ?? hero.offsetHeight * 2) - window.innerHeight * 0.35);
      progress = Math.min(1, Math.max(0, (64 - box.top) / distance));
      page.style.setProperty("--city-scroll-fade", String(Math.min(1, progress * 1.15)));
      page.style.setProperty("--journey-progress", String(progress));
      const paused = page.dataset["motionPaused"] === "true";
      const staticMotion = reduced.matches || paused;
      element.hidden = reduced.matches || window.innerWidth < 1024;
      page.style.setProperty("--hero-scroll-offset", staticMotion ? "0px" : `${-Math.min(1, progress * 2) * 36}px`);
      if (journey) {
        const journeyBox = journey.getBoundingClientRect();
        const travel = Math.max(1, journey.offsetHeight - window.innerHeight * 0.7);
        // Pause freezes this timeline, rather than jumping to its end.
        if (!paused) signalStage = Math.min(1, Math.max(0, (window.innerHeight * 0.78 - journeyBox.top) / (window.innerHeight * 0.78 - 120 + travel)));
        journey.style.setProperty("--agent-scroll-progress", String(reduced.matches ? 1 : signalStage));
        steps.forEach((step, index) => {
          const stop = stops[index + 1] ?? 1;
          const light = reduced.matches ? 1 : Math.min(1, Math.max(0, (signalStage - stop + 0.035) / 0.035));
          step.style.setProperty("--step-light", String(light));
          step.toggleAttribute("data-step-active", reduced.matches || signalStage >= stop);
          step.toggleAttribute("data-step-current", !reduced.matches && signalStage >= stop && signalStage < (stops[index + 2] ?? 1.01));
        });
        const source = page.querySelector<HTMLElement>(".signal-apple")?.getBoundingClientRect();
        const targets = steps.map((step) => step.querySelector("svg")?.getBoundingClientRect());
        if (source && targets.length === 3 && targets.every(Boolean)) {
          const points = [{ x: source.left - box.left, y: source.top - box.top }, ...targets.flatMap((target) => target ? [{ x: target.left + target.width / 2 - box.left, y: target.top + target.height / 2 - box.top }] : [])];
          let position = points[0];
          paths.current.forEach((path, index) => {
            const from = points[index];
            const to = points[index + 1];
            if (!path || !from || !to) return;
            path.setAttribute("d", index === 0 ? `M${from.x},${from.y} C${from.x},${from.y + 160} ${to.x},${to.y - 140} ${to.x},${to.y}` : `M${from.x},${from.y} L${to.x},${to.y}`);
            const start = stops[index] ?? 0;
            const end = stops[index + 1] ?? 1;
            const local = Math.min(1, Math.max(0, (signalStage - start) / (end - start)));
            const eased = local * local * (3 - 2 * local);
            const length = path.getTotalLength();
            path.style.strokeDasharray = String(length);
            path.style.strokeDashoffset = String(length * (1 - eased));
            if (signalStage >= start) position = path.getPointAtLength(length * eased);
          });
          if (position && dot.current) {
            dot.current.setAttribute("cx", String(position.x));
            dot.current.setAttribute("cy", String(position.y));
          }
          element.style.setProperty("--signal-opacity", String(Math.min(1, signalStage * 16) * (1 - Math.max(0, (signalStage - 0.97) / 0.03))));
        }
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
    if (journey) resize.observe(journey);
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
      steps.forEach((step) => { step.removeAttribute("data-step-active"); step.removeAttribute("data-step-current"); step.style.removeProperty("--step-light"); });
      shots.forEach((shot) => { shot.style.removeProperty("transform"); shot.style.removeProperty("opacity"); });
    };
  }, []);

  return <div ref={host} className="city-scroll-controller" aria-hidden="true"><svg className="agent-signal-route"><g>{[0, 1, 2].map((index) => <path key={index} ref={(node) => { paths.current[index] = node; }} />)}</g><circle ref={dot} className="agent-signal-dot" r="5" /></svg></div>;
}
