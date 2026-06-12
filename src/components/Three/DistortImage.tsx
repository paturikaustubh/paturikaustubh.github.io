import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { getDeviceTier } from "../../lib/device";

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  varying vec2 vUv;
  uniform sampler2D uTexture;
  uniform float uIntensity;
  uniform vec2 uHover;
  void main() {
    vec2 uv = vUv;
    float dist = distance(uv, uHover);
    uv += (uv - uHover) * uIntensity * 0.12 * smoothstep(0.5, 0.0, dist);
    gl_FragColor = texture2D(uTexture, uv);
  }
`;

/** Image with hover ripple distortion. Falls back to a plain <img> on
 *  low-tier devices or texture load failure. */
export default function DistortImage({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [fallback, setFallback] = useState(getDeviceTier() === "low");

  useEffect(() => {
    if (fallback) return;
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 10);
    camera.position.z = 1;

    const uniforms = {
      uTexture: { value: null as THREE.Texture | null },
      uIntensity: { value: 0 },
      uHover: { value: new THREE.Vector2(0.5, 0.5) },
    };
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms,
    });
    const geo = new THREE.PlaneGeometry(1, 1);
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    new THREE.TextureLoader().load(
      src,
      (tex) => {
        if (disposed) return;
        // No colorSpace override — keeps image colors faithful
        uniforms.uTexture.value = tex;
        const aspect = tex.image.width / tex.image.height;
        mount.style.aspectRatio = `${aspect}`;
        renderer.setSize(mount.clientWidth, mount.clientWidth / aspect);
        mount.appendChild(renderer.domElement);
        renderer.render(scene, camera);
      },
      undefined,
      () => { if (!disposed) setFallback(true); },
    );

    let frame = 0;
    let running = false;
    const tick = () => {
      frame = requestAnimationFrame(tick);
      renderer.render(scene, camera);
    };
    const start = () => {
      if (!running) {
        running = true;
        tick();
      }
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };

    const onMove = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      uniforms.uHover.value.set(
        (e.clientX - rect.left) / rect.width,
        1 - (e.clientY - rect.top) / rect.height,
      );
    };
    const onEnter = () => {
      gsap.killTweensOf(uniforms.uIntensity);
      start();
      gsap.to(uniforms.uIntensity, { value: 1, duration: 0.5 });
    };
    const onLeave = () => {
      gsap.to(uniforms.uIntensity, {
        value: 0,
        duration: 0.5,
        onComplete: stop,
      });
    };
    mount.addEventListener("mousemove", onMove);
    mount.addEventListener("mouseenter", onEnter);
    mount.addEventListener("mouseleave", onLeave);

    const onResize = () => {
      const aspect = mount.clientWidth / (mount.clientHeight || 1);
      renderer.setSize(mount.clientWidth, mount.clientWidth / aspect);
      renderer.render(scene, camera);
    };
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      gsap.killTweensOf(uniforms.uIntensity);
      stop();
      mount.removeEventListener("mousemove", onMove);
      mount.removeEventListener("mouseenter", onEnter);
      mount.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", onResize);
      geo.dispose();
      mat.dispose();
      uniforms.uTexture.value?.dispose();
      renderer.forceContextLoss();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount)
        mount.removeChild(renderer.domElement);
    };
  }, [fallback, src]);

  if (fallback)
    return <img src={src} alt={alt} loading="lazy" className={className} />;
  return (
    <div ref={mountRef} className={className} role="img" aria-label={alt} />
  );
}
