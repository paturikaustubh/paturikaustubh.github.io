# Hybrid Editorial Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the portfolio's presentation layer into a "hybrid editorial" awwwards-grade design (light hero ↔ dark sections, Fraunces/Outfit/JetBrains Mono, GSAP/Framer transitions, lazy Three.js) while keeping all routes, data flow, Firebase features, and the Console easter egg.

**Architecture:** Presentation-layer rebuild in place. New `src/lib/` foundation (device tiering, gsap context hook, text reveal utilities) + new `src/components/Three/` (lazy WebGL, high-tier only). Every page component re-skinned on the new token/typography system; feature logic untouched. Spec: `docs/superpowers/specs/2026-06-11-portfolio-redesign-design.md`.

**Tech Stack:** Vite 5, React 18, TypeScript, Tailwind 3, GSAP 3 + ScrollTrigger, framer-motion 11, @studio-freight/lenis, split-type, three (new), Firebase (untouched).

**Verification model:** Repo has no test infra; adding one is out of scope. Each task verifies with `npm run build` (tsc + vite) and the final task does a Playwright visual sweep (1440px/390px, reduced-motion, all routes). Commit after every task.

**Branch:** `redesign/hybrid-editorial` (already created).

---

### Task 1: Install three.js

**Files:**
- Modify: `package.json` (via npm)

- [ ] **Step 1:** Run: `npm install three@^0.165.0 && npm install -D @types/three@^0.165.0`
- [ ] **Step 2:** Run: `npm run build` — Expected: PASS (no source uses three yet)
- [ ] **Step 3:** Commit: `git add package.json package-lock.json && git commit -m "chore: add three.js"`

---

### Task 2: Typography + design tokens

**Files:**
- Modify: `index.html` (font links)
- Modify: `src/index.css` (tokens + fonts; keep every existing class name, change values only)
- Modify: `tailwind.config.js` (fontFamily)
- Modify: `src/components/Name/styles.css` (drop Bebas import; sizes for new hero)

- [ ] **Step 1:** In `index.html`, immediately BEFORE the existing Material Symbols `<link>`, add:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,400;1,9..144,600&family=Outfit:wght@300;400;500&family=JetBrains+Mono:wght@400&display=swap"
/>
```

- [ ] **Step 2:** In `src/index.css`: delete the two `@import url(...Montserrat...)`/`...Poppins...` lines (Google fonts now load from index.html). Replace the `:root` token block and `body`/dark-mode rules:

```css
:root {
  --bg-color: #f4f1ec;
  --text-color: #141210;
  --nav-menu-bg: #e9e4dccc;
  --accent-color: #c2410c;
  /* console vars: KEEP UNCHANGED (everything from --console-bg down) */
}

body {
  color: var(--text-color);
  background-color: var(--bg-color);
  font-family: "Outfit", sans-serif;
  font-weight: 300;
}

.__theme-change-dark {
  --bg-color: #100e0c;
  --text-color: #ede8e0;
  background-color: var(--bg-color);
  color: var(--text-color);
  border-radius: 1.5rem;
}

*.__dark-mode {
  --bg-color: #100e0c;
  --text-color: #ede8e0;
  --nav-menu-bg: rgba(16 14 12 / 0.85);
}
```

Also delete the obsolete gradient vars (`--color1`..`--color5`, `--color-interactive`, `--circle-size`, `--blending`) — grep first: they are unused outside this block.

- [ ] **Step 3:** Still in `src/index.css`, restyle the shared utility classes (names unchanged):

```css
.__section-title {
  font-family: "Fraunces", serif;
  font-weight: 600;
  letter-spacing: -0.02em;
  @apply inline-block py-3 mb-2 overflow-hidden text-4xl lg:text-8xl md:text-6xl sm:text-5xl lg:mb-8 md:mb-4;
}

.__section-desc {
  @apply lg:text-4xl lg:leading-[1.35] font-[350] md:text-2xl sm:text-xl text-base;
}

.__mono-label {
  font-family: "JetBrains Mono", monospace;
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--accent-color);
}
```

(`__mono-label` is NEW — add it after `.__section-desc`.) Add at file end:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

.__marquee-track {
  display: flex;
  gap: 4rem;
  width: max-content;
  animation: marquee 30s linear infinite;
}
@keyframes marquee {
  to { transform: translateX(-50%); }
}
```

