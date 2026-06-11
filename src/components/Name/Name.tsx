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
      className="relative flex flex-col items-center justify-center h-[100dvh] -mt-20 gap-10 overflow-hidden select-none __section-padding"
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
