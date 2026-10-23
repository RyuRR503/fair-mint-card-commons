import { useEffect, useRef } from "react";

/** Visual scene only: no location checks, prices, vouchers or claim state. */
export function CityMarketScene() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = host.current;
    const hero = element?.closest<HTMLElement>(".agent-hero");
    if (!element || !hero) return;
    let disposed = false;
    let cleanup = () => {};

    void import("three").then((THREE) => {
      if (disposed) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
      const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
      const photoLayers = Array.from(hero.querySelectorAll<HTMLElement>("[data-city-depth]"));
      const depthStrength = { far: 10, mid: 28, near: 52 };
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
      const mouse = { x: 0, y: 0 };
      const pointer = { x: 0, y: 0 };
      const move = (event: PointerEvent) => {
        if (reduced.matches || !finePointer.matches || event.pointerType === "touch") return;
        const box = hero.getBoundingClientRect();
        mouse.x = Math.max(-1, Math.min(1, ((event.clientX - box.left) / box.width - 0.5) * 2));
        mouse.y = Math.max(-1, Math.min(1, ((event.clientY - box.top) / box.height - 0.5) * 2));
      };
      const leave = () => { mouse.x = 0; mouse.y = 0; };
      hero.addEventListener("pointermove", move);
      hero.addEventListener("pointerleave", leave);
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
      visibility.observe(hero);
      let frame = 0;
      let previous = performance.now();
      const render = () => {
        if (disposed) return;
        frame = requestAnimationFrame(render);
        const now = performance.now();
        const dt = Math.min((now - previous) / 1000, 0.05);
        previous = now;
        if (!visible || document.hidden) return;
        const ease = 1 - Math.exp(-5 * dt);
        pointer.x += ((reduced.matches || !finePointer.matches ? 0 : mouse.x) - pointer.x) * ease;
        pointer.y += ((reduced.matches || !finePointer.matches ? 0 : mouse.y) - pointer.y) * ease;
        for (const layer of photoLayers) {
          const key = layer.dataset['cityDepth'];
          const strength = key === "near" ? depthStrength.near : key === "mid" ? depthStrength.mid : depthStrength.far;
          layer.style.transform = reduced.matches ? "none" : `translate3d(${-pointer.x * strength}px, ${-pointer.y * strength * 0.55}px, 0)`;
        }
        const time = reduced.matches ? 4 : (performance.now() - start) / 1000;
        const progress = Math.min(1, Math.max(0, -hero.getBoundingClientRect().top / hero.offsetHeight));
        world.rotation.y += ((reduced.matches ? 0 : pointer.x * 0.22 + progress * 0.32) - world.rotation.y) * ease;
        world.rotation.x += ((reduced.matches ? -0.04 : -0.04 + pointer.y * 0.1) - world.rotation.x) * ease;
        distance.position.x = -pointer.x * 0.15;
        market.position.x = -pointer.x * 0.45;
        foreground.position.x = -pointer.x * 0.9;
        market.position.y = pointer.y * 0.15;
        foreground.position.y = pointer.y * 0.35;
        world.position.y = reduced.matches ? 0 : Math.sin(time * 0.5) * 0.1 + progress * 0.8;
        const phase = reduced.matches ? 1 : Math.min(1, (time % 10) / 3);
        chart.geometry.setDrawRange(0, Math.max(2, Math.ceil(phase * route.length)));
        const part = phase * (route.length - 1);
        const index = Math.min(route.length - 2, Math.floor(part));
        const a = route[index], b = route[index + 1];
        if (a && b) node.position.set(a[0] + (b[0] - a[0]) * (part - index), a[1] + (b[1] - a[1]) * (part - index), 0);
        target.scale.setScalar(reduced.matches ? 1 : 1 + Math.sin(time * 1.7) * 0.025);
        corners.position.z = reduced.matches ? 0 : Math.sin(time * 0.6) * 0.12;
        renderer.render(scene, camera);
      };
      render();
      cleanup = () => {
        cancelAnimationFrame(frame);
        observer.disconnect(); visibility.disconnect();
        hero.removeEventListener("pointermove", move); hero.removeEventListener("pointerleave", leave);
        photoLayers.forEach((layer) => layer.style.removeProperty("transform"));
        scene.traverse((object) => { if (object instanceof THREE.Line || object instanceof THREE.Mesh) object.geometry.dispose(); });
        materials.forEach((material) => material.dispose());
        renderer.dispose(); renderer.domElement.remove();
      };
    }).catch(() => { /* The original city photograph remains the fallback. */ });
    return () => { disposed = true; cleanup(); };
  }, []);

  return <div ref={host} className="city-market-scene" aria-hidden="true" />;
}