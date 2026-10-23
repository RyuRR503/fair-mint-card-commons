import { useEffect, useRef } from "react";

/** Decorative capture study. It never reads GPS, prices or claim state. */
export function CityMarketScene({ paused = false }: { paused?: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const pause = useRef(paused);
  useEffect(() => {
    pause.current = paused;
    host.current?.dispatchEvent(new Event("scene-playback"));
  }, [paused]);

  useEffect(() => {
    const element = host.current;
    const page = element?.closest<HTMLElement>(".home-continuum");
    if (!element || !page) return;
    const hero = page.querySelector<HTMLElement>(".agent-hero");
    const arrival = page.querySelector<HTMLElement>(".city-map-arrival");
    if (!hero) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const shots = Array.from(page.querySelectorAll<HTMLElement>("[data-scroll-shot]"));
    let disposed = false;
    let scrollFrame = 0;
    let progress = 0;
    let sceneCleanup = () => {};
    let sceneRefresh = () => {};
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
      sceneRefresh();
    };
    const queueScroll = () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll); };
    window.addEventListener("scroll", queueScroll, { passive: true });
    window.addEventListener("resize", queueScroll);
    reduced.addEventListener("change", queueScroll);
    updateScroll();

    void import("three").then((THREE) => {
      if (disposed) return;
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      renderer.setClearAlpha(0);
      element.prepend(renderer.domElement);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 60);
      camera.position.set(0, 0, 14);
      const probe = document.createElement("span");
      probe.style.color = "var(--brand-gold)";
      element.appendChild(probe);
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      const context = canvas.getContext("2d");
      if (!context) { probe.remove(); renderer.dispose(); renderer.domElement.remove(); return; }
      context.fillStyle = getComputedStyle(probe).color;
      context.fillRect(0, 0, 1, 1);
      const pixel = context.getImageData(0, 0, 1, 1).data;
      const gold = new THREE.Color().setRGB((pixel[0] ?? 0) / 255, (pixel[1] ?? 0) / 255, (pixel[2] ?? 0) / 255, THREE.SRGBColorSpace);
      probe.remove();
      const sculpture = new THREE.Group();
      scene.add(sculpture);
      const materials: InstanceType<typeof THREE.Material>[] = [];
      const makeLine = (points: [number, number, number][], opacity: number, parent = sculpture) => {
        const material = new THREE.LineBasicMaterial({ color: gold, transparent: true, opacity });
        materials.push(material);
        const geometry = new THREE.BufferGeometry().setFromPoints(points.map((point) => new THREE.Vector3(...point)));
        const line = new THREE.Line(geometry, material);
        parent.add(line);
        return line;
      };
      // A pair of open optical frames echoes the approved chart-frame mark.
      const aperture = new THREE.Group();
      sculpture.add(aperture);
      const brackets: ReturnType<typeof makeLine>[] = [];
      const cornerPositions: [number, number][] = [[-2.6, -2.6], [2.6, -2.6], [-2.6, 2.6], [2.6, 2.6]];
      for (const [x, y] of cornerPositions) {
        const dx = x < 0 ? 1 : -1, dy = y < 0 ? 1 : -1;
        brackets.push(makeLine([[x, y + dy * 1.05, 0], [x, y, 0], [x + dx * 1.05, y, 0]], 0.8, aperture));
      }
      const echo = new THREE.Group();
      echo.position.z = -1.1;
      sculpture.add(echo);
      makeLine([[-2.85, 1.65, 0], [-2.85, 2.85, 0], [-1.65, 2.85, 0]], 0.22, echo);
      makeLine([[1.65, -2.85, 0], [2.85, -2.85, 0], [2.85, -1.65, 0]], 0.22, echo);
      const ticks = new THREE.Group();
      sculpture.add(ticks);
      for (let i = 0; i < 17; i++) {
        const x = -2.5 + i * 0.3125;
        makeLine([[x, -3.25, -0.5], [x, -3.25 + (i % 4 === 0 ? 0.18 : 0.08), -0.5]], 0.3, ticks);
      }
      const route: [number, number, number][] = [[-2.0, -1.3, 0.1], [-1.35, -1.3, 0.1], [-0.65, -0.35, 0.1], [0.05, -0.72, 0.1], [0.7, 0.55, 0.1], [1.35, 0.25, 0.1], [2.0, 1.6, 0.1]];
      const guide = makeLine(route, 0.1);
      const trace = makeLine(route, 0.9);
      const positions = new Float32Array((route.length + 1) * 3);
      trace.geometry.dispose();
      trace.geometry = new THREE.BufferGeometry();
      trace.geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      trace.frustumCulled = false;
      const markerMaterial = new THREE.MeshBasicMaterial({ color: gold, transparent: true });
      materials.push(markerMaterial);
      const marker = new THREE.Mesh(new THREE.OctahedronGeometry(0.115), markerMaterial);
      sculpture.add(marker);
      const lockFrame = new THREE.Group();
      lockFrame.position.set(2, 1.6, 0.1);
      sculpture.add(lockFrame);
      const lock = makeLine([[-0.26, -0.26, 0], [-0.26, 0.26, 0], [0.26, 0.26, 0], [0.26, -0.26, 0], [-0.26, -0.26, 0]], 0.6, lockFrame);
      let frame = 0, activeTime = 0, last = 0, visible = true;
      const smooth = (value: number) => { const x = Math.min(1, Math.max(0, value)); return x * x * (3 - 2 * x); };
      const draw = () => {
        const time = reduced.matches ? 5.8 : activeTime;
        const cycle = time % 12;
        const capture = smooth((cycle - 1) / 3.6);
        const settle = smooth((cycle - 4.6) / 0.9);
        const release = 1 - smooth((cycle - 10.5) / 1.5);
        const part = capture * (route.length - 1);
        const index = Math.min(route.length - 2, Math.floor(part));
        const a = route[index], b = route[index + 1];
        if (a && b) marker.position.set(a[0] + (b[0] - a[0]) * (part - index), a[1] + (b[1] - a[1]) * (part - index), 0.1);
        for (let i = 0; i <= index; i++) { const point = route[i]; if (point) positions.set(point, i * 3); }
        positions.set([marker.position.x, marker.position.y, marker.position.z], (index + 1) * 3);
        trace.geometry.getAttribute("position").needsUpdate = true;
        trace.geometry.setDrawRange(0, index + 2);
        trace.material.opacity = 0.9 * release;
        markerMaterial.opacity = release;
        marker.rotation.z = time * 0.25;
        lock.material.opacity = settle * release * 0.85;
        lockFrame.scale.setScalar(1.8 - settle * 0.8);
        aperture.scale.setScalar(1.06 - settle * 0.06);
        brackets.forEach((bracket) => { bracket.material.opacity = (0.42 + settle * 0.38) * (0.7 + release * 0.3); });
        // Only vector geometry moves; the original photograph and lettering stay sharp.
        sculpture.rotation.y = reduced.matches ? -0.18 : -0.18 + Math.sin(time * 0.22) * 0.14 + progress * 0.35;
        sculpture.rotation.x = reduced.matches ? 0.05 : 0.05 + Math.sin(time * 0.15) * 0.06;
        sculpture.rotation.z = -0.08 + progress * 0.12;
        sculpture.position.y = progress * 0.55;
        echo.rotation.z = reduced.matches ? 0.08 : Math.sin(time * 0.18) * 0.07;
        camera.position.z = 14 - progress * 1.2;
        guide.material.opacity = 0.09;
        element.dataset["phase"] = cycle < 4.6 ? "capture" : cycle < 8.5 ? "signal" : "agent";
        renderer.render(scene, camera);
      };
      const animate = (now: number) => {
        frame = 0;
        if (disposed || !visible || document.hidden || pause.current || reduced.matches) return;
        if (last) activeTime += Math.min((now - last) / 1000, 0.05);
        last = now;
        draw();
        frame = requestAnimationFrame(animate);
      };
      const refresh = () => {
        cancelAnimationFrame(frame); frame = 0; last = 0;
        draw();
        if (visible && !document.hidden && !pause.current && !reduced.matches) frame = requestAnimationFrame(animate);
      };
      // Scroll updates render a paused/static scene once, without changing its capture phase.
      sceneRefresh = () => { if (!frame) draw(); };
      const resize = () => {
        const box = element.getBoundingClientRect();
        renderer.setSize(box.width, box.height);
        camera.aspect = box.width / Math.max(1, box.height);
        camera.updateProjectionMatrix();
        refresh();
      };
      const observer = new ResizeObserver(resize);
      observer.observe(element);
      const visibility = new IntersectionObserver(([entry]) => { visible = entry?.isIntersecting ?? false; refresh(); });
      visibility.observe(element);
      document.addEventListener("visibilitychange", refresh);
      element.addEventListener("scene-playback", refresh);
      reduced.addEventListener("change", refresh);
      resize();
      sceneCleanup = () => {
        cancelAnimationFrame(frame);
        observer.disconnect(); visibility.disconnect();
        document.removeEventListener("visibilitychange", refresh);
        element.removeEventListener("scene-playback", refresh);
        reduced.removeEventListener("change", refresh);
        scene.traverse((object) => { if (object instanceof THREE.Line || object instanceof THREE.Mesh) object.geometry.dispose(); });
        materials.forEach((material) => material.dispose());
        renderer.dispose(); renderer.domElement.remove();
      };
    }).catch(() => { /* Photograph and all navigation remain usable without WebGL. */ });
    return () => {
      disposed = true;
      cancelAnimationFrame(scrollFrame);
      window.removeEventListener("scroll", queueScroll);
      window.removeEventListener("resize", queueScroll);
      reduced.removeEventListener("change", queueScroll);
      sceneCleanup();
      page.style.removeProperty("--city-scroll-fade");
      page.style.removeProperty("--journey-progress");
      shots.forEach((shot) => { shot.style.removeProperty("transform"); shot.style.removeProperty("opacity"); });
    };
  }, []);

  return <div ref={host} className="city-market-scene" aria-hidden="true" data-phase="capture">
    <div className="capture-caption"><span className="capture-caption-mark">C /</span><div><span className="capture-phase capture-phase--capture">01 — CAPTURE</span><span className="capture-phase capture-phase--signal">02 — SIGNAL</span><span className="capture-phase capture-phase--agent">03 — HUMAN × AGENT</span></div><span className="capture-caption-rule" /></div>
  </div>;
}