- [ ] **Step 4:** Replace `tailwind.config.js` theme.extend:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces"', "serif"],
        body: ['"Outfit"', "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      animation: {
        "pulse-fast":
          "social-link-pulse 1s infinite cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 5:** Replace `src/components/Name/styles.css` entirely:

```css
.__name-span {
  font-family: "Fraunces", serif;
  font-weight: 600;
  letter-spacing: -0.03em;
  font-size: clamp(3rem, 11dvw, 11rem);
  line-height: 0.95;
}

.__stroke-only {
  color: transparent;
  -webkit-text-stroke: var(--text-color);
  -webkit-text-stroke-width: 1.5px;
  font-style: italic;
}

.__name-bg {
  font-family: "Fraunces", serif;
  font-style: italic;
  font-weight: 400;
  color: var(--bg-color);
  transition: 300ms ease-in-out;
  font-size: 50dvw;
}
```

- [ ] **Step 6:** Run: `npm run build` — Expected: PASS
- [ ] **Step 7:** Commit: `git add -A && git commit -m "feat: editorial typography + warm token system"`

---

### Task 3: Foundation lib (device tier, useGsap, reveals) + Lenis wiring

**Files:**
- Create: `src/lib/device.ts`
- Create: `src/lib/useGsap.ts`
- Create: `src/lib/reveal.ts`
- Modify: `src/App.tsx`

- [ ] **Step 1:** Create `src/lib/device.ts`:

```ts
export type DeviceTier = "high" | "low";

let cached: DeviceTier | null = null;

export const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function getDeviceTier(): DeviceTier {
  if (cached) return cached;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const lowMemory = nav.deviceMemory !== undefined && nav.deviceMemory < 4;
  const lowCores =
    navigator.hardwareConcurrency !== undefined &&
    navigator.hardwareConcurrency < 4;
  let webgl = false;
  try {
    const canvas = document.createElement("canvas");
    webgl = !!(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    webgl = false;
  }
  cached =
    prefersReducedMotion() || lowMemory || lowCores || !webgl ? "low" : "high";
  return cached;
}
```

- [ ] **Step 2:** Create `src/lib/useGsap.ts`:

```ts
import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** gsap.context wrapper with automatic cleanup. All tweens/ScrollTriggers
 *  created inside `setup` are reverted on unmount. */
// eslint-disable-next-line react-hooks/exhaustive-deps
export function useGsap(
  setup: (ctx: gsap.Context) => void,
  deps: unknown[] = [],
) {
  useEffect(() => {
    const ctx = gsap.context(setup);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
```

- [ ] **Step 3:** Create `src/lib/reveal.ts`:

```ts
import { gsap } from "gsap";
import SplitType from "split-type";
import { prefersReducedMotion } from "./device";

/** Per-char mask reveal (chars rise from below an overflow-hidden line). */
export function revealChars(
  target: Element,
  vars: gsap.TweenVars = {},
): gsap.core.Tween {
  if (prefersReducedMotion())
    return gsap.from(target, { opacity: 0, duration: 0.5 });
  const { chars } = new SplitType(target as HTMLElement, {
    types: "chars,lines",
  });
  (target as HTMLElement)
    .querySelectorAll(".line")
    .forEach((line) => ((line as HTMLElement).style.overflow = "hidden"));
  return gsap.from(chars, {
    yPercent: 115,
    stagger: 0.025,
    duration: 0.9,
    ease: "power4.out",
    ...vars,
  });
}

/** Word-by-word opacity scrub tied to scroll. */
export function scrubWords(
  target: Element,
  trigger: Element = target,
): gsap.core.Tween {
  if (prefersReducedMotion())
    return gsap.from(target, { opacity: 0, duration: 0.5 });
  const { words } = new SplitType(target as HTMLElement, { types: "words" });
  return gsap.from(words, {
    opacity: 0.08,
    stagger: 0.04,
    scrollTrigger: {
      trigger,
      scrub: 1,
      start: "top 85%",
      end: "bottom 55%",
    },
  });
}
```

- [ ] **Step 4:** In `src/App.tsx`, replace the Lenis `useEffect` body with ScrollTrigger-synced version:

```tsx
useEffect(() => {
  const lenis = new Lenis();
  lenis.on("scroll", ScrollTrigger.update);
  const tick = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  return () => {
    gsap.ticker.remove(tick);
    lenis.destroy();
  };
}, []);
```

(Imports of `gsap`/`ScrollTrigger` already exist in App.tsx.)

- [ ] **Step 5:** Run: `npm run build` — Expected: PASS
- [ ] **Step 6:** Commit: `git add -A && git commit -m "feat: device tiering, useGsap context hook, reveal utils, lenis-scrolltrigger sync"`

---

### Task 4: Curtain page transition

**Files:**
- Modify: `src/Transition/transition.tsx` (full rewrite of overlay markup/variants; keep Navbar/Footer composition and name mapping)

- [ ] **Step 1:** Replace `src/Transition/transition.tsx` with:

```tsx
import { Variants, motion } from "framer-motion";
import { useLayoutEffect, useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import { Footer } from "../components/Footer/Footer";

const nameDisplayNameMapper: Record<string, string> = {
  portfolio: "Welcome Home",
  pyscope: "PyScope",
  vboss: "VBOSS",
};

const EASE: [number, number, number, number] = [0.76, 0, 0.24, 1];

const curtain: Variants = {
  initial: { y: "0%" },
  enter: {
    y: "-130%",
    transition: { duration: 0.9, delay: 0.45, ease: EASE },
  },
  exit: {
    y: "0%",
    transition: { duration: 0.7, ease: EASE },
  },
};

const label: Variants = {
  initial: { y: "0%", opacity: 1 },
  enter: {
    y: "-20%",
    opacity: 0,
    transition: { duration: 0.5, delay: 0.35, ease: EASE },
  },
  exit: {
    y: "0%",
    opacity: 1,
    transition: { duration: 0.45, delay: 0.25, ease: EASE },
  },
};

export const TransitionOverlay = ({ children }: { children: JSX.Element }) => {
  const [locationName, setLocationName] = useState("");

  useLayoutEffect(() => {
    const locationArr = location.pathname
      .split("/")
      .filter((value: string) => value !== "");
    const pageName =
      locationArr.length > 0 ? locationArr[locationArr.length - 1] : "portfolio";
    setLocationName(
      pageName
        .split("-")
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
    );
    setTimeout(() => {
      window.scrollTo({ top: 0 });
    }, 800);
  }, []);

  const getTransitionName = (name: string): string =>
    nameDisplayNameMapper[name] ||
    name.charAt(0).toUpperCase() + name.slice(1);

  return (
    <>
      <section>
        <Navbar />
        <div className="page">
          <div
            className="transition-container"
            style={{
              height: "100dvh",
              width: "100vw",
              position: "fixed",
              inset: 0,
              pointerEvents: "none",
              overflow: "hidden",
              zIndex: 999999,
            }}
          >
            <motion.div
              variants={curtain}
              initial="initial"
              animate="enter"
              exit="exit"
              style={{
                position: "absolute",
                top: "-15dvh",
                left: "-5vw",
                height: "130dvh",
                width: "110vw",
                backgroundColor: "#100e0c",
                borderRadius: "50% / 6dvh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                willChange: "transform",
              }}
            >
              <motion.span
                variants={label}
                initial="initial"
                animate="enter"
                exit="exit"
                className="font-display italic text-4xl lg:text-7xl md:text-5xl text-[#ede8e0]"
              >
                {getTransitionName(locationName.toLowerCase())}
              </motion.span>
            </motion.div>
          </div>
          <main>{children}</main>
        </div>
      </section>
      <Footer />
    </>
  );
};
```

- [ ] **Step 2:** Run: `npm run build` — Expected: PASS
- [ ] **Step 3:** Run `npm run dev`, click between Home → Projects: dark curved curtain sweeps up on enter, returns on exit, serif italic page label visible. (Manual smoke check.)
- [ ] **Step 4:** Commit: `git add -A && git commit -m "feat: curved curtain page transition"`

---

### Task 5: Cursor rewrite (quickTo + magnetic)

**Files:**
- Modify: `src/components/Cursor/Cursor.tsx`
- Modify: `src/components/Cursor/styles.css` (only if positioning model changes require it — cursor now translates via x/y, so `left/top` must be 0)

- [ ] **Step 1:** Replace `src/components/Cursor/Cursor.tsx` with:

```tsx
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { gsap } from "gsap";
import "./styles.css";

export default function Cursor() {
  const mousePos = useRef({ x: -100, y: -100 });
  const cursorRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor || window.matchMedia("(pointer: coarse)").matches) return;

    const xTo = gsap.quickTo(cursor, "x", { duration: 0.35, ease: "power3" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.35, ease: "power3" });

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      xTo(e.clientX - 10);
      yTo(e.clientY - 10);
      applyModes(e.clientX, e.clientY);
    };

    document.body.addEventListener("mousemove", handleMouseMove);
    return () =>
      document.body.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (mousePos.current.x !== -100)
        applyModes(mousePos.current.x, mousePos.current.y);
    }, 100);
    return () => clearTimeout(timer);
  }, [location]);

  const applyModes = (clientX: number, clientY: number) => {
    const cursor = cursorRef.current;
    if (!cursor) return;
    const elementUnderCursor = document.elementFromPoint(clientX, clientY);
    const navElement = document.querySelector("nav");

    cursor.classList.remove(
      "mode-difference",
      "mode-hover",
      "mode-social",
      "animate-pulse-fast",
      "mode-nav",
    );

    if (navElement && navElement.contains(elementUnderCursor)) {
      cursor.classList.toggle(
        "light-mode",
        navElement.classList.contains("__header-inverted"),
      );
    } else {
      cursor.classList.toggle(
        "light-mode",
        !!elementUnderCursor?.closest(".__theme-change-dark"),
      );
    }

    if (elementUnderCursor) {
      if (elementUnderCursor.closest(".__cursor-difference"))
        cursor.classList.add("mode-difference");
      if (elementUnderCursor.closest(".__cursor-hover"))
        cursor.classList.add("mode-hover");
      if (elementUnderCursor.closest(".__cursor-nav"))
        cursor.classList.add("mode-nav");
      if (elementUnderCursor.closest(".__custom-cursor-social"))
        cursor.classList.add("mode-social", "animate-pulse-fast");
    }
  };

  return <div ref={cursorRef} className="__custom-cursor" />;
}
```

- [ ] **Step 2:** In `src/components/Cursor/styles.css`, find the `.__custom-cursor` rule; ensure it has `left: 0; top: 0;` (movement now via transform) and `@media (pointer: coarse) { .__custom-cursor { display: none; } }`. Keep mode-* classes as-is.
- [ ] **Step 3:** Note: the old Cursor moved `.__projects-img-section` on every mousemove — that responsibility moves to the new WorkList follower (Task 7). No code for it remains here.
- [ ] **Step 4:** Run: `npm run build` — Expected: PASS
- [ ] **Step 5:** Commit: `git add -A && git commit -m "feat: gsap quickTo cursor, touch disabled"`

---

### Task 6: Three.js hero scene (lazy, high-tier only)

**Files:**
- Create: `src/components/Three/HeroScene.tsx`

- [ ] **Step 1:** Create `src/components/Three/HeroScene.tsx`:

```tsx
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
```

- [ ] **Step 2:** Run: `npm run build` — Expected: PASS (component not yet mounted; verifies three types compile)
- [ ] **Step 3:** Commit: `git add -A && git commit -m "feat: lazy three.js hero particle field"`

---

### Task 7: Shared WorkList (hover-follower project index)

Replaces duplicated list logic in HeroProjects + ProjectsList; kills the scroll/`elementsFromPoint` hacks.

**Files:**
- Create: `src/components/WorkList/WorkList.tsx`

- [ ] **Step 1:** Create `src/components/WorkList/WorkList.tsx`:

```tsx
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ProjectDetailsType } from "../../ProjectsInfos";
import { useGsap } from "../../lib/useGsap";

export default function WorkList({
  items,
  linkPrefix = "/projects",
}: {
  items: ProjectDetailsType[];
  linkPrefix?: string;
}) {
  const [active, setActive] = useState(0);
  const [hovering, setHovering] = useState(false);
  const followerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useGsap((ctx) => {
    const follower = followerRef.current;
    const list = listRef.current;
    if (!follower || !list) return;

    // Row reveal on scroll
    gsap.utils.toArray<HTMLElement>(".__work-row").forEach((row) => {
      gsap.from(row, {
        yPercent: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: row, start: "top 88%" },
      });
    });

    if (window.matchMedia("(pointer: coarse)").matches) return;
    const xTo = gsap.quickTo(follower, "x", { duration: 0.55, ease: "power3" });
    const yTo = gsap.quickTo(follower, "y", { duration: 0.55, ease: "power3" });
    const move = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };
    list.addEventListener("mousemove", move);
    ctx.add(() => () => list.removeEventListener("mousemove", move));
  }, []);

  return (
    <div ref={listRef} className="relative">
      {/* image follower — desktop only */}
      <div
        ref={followerRef}
        className="fixed top-0 left-0 z-[13] hidden lg:block w-[30rem] -translate-x-1/2 -translate-y-1/2 pointer-events-none overflow-hidden rounded-xl"
        style={{
          height: hovering ? "17rem" : "0rem",
          transition: "height 500ms cubic-bezier(0.76, 0, 0.24, 1)",
        }}
      >
        {items.map(({ img, title }, indx) => (
          <img
            key={indx}
            src={`/assets/projects/${img}/logo.png`}
            alt={title}
            loading="lazy"
            className="h-[17rem] w-full object-cover"
            style={{
              transform: `translateY(${active * -100}%)`,
              transition: "transform 700ms cubic-bezier(0.19, 1, 0.22, 1)",
            }}
          />
        ))}
      </div>

      {/* desktop rows */}
      <div className="hidden lg:block">
        {items.map(({ title, to }, indx) => (
          <Link
            to={`${linkPrefix}/${to}`}
            key={indx}
            className={`__work-row group flex items-baseline justify-between gap-6 border-t py-10 px-2 transition-[padding] duration-300 hover:px-6 ${
              indx === items.length - 1 ? "border-b" : ""
            }`}
            style={{ borderColor: "var(--text-color)" }}
            onMouseEnter={() => {
              setActive(indx);
              setHovering(true);
            }}
            onMouseLeave={() => setHovering(false)}
          >
            <span className="font-mono text-sm opacity-60">
              {String(indx + 1).padStart(2, "0")}
            </span>
            <span
              className={`font-display text-5xl xl:text-6xl grow transition-opacity duration-300 ${
                hovering && indx !== active ? "opacity-30" : "opacity-100"
              }`}
            >
              {title}
            </span>
            <span className="__mono-label">view ↗</span>
          </Link>
        ))}
      </div>

      {/* mobile / tablet grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:hidden">
        {items.map(({ title, img, to }, indx) => (
          <Link
            to={`${linkPrefix}/${to}`}
            className="__work-row flex flex-col gap-3"
            key={indx}
          >
            <div className="w-full overflow-hidden rounded-xl">
              <img
                src={`/assets/projects/${img}/logo.png`}
                alt={title}
                loading="lazy"
                className="w-full"
              />
            </div>
            <span className="flex items-center gap-2 font-display text-2xl">
              {title}
              <span className="text-lg material-symbols-outlined">
                open_in_new
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2:** Run: `npm run build` — Expected: PASS
- [ ] **Step 3:** Commit: `git add -A && git commit -m "feat: shared WorkList with quickTo image follower"`

---

### Task 8: Hero (Name) rebuild

**Files:**
- Modify: `src/components/Name/Name.tsx` (full rewrite)
- Modify: `src/Pages/Hero/Hero.tsx` (remove nav fromTo duplication only if broken — keep; remove handleMouseEnter/Leave cursor-style functions and their listeners; keep section-title/fade-in triggers)

- [ ] **Step 1:** Replace `src/components/Name/Name.tsx` with:

```tsx
import { Suspense, lazy, useRef } from "react";
import { gsap } from "gsap";
import { useGsap } from "../../lib/useGsap";
import { revealChars } from "../../lib/reveal";
import { getDeviceTier } from "../../lib/device";

import "./styles.css";

const HeroScene = lazy(() => import("../Three/HeroScene"));

export default function Name() {
  const sectionRef = useRef<HTMLElement>(null);
  const tier = getDeviceTier();

  useGsap(() => {
    document
      .querySelectorAll(".__animate-full-name span")
      .forEach((line, i) => revealChars(line, { delay: 0.6 + i * 0.12 }));
    gsap.from(".__hero-meta", {
      opacity: 0,
      y: 16,
      duration: 0.7,
      delay: 1.4,
      ease: "power2.out",
    });
    gsap.to(".__name-bg", { opacity: 1, duration: 0.8, delay: 1.8 });
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex flex-col items-center justify-center h-screen gap-10 overflow-hidden select-none __section-padding"
    >
      {tier === "high" && (
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>
      )}
      <div className="absolute flex items-center justify-center w-full h-full opacity-0 pointer-events-none __name-bg">
        hey!
      </div>

      <div className="relative z-[1] flex flex-col items-center justify-center gap-6">
        <p className="__hero-meta __mono-label">
          [ application developer — folio 2026 ]
        </p>
        <h1
          id="full-name"
          className="flex flex-col items-center text-center __name-span __animate-full-name __cursor-blend"
        >
          <span className="block overflow-hidden">KAUSTUBH</span>
          <span className="block overflow-hidden __stroke-only">PATURI</span>
        </h1>
        <p className="__hero-meta __mono-label">
          ( based in india — open to interesting problems )
        </p>
      </div>

      <p className="absolute bottom-8 __hero-meta __mono-label animate-bounce">
        scroll ↓
      </p>
    </section>
  );
}
```

- [ ] **Step 2:** In `src/Pages/Hero/Hero.tsx`: delete `handleMouseEnter`/`handleMouseLeave` functions, the `textBlendElements` `addEventListener`/`removeEventListener` blocks, and the corresponding cleanup lines. Keep: dark-mode class removal, nav fromTo, `__header-inverted` ScrollTriggers, sectionTitles + fadeIn reveals (both breakpoints), `ScrollTrigger.killAll()` cleanup.
- [ ] **Step 3:** Run: `npm run build` — Expected: PASS. Dev check: name chars rise per line, mono meta fades in, particles render on desktop.
- [ ] **Step 4:** Commit: `git add -A && git commit -m "feat: editorial hero with serif name + particle field"`

---

### Task 9: About (Summary) + Tech stack (Skills/Accordion) restyle

**Files:**
- Modify: `src/components/Summary/Summary.tsx`
- Modify: `src/components/Skills/Skills.tsx`
- Modify: `src/components/Accordion/Accordion.tsx`

- [ ] **Step 1:** In `Summary.tsx`, replace the returned JSX with:

```tsx
<section
  className="flex flex-col items-start justify-start gap-5 overflow-hidden bg-transparent select-none h-fit __section-padding __theme-change-dark"
  id="about-me"
>
  <p className="__mono-label">[ 01 — about ]</p>
  <div id="summary" className="w-full lg:w-4/5">
    <h1 className="flex flex-col __section-title __cursor-blend md:flex-row __cursor-difference">
      About Me
    </h1>
    <span className="inline-block h-full font-display font-[400] __fade-in __section-desc __cursor-blend __cursor-difference">
      A versatile Full-Stack Developer passionately dedicated to craft
      user-centric digital experiences while solving business challenges
      with innovation.
    </span>
  </div>
  <Link
    to={"more-about-me"}
    className="px-6 py-2 ml-auto font-mono text-sm uppercase tracking-widest border rounded-full expand-bg __cursor-difference"
  >
    Tell me more →
  </Link>
</section>
```

(Keep imports.)

- [ ] **Step 2:** In `Skills.tsx` JSX: above the title span add `<p className="__mono-label">[ 02 — tech stack ]</p>`; remove the `👨🏻‍💻` emoji span; body copy div keeps classes plus `font-display font-[400]`.
- [ ] **Step 3:** In `Accordion.tsx`: title button — replace `font-semibold` with `font-display font-[600]`; prepend an index span inside the button before `{title}`:

```tsx
<span className="flex items-baseline gap-4">
  <span className="font-mono text-sm opacity-60">
    {String(indx).padStart(2, "0")}
  </span>
  <span>{title}</span>
</span>
```

and on the description `<div className="px-5 pb-5 text-lg">` add `font-body`.
- [ ] **Step 4:** Run: `npm run build` — Expected: PASS
- [ ] **Step 5:** Commit: `git add -A && git commit -m "feat: editorial about + tech stack index styling"`

---

### Task 10: Home selected work → WorkList

**Files:**
- Modify: `src/components/HeroProjects/HeroProjects.tsx` (full rewrite)

- [ ] **Step 1:** Replace `src/components/HeroProjects/HeroProjects.tsx` with:

```tsx
import { Link } from "react-router-dom";
import { projectsInfos } from "../../ProjectsInfos";
import WorkList from "../WorkList/WorkList";

import "./styles.css";

export default function Projects() {
  return (
    <section
      className="__section-padding __theme-change-dark no-bottom-radius"
      id="projects"
    >
      <p className="__mono-label">[ 03 — selected work ]</p>
      <span className="__cursor-blend">
        <span className="__section-title">Projects</span>
      </span>
      <div className="mt-8">
        <WorkList items={projectsInfos.slice(0, 4)} linkPrefix="projects" />
      </div>
      <div className="flex items-center justify-end w-full mt-4 lg:mt-12 md:mt-8">
        <Link
          to={"projects"}
          className="px-6 py-2 font-mono text-sm uppercase tracking-widest border rounded-full expand-bg __cursor-difference"
        >
          All projects →
        </Link>
      </div>
    </section>
  );
}
```

NOTE: `linkPrefix="projects"` (relative) because home renders at `/` and old code used relative `projects/${to}` links. WorkList prepends `${linkPrefix}/`.

- [ ] **Step 2:** Run: `npm run build` — Expected: PASS. Lint may flag unused styles in `HeroProjects/styles.css` — CSS is not linted; leave file (other classes may be referenced); remove import only if build errors.
- [ ] **Step 3:** Commit: `git add -A && git commit -m "feat: home selected work uses shared WorkList"`

---

### Task 11: Projects index page → WorkList

**Files:**
- Modify: `src/Pages/Projects/ProjectsList.tsx` (full rewrite)

- [ ] **Step 1:** Replace `src/Pages/Projects/ProjectsList.tsx` with:

```tsx
import { useEffect } from "react";
import { projectsInfos } from "../../ProjectsInfos";
import { TransitionOverlay } from "../../Transition/transition";
import WorkList from "../../components/WorkList/WorkList";

export default function ProjectsList() {
  useEffect(() => {
    document.body.classList.add("__dark-mode");
    document.querySelector("nav")?.classList.add("__header-inverted");
    return () => {
      document.querySelector("nav")?.classList.remove("__header-inverted");
    };
  }, []);

  return (
    <TransitionOverlay>
      <section className="__theme-change-dark __section-padding no-border-radius min-h-[100dvh]">
        <p className="__mono-label">[ index — all work ]</p>
        <h1 className="inline-block pb-1 overflow-hidden __section-title">
          All Projects
        </h1>
        <div className="mt-6">
          <WorkList items={projectsInfos} />
        </div>
      </section>
    </TransitionOverlay>
  );
}
```

(Default `linkPrefix="/projects"` gives absolute links — matches old behavior on this page.)

- [ ] **Step 2:** Run: `npm run build` — Expected: PASS
- [ ] **Step 3:** Commit: `git add -A && git commit -m "feat: projects index on shared WorkList"`

---

### Task 12: WebGL DistortImage + ProjectDetails rebuild

**Files:**
- Create: `src/components/Three/DistortImage.tsx`
- Modify: `src/Pages/Projects/ProjectDetails.tsx`

- [ ] **Step 1:** Create `src/components/Three/DistortImage.tsx`:

```tsx
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
        tex.colorSpace = THREE.SRGBColorSpace;
        uniforms.uTexture.value = tex;
        const aspect = tex.image.width / tex.image.height;
        mount.style.aspectRatio = `${aspect}`;
        renderer.setSize(mount.clientWidth, mount.clientWidth / aspect);
        mount.appendChild(renderer.domElement);
        renderer.render(scene, camera);
      },
      undefined,
      () => setFallback(true),
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
      stop();
      mount.removeEventListener("mousemove", onMove);
      mount.removeEventListener("mouseenter", onEnter);
      mount.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", onResize);
      geo.dispose();
      mat.dispose();
      uniforms.uTexture.value?.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount)
        mount.removeChild(renderer.domElement);
    };
  }, [fallback, src]);

  if (fallback)
    return <img src={src} alt={alt} loading="lazy" className={className} />;
  return <div ref={mountRef} className={className} role="img" aria-label={alt} />;
}
```

- [ ] **Step 2:** In `src/Pages/Projects/ProjectDetails.tsx`:
  - Add imports: `import DistortImage from "../../components/Three/DistortImage";`
  - Add state: `const [videoPlaying, setVideoPlaying] = useState(false);`
  - Replace the main `<img src={...logo.png} ... />` (the one with `md:w-[80%]`) with:

```tsx
<DistortImage
  src={`/assets/projects/${projectDetails.img}/logo.png`}
  alt={projectDetails.title}
  className="md:w-[80%] w-full mx-auto lg:mt-12 rounded-md relative border-2 border-neutral-700 overflow-hidden"
