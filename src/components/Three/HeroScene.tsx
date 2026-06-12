import { useEffect, useRef } from "react";
import * as THREE from "three";

/** Minimal abstract particle network.
 *  Sparse dark dots float on the light hero bg; lines form between
 *  close pairs; cursor gently repels nearby dots.
 *  DPR capped 1.5. Paused off-screen. Fully disposed on unmount. */
export default function HeroScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let W = mount.clientWidth;
    let H = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(0, W, H, 0, -1, 1);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // --- dots ---
    const COUNT = 55;
    type Dot = { x: number; y: number; vx: number; vy: number };
    const dots: Dot[] = Array.from({ length: COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
    }));

    const dotPositions = new Float32Array(COUNT * 3);
    const dotGeo = new THREE.BufferGeometry();
    dotGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(dotPositions, 3),
    );
    const dotMat = new THREE.PointsMaterial({
      color: 0x141210,
      size: 3,
      transparent: true,
      opacity: 0.42,
      sizeAttenuation: false,
      depthWrite: false,
    });
    const dotMesh = new THREE.Points(dotGeo, dotMat);
    scene.add(dotMesh);

    // --- lines ---
    const MAX_PAIRS = COUNT * COUNT;
    const linePositions = new Float32Array(MAX_PAIRS * 6);
    const lineGeo = new THREE.BufferGeometry();
    const lineAttr = new THREE.BufferAttribute(linePositions, 3);
    lineAttr.setUsage(THREE.DynamicDrawUsage);
    lineGeo.setAttribute("position", lineAttr);
    lineGeo.setDrawRange(0, 0);
    const lineSegments = new THREE.LineSegments(
      lineGeo,
      new THREE.LineBasicMaterial({
        color: 0x141210,
        transparent: true,
        opacity: 0.1,
        depthWrite: false,
      }),
    );
    scene.add(lineSegments);

    const LINK_DIST = 140;
    const REPEL_DIST = 110;
    const REPEL_STR = 0.75;
    const mouse = { x: -9999, y: -9999 };

    const onMouse = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    window.addEventListener("mousemove", onMouse);

    let frame = 0;
    let running = false;

    const tick = () => {
      frame = requestAnimationFrame(tick);

      // update positions
      const pos = dotGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < COUNT; i++) {
        const d = dots[i];
        const dx = d.x - mouse.x;
        const dy = d.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < REPEL_DIST && dist > 0.1) {
          const force = (REPEL_DIST - dist) / REPEL_DIST;
          d.vx += (dx / dist) * force * REPEL_STR;
          d.vy += (dy / dist) * force * REPEL_STR;
        }
        d.vx *= 0.97;
        d.vy *= 0.97;
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0) { d.x = 0; d.vx *= -1; }
        if (d.x > W) { d.x = W; d.vx *= -1; }
        if (d.y < 0) { d.y = 0; d.vy *= -1; }
        if (d.y > H) { d.y = H; d.vy *= -1; }
        pos.setXYZ(i, d.x, H - d.y, 0);
      }
      pos.needsUpdate = true;

      // build line segments
      const lPos = lineGeo.attributes.position as THREE.BufferAttribute;
      let lineCount = 0;
      for (let i = 0; i < COUNT; i++) {
        for (let j = i + 1; j < COUNT; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          if (Math.hypot(dx, dy) < LINK_DIST) {
            const base = lineCount * 6;
            linePositions[base] = dots[i].x;
            linePositions[base + 1] = H - dots[i].y;
            linePositions[base + 2] = 0;
            linePositions[base + 3] = dots[j].x;
            linePositions[base + 4] = H - dots[j].y;
            linePositions[base + 5] = 0;
            lineCount++;
          }
        }
      }
      lPos.needsUpdate = true;
      lineGeo.setDrawRange(0, lineCount * 2);

      renderer.render(scene, camera);
    };

    const start = () => { if (!running) { running = true; tick(); } };
    const stop = () => { running = false; cancelAnimationFrame(frame); };

    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
    );
    io.observe(mount);

    const onResize = () => {
      W = mount.clientWidth;
      H = mount.clientHeight;
      camera.right = W;
      camera.top = H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    };
    window.addEventListener("resize", onResize);

    return () => {
      stop();
      io.disconnect();
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", onResize);
      dotGeo.dispose();
      dotMat.dispose();
      lineGeo.dispose();
      (lineSegments.material as THREE.LineBasicMaterial).dispose();
      renderer.forceContextLoss();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount)
        mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    />
  );
}
