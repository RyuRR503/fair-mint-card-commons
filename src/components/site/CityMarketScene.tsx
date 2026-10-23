import { useEffect, useRef } from "react";

/** Visual scene only: no location checks, prices, vouchers or claim state. */
export function CityMarketScene() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = host.current;
    const page = element?.closest<HTMLElement>(".home-continuum");
    const hero = page?.querySelector<HTMLElement>(".agent-hero");
    if (!element || !hero || !page) return;
    let disposed = false;
    let cleanup = () => {};

    void import("three").then((THREE) => {
      if (disposed) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
      const shots = Array.from(page.querySelectorAll<HTMLElement>("[data-scroll-shot]"));
      const arrival = page.querySelector<HTMLElement>(".city-map-arrival");
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 80);
      camera.position.set(0, 3.2, 17);
      camera.lookAt(0, 0, 0);
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setClearAlpha(0);
      element.appendChild(renderer.domElement);
      const css = getComputedStyle(document.documentElement);
      const probe = document.createElement("span");
      probe.style.color = css.getPropertyValue("--brand-gold");
      document.body.appendChild(probe);
      const channels = getComputedStyle(probe).color;
      // Canvas converts the computed theme color through a 2D pixel probe.
      const swatch = document.createElement("canvas");
      swatch.width = swatch.height = 1;
      const ctx = swatch.getContext("2d");
      if (!ctx) { probe.remove(); renderer.dispose(); renderer.domElement.remove(); return; }
      ctx.fillStyle = channels;
      ctx.fillRect(0, 0, 1, 1);
      const pixel = ctx.getImageData(0, 0, 1, 1).data;
      const gold = new THREE.Color().setRGB((pixel[0] ?? 0) / 255, (pixel[1] ?? 0) / 255, (pixel[2] ?? 0) / 255, THREE.SRGBColorSpace);
      probe.remove();
      const world = new THREE.Group();
      scene.add(world);
      const distance = new THREE.Group();
      distance.position.z = -7;
      const market = new THREE.Group();
      const foreground = new THREE.Group();
      foreground.position.z = 3;
      world.add(distance, market, foreground);
      const materials: InstanceType<typeof THREE.Material>[] = [];
      const line = (points: [number, number, number][], opacity = 0.45) => {
        const material = new THREE.LineBasicMaterial({ color: gold, transparent: true, opacity });
        materials.push(material);
        const geometry = new THREE.BufferGeometry().setFromPoints(points.map(([x, y, z]) => new THREE.Vector3(x, y, z)));
        const shape = new THREE.Line(geometry, material);
        market.add(shape);
        return shape;
      };
      // A perspective coordinate field, not a map or invented real-world data.
      for (let i = -6; i <= 6; i++) {
        distance.add(line([[i * 1.2, -2.8, -6], [i * 1.2, -2.8, 4]], 0.14));
        distance.add(line([[-7.2, -2.8, i], [7.2, -2.8, i]], 0.14));
      }
      const route: [number, number, number][] = [[-4, -1.7, 0], [-2.8, -1.7, 0], [-2.1, -0.7, 0], [-1, -1, 0], [0, 0.7, 0], [1.1, 0.4, 0], [2.5, 2.2, 0]];
      const chart = line(route, 0.8);
      const tracedPositions = new Float32Array((route.length + 1) * 3);
      chart.geometry.dispose();
      chart.geometry = new THREE.BufferGeometry();
      chart.geometry.setAttribute("position", new THREE.BufferAttribute(tracedPositions, 3));
      chart.frustumCulled = false;
      chart.geometry.setDrawRange(0, 2);
      const corners = new THREE.Group();
      foreground.add(corners);
      const cornerPositions: [number, number][] = [[-4.7, -2.3], [3.2, -2.3], [-4.7, 2.9], [3.2, 2.9]];
      for (const [x, y] of cornerPositions) {
        const dx = x < 0 ? 1 : -1;
        const dy = y < 0 ? 1 : -1;
        const bracket = line([[x, y + dy * 0.65, 0], [x, y, 0], [x + dx * 0.65, y, 0]], 0.65);
        corners.add(bracket);
      }
      const nodeMaterial = new THREE.MeshBasicMaterial({ color: gold });
      materials.push(nodeMaterial);
      const node = new THREE.Mesh(new THREE.SphereGeometry(0.085, 16, 16), nodeMaterial);
      market.add(node);
      const target = line([[2, 1.7, 0], [3, 1.7, 0], [3, 2.7, 0], [2, 2.7, 0], [2, 1.7, 0]], 0.55);
      const resize = () => {
        const box = element.getBoundingClientRect();
        renderer.setSize(box.width, box.height);
        camera.aspect = box.width / Math.max(box.height, 1);
        camera.updateProjectionMatrix();
      };
      const observer = new ResizeObserver(resize);
      observer.observe(element);
      resize();
      const start = performance.now();
      let visible = true;
      const visibility = new IntersectionObserver(([entry]) => { visible = entry?.isIntersecting ?? false; });
      const stage = element.closest<HTMLElement>(".city-scroll-stage");
      visibility.observe(stage ?? hero);
      let frame = 0;
      let previous = performance.now();
      let scroll = 0;
      const render = () => {
        if (disposed) return;
        frame = requestAnimationFrame(render);
        const now = performance.now();
        const dt = Math.min((now - previous) / 1000, 0.05);
        previous = now;
        if (!visible || document.hidden) return;
        const ease = 1 - Math.exp(-5 * dt);
        const pageBox = page.getBoundingClientRect();
        const arrivalTop = arrival ? arrival.offsetTop : hero.offsetHeight * 2;
        const travel = Math.max(hero.offsetHeight, arrivalTop - window.innerHeight * 0.28);
        const scrollTarget = Math.min(1, Math.max(0, (64 - pageBox.top) / travel));
        scroll += (scrollTarget - scroll) * ease;
        const progress = reduced.matches ? 0 : scroll;
        page.style.setProperty("--city-scroll-fade", String(reduced.matches ? 0 : Math.min(1, Math.max(0, (progress - 0.1) / 0.85))));
        for (const shot of shots) {
          const top = shot.getBoundingClientRect().top;
          const entry = Math.min(1, Math.max(0, (window.innerHeight - top) / (window.innerHeight * 0.65)));
          shot.style.transform = reduced.matches ? "none" : `translate3d(0, ${(1 - entry) * 36}px, 0)`;
          shot.style.opacity = String(reduced.matches ? 1 : 0.55 + entry * 0.45);
        }
        const time = reduced.matches ? 4 : (performance.now() - start) / 1000;
        camera.position.z = 17 - progress * 3.8;
        camera.position.y = 3.2 - progress * 1.2;
        camera.lookAt(0, progress * 0.45, 0);
        world.rotation.y += ((reduced.matches ? 0 : progress * 0.32) - world.rotation.y) * ease;
        world.rotation.x = -0.04;
        world.position.y = progress * 0.8;
        // Trace continuously, hold the final target, then gently release for the next pass.
        const cycle = time % 9;
        const phase = reduced.matches ? 1 : Math.min(1, cycle / 4.5);
        const part = phase * (route.length - 1);
        const index = Math.min(route.length - 2, Math.floor(part));
        const a = route[index], b = route[index + 1];
        if (a && b) node.position.set(a[0] + (b[0] - a[0]) * (part - index), a[1] + (b[1] - a[1]) * (part - index), 0);
        for (let i = 0; i <= index; i++) {
          const point = route[i];
          if (point) tracedPositions.set(point, i * 3);
        }
        tracedPositions.set([node.position.x, node.position.y, 0], (index + 1) * 3);
        chart.geometry.getAttribute("position").needsUpdate = true;
        chart.geometry.setDrawRange(0, index + 2);
        const lock = reduced.matches ? 1 : Math.min(1, Math.max(0, (cycle - 4.5) / 0.65));
        const release = reduced.matches ? 1 : 1 - Math.min(1, Math.max(0, (cycle - 8) / 1));
        chart.material.opacity = 0.8 * release;
        nodeMaterial.opacity = release;
        nodeMaterial.transparent = true;
        target.material.opacity = (0.18 + lock * 0.62) * release;
        target.scale.setScalar(1.14 - lock * 0.14);
        corners.scale.setScalar(1.06 - lock * 0.06);
        renderer.render(scene, camera);
      };
      render();
      cleanup = () => {
        cancelAnimationFrame(frame);
        observer.disconnect(); visibility.disconnect();
        shots.forEach((shot) => { shot.style.removeProperty("transform"); shot.style.removeProperty("opacity"); });
        page.style.removeProperty("--city-scroll-fade");
        scene.traverse((object) => { if (object instanceof THREE.Line || object instanceof THREE.Mesh) object.geometry.dispose(); });
        materials.forEach((material) => material.dispose());
        renderer.dispose(); renderer.domElement.remove();
      };
    }).catch(() => { /* The original city photograph remains the fallback. */ });
    return () => { disposed = true; cleanup(); };
  }, []);

  return <div ref={host} className="city-market-scene" aria-hidden="true" />;
}