/>
```

  - Replace the `<video ...>` block with poster + click-to-play:

```tsx
<div className="relative lg:mt-12 md:mt-8 mt-4">
  <video
    src={`/assets/projects/${projectDetails.img}/sample.mp4`}
    ref={videoRef}
    loop
    muted
    playsInline
    preload="none"
    controls={false}
    poster={`/assets/projects/${projectDetails.img}/logo.png`}
    className="max-h-[35rem] mx-auto border-2 border-neutral-700 rounded-md"
    onClick={handleFullscreen}
  />
  {!videoPlaying && (
    <button
      className="absolute inset-0 m-auto h-fit w-fit px-6 py-2 font-mono text-sm uppercase tracking-widest bg-[#100e0c] text-[#ede8e0] rounded-full border"
      onClick={() => {
        videoRef.current?.play();
        setVideoPlaying(true);
      }}
    >
      ( play demo )
    </button>
  )}
</div>
```

  Remove `autoPlay` (this is the point: no auto-download of 6–30 MB files).
  - On the two `responsive-*.png` and the hidden prev/next images: add `loading="lazy"`.
  - Title `<h1>` keeps `__section-title`; add below it a mono meta row (render inside the existing header flex container, after the h1):

```tsx
<div className="flex flex-wrap items-center gap-4 __mono-label">
  {projectDetails.repo && (
    <Link to={projectDetails.repo} target="_blank" className="underline">
      repo ↗
    </Link>
  )}
  {projectDetails.live && (
    <Link to={projectDetails.live} target="_blank" className="underline">
      live ↗
    </Link>
  )}
