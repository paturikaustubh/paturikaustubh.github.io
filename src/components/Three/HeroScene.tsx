import { useEffect, useRef } from "react";
import * as THREE from "three";

/** Minimal abstract particle network.
 *  Sparse dark dots float on the light hero bg; lines form between
 *  close pairs; cursor gently repels nearby dots.
 *  Dots spawn with a staggered fade-in. Per-vertex ShaderMaterial
 *  drives alpha + accent color on cursor proximity.
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

    const clock = new THREE.Clock();

    // --- dots ---
    // scales with viewport: 30 on phone, ~55 on tablet, 70 on desktop
    const COUNT = Math.round(Math.min(70, Math.max(30, W * 0.048)));

    type Dot = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      angle: number;
      angleV: number;
      speed: number;
      spawnAt: number;
      alpha: number;
    };

    const dots: Dot[] = Array.from({ length: COUNT }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.18 + Math.random() * 0.22;
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        angle,
        angleV: (Math.random() - 0.5) * 0.018,
        speed,
        spawnAt: Math.random() * 1500,
        alpha: 0,
      };
    });

    // --- dot geometry + shader ---
    const dotPositions = new Float32Array(COUNT * 3);
    const dotAlphaArr = new Float32Array(COUNT);
    const dotColorArr = new Float32Array(COUNT * 3);

    const dotGeo = new THREE.BufferGeometry();
    const dotPosAttr = new THREE.BufferAttribute(dotPositions, 3);
    dotPosAttr.setUsage(THREE.DynamicDrawUsage);
    dotGeo.setAttribute("position", dotPosAttr);

    const dotAlphaAttr = new THREE.BufferAttribute(dotAlphaArr, 1);
    dotAlphaAttr.setUsage(THREE.DynamicDrawUsage);
    dotGeo.setAttribute("aAlpha", dotAlphaAttr);

    const dotColorAttr = new THREE.BufferAttribute(dotColorArr, 3);
    dotColorAttr.setUsage(THREE.DynamicDrawUsage);
    dotGeo.setAttribute("aColor", dotColorAttr);

    const dotMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      vertexShader: /* glsl */ `
        attribute float aAlpha;
        attribute vec3 aColor;
        varying float vAlpha;
        varying vec3 vColor;
        void main() {
          vAlpha = aAlpha;
          vColor = aColor;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = 4.0;
        }
      `,
      fragmentShader: /* glsl */ `
        precision mediump float;
        varying float vAlpha;
        varying vec3 vColor;
        void main() {
          vec2 c = gl_PointCoord - 0.5;
          if (dot(c, c) > 0.25) discard;
          gl_FragColor = vec4(vColor, vAlpha);
        }
      `,
    });

    const dotMesh = new THREE.Points(dotGeo, dotMat);
    scene.add(dotMesh);

    // --- normal line geometry ---
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

    // --- hot (accent) line geometry + shader ---
    const hotPositions = new Float32Array(MAX_PAIRS * 6);
    const hotAlphaArr = new Float32Array(MAX_PAIRS * 2);

    const hotGeo = new THREE.BufferGeometry();
    const hotPosAttr = new THREE.BufferAttribute(hotPositions, 3);
    hotPosAttr.setUsage(THREE.DynamicDrawUsage);
    hotGeo.setAttribute("position", hotPosAttr);

    const hotAlphaAttr = new THREE.BufferAttribute(hotAlphaArr, 1);
    hotAlphaAttr.setUsage(THREE.DynamicDrawUsage);
    hotGeo.setAttribute("aHotAlpha", hotAlphaAttr);

    hotGeo.setDrawRange(0, 0);

    const hotMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      vertexShader: /* glsl */ `
        attribute float aHotAlpha;
        varying float vA;
        void main() {
          vA = aHotAlpha;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        precision mediump float;
        varying float vA;
        void main() {
          gl_FragColor = vec4(0.757, 0.255, 0.047, vA);
        }
      `,
    });

    const hotSegments = new THREE.LineSegments(hotGeo, hotMat);
    scene.add(hotSegments);

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

      const now = clock.getElapsedTime() * 1000; // ms

      // update positions + spawn alpha + color
      const pos = dotGeo.attributes.position as THREE.BufferAttribute;
      const influences = new Float32Array(COUNT);

      for (let i = 0; i < COUNT; i++) {
        const d = dots[i];

        // spawn stagger fade-in
        if (d.alpha < 1 && now >= d.spawnAt) {
          d.alpha = Math.min(1, d.alpha + 0.04);
        }

        // cursor repulsion (unchanged)
        const dx = d.x - mouse.x;
        const dy = d.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < REPEL_DIST && dist > 0.1) {
          const force = (REPEL_DIST - dist) / REPEL_DIST;
          d.vx += (dx / dist) * force * REPEL_STR;
          d.vy += (dy / dist) * force * REPEL_STR;
        }

        // correlated random walk
        d.angle += d.angleV + (Math.random() - 0.5) * 0.006;
        const targetVx = Math.cos(d.angle) * d.speed;
        const targetVy = Math.sin(d.angle) * d.speed;
        d.vx += (targetVx - d.vx) * 0.05;
        d.vy += (targetVy - d.vy) * 0.05;

        d.x += d.vx;
        d.y += d.vy;

        // specular bounce
        if (d.x < 0) {
          d.x = 0;
          d.vx = Math.abs(d.vx);
          d.angle = Math.PI - d.angle;
        }
        if (d.x > W) {
          d.x = W;
          d.vx = -Math.abs(d.vx);
          d.angle = Math.PI - d.angle;
        }
        if (d.y < 0) {
          d.y = 0;
          d.vy = Math.abs(d.vy);
          d.angle = -d.angle;
        }
        if (d.y > H) {
          d.y = H;
          d.vy = -Math.abs(d.vy);
          d.angle = -d.angle;
        }

        pos.setXYZ(i, d.x, H - d.y, 0);

        // cursor influence for color
        const cx = d.x - mouse.x;
        const cy = d.y - mouse.y;
        const cursorDist = Math.hypot(cx, cy);
        const influence = d.alpha * Math.max(0, 1 - cursorDist / REPEL_DIST);
        influences[i] = influence;

        // interpolate ink (#141210) → accent (#c2410c)
        dotColorArr[i * 3] = 0.078 + (0.757 - 0.078) * influence;
        dotColorArr[i * 3 + 1] = 0.071 + (0.255 - 0.071) * influence;
        dotColorArr[i * 3 + 2] = 0.055 + (0.047 - 0.055) * influence;
        dotAlphaArr[i] = d.alpha * (0.35 + influence * 0.65);
      }

      pos.needsUpdate = true;
      dotAlphaAttr.needsUpdate = true;
      dotColorAttr.needsUpdate = true;

      // build line segments (normal + hot)
      const lPos = lineGeo.attributes.position as THREE.BufferAttribute;
      let lineCount = 0;
      let hotCount = 0;

      for (let i = 0; i < COUNT; i++) {
        for (let j = i + 1; j < COUNT; j++) {
          // skip pairs where both dots are invisible
          if (dots[i].alpha < 0.05 || dots[j].alpha < 0.05) continue;

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

            // hot segment: either endpoint has influence > 0.05
            const infI = influences[i];
            const infJ = influences[j];
            if (infI > 0.05 || infJ > 0.05) {
              const hBase = hotCount * 6;
              hotPositions[hBase] = dots[i].x;
              hotPositions[hBase + 1] = H - dots[i].y;
              hotPositions[hBase + 2] = 0;
              hotPositions[hBase + 3] = dots[j].x;
              hotPositions[hBase + 4] = H - dots[j].y;
              hotPositions[hBase + 5] = 0;
              const hotA = Math.min(0.8, (infI + infJ) * 0.5);
              hotAlphaArr[hotCount * 2] = hotA;
              hotAlphaArr[hotCount * 2 + 1] = hotA;
              hotCount++;
            }
          }
        }
      }

      lPos.needsUpdate = true;
      lineGeo.setDrawRange(0, lineCount * 2);

      hotPosAttr.needsUpdate = true;
      hotAlphaAttr.needsUpdate = true;
      hotGeo.setDrawRange(0, hotCount * 2);

      renderer.render(scene, camera);
    };

    const start = () => {
      if (!running) {
        running = true;
        clock.start();
        tick();
      }
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };

    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
    );
    io.observe(mount);

    const onResize = () => {
      const newW = mount.clientWidth;
      const newH = mount.clientHeight;
      dots.forEach((d) => {
        d.x = (d.x / W) * newW;
        d.y = (d.y / H) * newH;
      });
      W = newW;
      H = newH;
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
      hotGeo.dispose();
      hotMat.dispose();
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
