import { useEffect, useRef } from "react";
import * as THREE from "three";

/** Low-poly particle wave field. DPR capped at 1.5, paused off-screen,
 *  fully disposed on unmount. Mounted only on high-tier devices. */
export default function HeroScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100,
    );
    camera.position.set(0, 2.4, 6);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const COUNT = 48;
    const positions = new Float32Array(COUNT * COUNT * 3);
    let i = 0;
    for (let x = 0; x < COUNT; x++) {
      for (let z = 0; z < COUNT; z++) {
        positions[i++] = (x / (COUNT - 1) - 0.5) * 11;
        positions[i++] = 0;
        positions[i++] = (z / (COUNT - 1) - 0.5) * 11;
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xc2410c,
      size: 0.03,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    });
    const points = new THREE.Points(geo, mat);
    scene.add(points);

    const mouse = { x: 0, y: 0 };
    const onMouse = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouse);

    let frame = 0;
    let running = false;
    const clock = new THREE.Clock();

    const tick = () => {
      frame = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();
      const pos = geo.attributes.position as THREE.BufferAttribute;
      for (let p = 0; p < pos.count; p++) {
        const x = pos.getX(p);
        const z = pos.getZ(p);
        pos.setY(
          p,
          Math.sin(x * 0.9 + t * 0.8) * 0.22 +
            Math.cos(z * 1.1 + t * 0.6) * 0.22,
        );
      }
      pos.needsUpdate = true;
      points.rotation.y += (mouse.x * 0.1 - points.rotation.y) * 0.05;
      points.rotation.x += (mouse.y * 0.06 - points.rotation.x) * 0.05;
      renderer.render(scene, camera);
    };

    const start = () => {
      if (running) return;
      running = true;
      tick();
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };

    const io = new IntersectionObserver(([entry]) =>
      entry.isIntersecting ? start() : stop(),
    );
    io.observe(mount);

    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      stop();
      io.disconnect();
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", onResize);
      geo.dispose();
      mat.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 z-0 opacity-70 pointer-events-none"
      aria-hidden="true"
    />
  );
}