</div>
```

  (Keep the existing Preview button too if desired — NO: remove the old `Preview` Link block; the meta row replaces it.)
  - Fix the stale `/portfolio/assets/...` path in the hidden next-project image → `/assets/projects/...`.
- [ ] **Step 3:** Run: `npm run build` — Expected: PASS. Dev check: details page — image distorts on hover (desktop), video shows poster + plays only on click.
- [ ] **Step 4:** Commit: `git add -A && git commit -m "feat: webgl distort image + click-to-play video on project details"`

---

### Task 13: MoreAboutMe restyle

**Files:**
- Modify: `src/Pages/Projects/MoreAboutMe/MoreAboutMe.tsx`
- Modify: `src/Pages/Projects/MoreAboutMe/styles.css`

- [ ] **Step 1:** In `MoreAboutMe.tsx`: above the `<h1>` add `<p className="__mono-label">[ the human behind the code ]</p>`. Keep all paragraph/animation logic.
- [ ] **Step 2:** In `MoreAboutMe/styles.css` append:

```css
.description p {
  font-family: "Outfit", sans-serif;
  font-weight: 300;
}

.description p:first-of-type::first-letter {
  font-family: "Fraunces", serif;
  font-size: 3.2em;
  float: left;
  line-height: 0.8;
  padding-right: 0.08em;
}

