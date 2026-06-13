import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useGsap } from "../../lib/useGsap";
import { revealChars } from "../../lib/reveal";
import { getDeviceTier, prefersReducedMotion } from "../../lib/device";
import { CURTAIN_DONE_MS, INTRO_DELAY } from "../../lib/intro";

import "./styles.css";

const HeroScene = lazy(() => import("../Three/HeroScene"));

export default function Name() {
  const sectionRef = useRef<HTMLElement>(null);
  const tier = getDeviceTier();

  // Defer the WebGL scene until the curtain has fully lifted — context
  // creation and the three.js chunk parse are the main sources of frame
  // drops when they compete with the entry animations.
  const [sceneReady, setSceneReady] = useState(false);
  useEffect(() => {
    if (tier !== "high") return;
    const t = setTimeout(() => setSceneReady(true), CURTAIN_DONE_MS + 250);
    return () => clearTimeout(t);
  }, [tier]);

  useGsap(() => {
    document
      .querySelectorAll(".__animate-full-name span")
      .forEach((line, i) =>
        revealChars(line, { delay: INTRO_DELAY + i * 0.12 }),
      );
    if (prefersReducedMotion()) {
      gsap.set(".__hero-meta", { opacity: 1 });
      return;
    }
    gsap.from(".__hero-meta", {
      opacity: 0,
      y: 16,
      duration: 0.7,
      delay: INTRO_DELAY + 0.55,
      ease: "power2.out",
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex flex-col items-center justify-center h-[100dvh] -mt-20 gap-10 overflow-hidden select-none __section-padding"
    >
      {sceneReady && (
        <Suspense fallback={null}>
          <div
            className="absolute inset-0 z-0"
            style={{ animation: "fade-in 800ms ease both" }}
          >
            <HeroScene />
          </div>
        </Suspense>
      )}

      <div className="relative z-[1] flex flex-col items-center justify-center gap-6">
        <p className="__hero-meta __mono-label">
          [ application developer — folio 2026 ]
        </p>
        <h1
          id="full-name"
          className="flex flex-col items-center text-center __name-span __animate-full-name __cursor-blend"
        >
          <span className="block overflow-hidden __name-accent">KAUSTUBH</span>
          <span className="block overflow-hidden">PATURI</span>
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
