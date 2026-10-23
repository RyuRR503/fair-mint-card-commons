import { useEffect, useRef } from "react";
import { useLocation } from "@tanstack/react-router";

/** Decorative reading progress and chapter emphasis; never intercepts scrolling. */
export function SiteMotion() {
  const pathname = useLocation({ select: (location) => location.pathname });
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const progress = progressRef.current;
    const main = document.querySelector("main");
    const header = document.querySelector(".site-header");
    if (!progress || !main || !header) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const visible = new Set<HTMLElement>();
    const sections = Array.from(main.querySelectorAll<HTMLElement>(".motion-section"));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const section = entry.target as HTMLElement;
        if (entry.isIntersecting) visible.add(section);
        else visible.delete(section);
      });
      queue();
    }, { rootMargin: "80px" });
    let frame = 0;
    function update() {
      frame = 0;
      const range = document.documentElement.scrollHeight - window.innerHeight;
      progress?.style.setProperty("--reading-progress", String(range > 0 ? window.scrollY / range : 0));
      header?.toggleAttribute("data-scrolled", window.scrollY > 24);
      visible.forEach((section) => {
        const box = section.getBoundingClientRect();
        const amount = Math.min(1, Math.max(0, (window.innerHeight * 0.88 - box.top) / (window.innerHeight * 0.65)));
        section.style.setProperty("--chapter-progress", String(reduced.matches ? 1 : amount));
      });
    }
    function queue() { if (!frame) frame = requestAnimationFrame(update); }
    sections.forEach((section) => observer.observe(section));
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    reduced.addEventListener("change", queue);
    const resize = new ResizeObserver(queue);
    resize.observe(main);
    update();
    return () => {
      observer.disconnect();
      resize.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
      reduced.removeEventListener("change", queue);
      header.removeAttribute("data-scrolled");
      sections.forEach((section) => section.style.removeProperty("--chapter-progress"));
    };
  }, [pathname]);

  return <div ref={progressRef} className="site-reading-progress" aria-hidden="true" />;
}