.name-title strong {
  font-family: "Fraunces", serif;
}
```

- [ ] **Step 3:** Run: `npm run build` — Expected: PASS
- [ ] **Step 4:** Commit: `git add -A && git commit -m "feat: editorial more-about-me with drop cap"`

---

### Task 14: Footer restyle + marquee

**Files:**
- Modify: `src/components/Footer/Footer.tsx`
- Modify: `src/components/Footer/styles.css` (footer-name font)

- [ ] **Step 1:** In `Footer.tsx` JSX:
  - Headline `<p className="text-4xl font-bold lg:text-7xl md:text-6xl">Let's connect! ...</p>` → `<p className="font-display font-[600] text-4xl lg:text-7xl md:text-6xl">Let's connect!</p>` (emoji span removed).
  - `Send Instant Message` and `Find me on socials` headers: add `font-display font-[600]`, drop `font-semibold`.
  - Above `<p className="...footer-name...">` insert the marquee strip:

```tsx
<div className="mt-16 -mx-12 overflow-hidden border-y border-neutral-800 py-3" aria-hidden="true">
  <div className="__marquee-track font-mono text-sm uppercase tracking-widest text-neutral-500">
    {Array.from({ length: 2 }).map((_, i) => (
      <span key={i} className="flex gap-16 shrink-0">
        <span>kaustubh paturi</span><span>—</span>
        <span>application developer</span><span>—</span>
        <span>full-stack</span><span>—</span>
        <span>open to work</span><span>—</span>
        <span>kaustubh paturi</span><span>—</span>
        <span>application developer</span><span>—</span>
        <span>full-stack</span><span>—</span>
        <span>open to work</span><span>—</span>
      </span>
    ))}
  </div>
