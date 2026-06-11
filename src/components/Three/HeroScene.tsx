import { useEffect, useRef } from "react";
import * as THREE from "three";

/** GPU-driven particle terrain: simplex-noise dunes that ripple and burst
 *  around the cursor. All displacement happens in the vertex shader — one
 *  draw call, zero per-frame CPU loops. DPR capped, paused off-screen,
 *  fully disposed on unmount. Mounted only on high-tier devices. */

const VERT = /* glsl */ `
  // Ashima 3D simplex noise
  vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
  float snoise(vec3 v){
    const vec2 C=vec2(1.0/6.0,1.0/3.0);
    const vec4 D=vec4(0.0,0.5,1.0,2.0);
    vec3 i=floor(v+dot(v,C.yyy));
    vec3 x0=v-i+dot(i,C.xxx);
    vec3 g=step(x0.yzx,x0.xyz);
    vec3 l=1.0-g;
    vec3 i1=min(g.xyz,l.zxy);
    vec3 i2=max(g.xyz,l.zxy);
    vec3 x1=x0-i1+C.xxx;
    vec3 x2=x0-i2+C.yyy;
    vec3 x3=x0-D.yyy;
    i=mod289(i);
    vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
    float n_=0.142857142857;
    vec3 ns=n_*D.wyz-D.xzx;
    vec4 j=p-49.0*floor(p*ns.z*ns.z);
    vec4 x_=floor(j*ns.z);
    vec4 y_=floor(j-7.0*x_);
    vec4 x=x_*ns.x+ns.yyyy;
    vec4 y=y_*ns.x+ns.yyyy;
    vec4 h=1.0-abs(x)-abs(y);
    vec4 b0=vec4(x.xy,y.xy);
    vec4 b1=vec4(x.zw,y.zw);
    vec4 s0=floor(b0)*2.0+1.0;
    vec4 s1=floor(b1)*2.0+1.0;
    vec4 sh=-step(h,vec4(0.0));
    vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
    vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
    vec3 p0=vec3(a0.xy,h.x);
    vec3 p1=vec3(a0.zw,h.y);
    vec3 p2=vec3(a1.xy,h.z);
    vec3 p3=vec3(a1.zw,h.w);
    vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
    p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
    vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
    m=m*m;
    return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
  }

  uniform float uTime;
  uniform vec2 uMouse;     // world xz of cursor on the plane
  uniform float uVel;      // smoothed cursor speed 0..1
  varying float vGlow;
  varying float vH;

  void main() {
    vec3 p = position;

    // flowing dunes
    float n = snoise(vec3(p.x * 0.32, p.z * 0.32, uTime * 0.18));
    float n2 = snoise(vec3(p.x * 0.9 + 40.0, p.z * 0.9, uTime * 0.32));
    p.y += n * 0.55 + n2 * 0.18;

    // cursor crater: ripple ring radiating from the mouse
    float d = distance(p.xz, uMouse);
    float ring = sin(d * 4.5 - uTime * 5.0) * exp(-d * 0.9);
    float burst = (0.35 + uVel * 2.2);
    p.y += ring * burst * 0.45;

    float glow = exp(-d * 0.8) * (0.4 + uVel * 1.6);
    vGlow = clamp(glow, 0.0, 1.0);
    vH = p.y;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (1.4 + vGlow * 4.0) * (12.0 / -mv.z);
  }
`;

const FRAG = /* glsl */ `
  precision mediump float;
  varying float vGlow;
  varying float vH;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    if (dot(c, c) > 0.25) discard;

    vec3 cream = vec3(0.937, 0.913, 0.882);
    vec3 ember = vec3(1.0, 0.36, 0.157);
    vec3 col = mix(ember, cream, clamp(vH * 0.7 + vGlow, 0.0, 1.0));
    float alpha = 0.16 + vGlow * 0.7;
    gl_FragColor = vec4(col, alpha);
  }
`;

export default function HeroScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      55,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100,
    );
    camera.position.set(0, 3.4, 7.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const SIZE = 16;
    const geo = new THREE.PlaneGeometry(SIZE, SIZE, 120, 120);
    geo.rotateX(-Math.PI / 2);

    const uniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(100, 100) },
      uVel: { value: 0 },
    };
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const points = new THREE.Points(geo, mat);
    scene.add(points);

    // cursor → world xz on the y=0 plane via camera ray
    const raycaster = new THREE.Raycaster();
    const planeY = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const ndc = new THREE.Vector2();
    const hit = new THREE.Vector3();
    const target = new THREE.Vector2(100, 100);
    let lastX = 0;
    let lastY = 0;
    let velTarget = 0;

    const onMouse = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      ndc.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(ndc, camera);
      if (raycaster.ray.intersectPlane(planeY, hit)) target.set(hit.x, hit.z);
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      velTarget = Math.min(1, Math.hypot(dx, dy) / 60);
    };
    window.addEventListener("mousemove", onMouse);

    let frame = 0;
    let running = false;
    const clock = new THREE.Clock();

    const tick = () => {
      frame = requestAnimationFrame(tick);
      uniforms.uTime.value = clock.getElapsedTime();
      uniforms.uMouse.value.lerp(target, 0.08);
      velTarget *= 0.94;
      uniforms.uVel.value += (velTarget - uniforms.uVel.value) * 0.1;
      points.rotation.y = Math.sin(uniforms.uTime.value * 0.05) * 0.12;
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