</div>
```

  - Footer bg: change `bg-stone-950` → `bg-[#100e0c]`.
- [ ] **Step 2:** In `Footer/styles.css`, find `.footer-name` rule, set `font-family: "Fraunces", serif;` (keep size/weight mechanics for the hover-weight effect).
- [ ] **Step 3:** Run: `npm run build` — Expected: PASS
- [ ] **Step 4:** Commit: `git add -A && git commit -m "feat: editorial footer with marquee strip"`

---

### Task 15: Navbar, NotFound, Console token alignment

**Files:**
- Modify: `src/components/Navbar/Navbar.tsx`
- Modify: `src/components/NotFound/NotFound.tsx`
- Modify: `src/components/NotFound/styles.css`
- Modify: `src/components/Console/style.css` (only if hardcoded stone colors found)

- [ ] **Step 1:** `Navbar.tsx`: desktop nav links — on each `__nav-underline-element` add `font-mono text-sm uppercase tracking-widest`. Mobile menu links keep size, add `font-display`.
- [ ] **Step 2:** `NotFound.tsx`: delete `handleMouseEnter`/`handleMouseLeave` and the listener registration `useEffect` body lines that reference them (the nav fixed/footer hidden lines stay). In `NotFound/styles.css` set `.not-found .number { font-family: "Fraunces", serif; }` and `.not-found .text { font-family: "JetBrains Mono", monospace; }` (adjust selectors to whatever exists in that file — read it first; if class names differ, map number/text equivalents).
- [ ] **Step 3:** Grep `src/components/Console/style.css` and remaining `src/**/*.css` for literal `#e7e5e4` / `#1c1917` / `#d4d4d4` → replace with `var(--text-color)` / `var(--bg-color)` where they represent theme colors (console palette vars stay untouched). Also grep `.tsx` files for `#E7E5E4`/`#0c0a09` literals (Hero.tsx cursor handlers are already deleted; transition uses new `#100e0c` intentionally).
- [ ] **Step 4:** Run: `npm run build` — Expected: PASS
- [ ] **Step 5:** Commit: `git add -A && git commit -m "feat: nav/404/console aligned to token system"`

---

### Task 16: Final verification sweep

**Files:** none (verification only)

- [ ] **Step 1:** Run: `npm run lint` — Expected: PASS (fix any unused-import fallout from rewrites; `--max-warnings 0` is enforced).
- [ ] **Step 2:** Run: `npm run build` — Expected: PASS. Note gzip sizes from vite output; main bundle + three chunk should be ≈≤350 KB gzip combined. Confirm three.js is a separate lazy chunk (look for `HeroScene-*.js` / `DistortImage-*.js` in output — DistortImage is statically imported by ProjectDetails, which is fine since ProjectDetails itself is small; OPTIONAL: convert to lazy if bundle exceeds budget).
- [ ] **Step 3:** Run `npm run dev`. With Playwright: visit `/`, `/projects`, `/projects/pyscope`, `/more-about-me`, `/nonexistent` at 1440×900 and 390×844. Check: no horizontal overflow, fonts loaded (Fraunces headings), curtain transition plays, work-list follower works (desktop), mobile grid renders, video does NOT auto-download (network tab: no sample.mp4 request until click).
- [ ] **Step 4:** Playwright with reduced-motion emulation + CDP override (or temporarily force `getDeviceTier` to `"low"` via devtools `Object.defineProperty(navigator,'hardwareConcurrency',{value:2})` before load): hero renders without canvas, DistortImage falls back to `<img>`, content fully readable.
- [ ] **Step 5:** Fix anything found; commit fixes: `git commit -m "fix: redesign verification fixes"`.

---

## Self-review (done at plan time)

- Spec coverage: tokens/fonts (T2), animation core + lenis (T3), tiering (T3), curtain (T4), cursor (T5), hero three (T6+T8), about (T9), tech stack (T9), work list (T7/T10/T11), distortion + video diet (T12), more-about-me (T13), footer/marquee (T14), nav/404/console (T15), perf+verification (T16). ✓
- No placeholders: every code step has concrete code; restyle steps name exact classes/selectors. ✓ (NotFound styles.css unread — step says read first and map selectors; acceptable as the file is tiny.)
- Type consistency: `getDeviceTier`, `useGsap(setup, deps)`, `revealChars`, `WorkList({items, linkPrefix})`, `DistortImage({src, alt, className})` used consistently. ✓
