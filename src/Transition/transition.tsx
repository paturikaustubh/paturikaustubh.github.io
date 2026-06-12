import { Variants, motion } from "framer-motion";
import { useLayoutEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import Navbar from "../components/Navbar/Navbar";
import { Footer } from "../components/Footer/Footer";

const nameDisplayNameMapper: Record<string, string> = {
  portfolio: "Welcome Home",
  pyscope: "PyScope",
  vboss: "VBOSS",
};

const EASE: [number, number, number, number] = [0.76, 0, 0.24, 1];

/** Survives route unmounts so the incoming page knows which name to morph from. */
let lastShownName = "";

const curtain: Variants = {
  initial: { x: "0%" },
  enter: {
    x: "110%",
    transition: { duration: 0.82, delay: 0.9, ease: EASE },
  },
  exit: {
    x: "0%",
    transition: { duration: 0.6, ease: EASE },
  },
};

const getTransitionName = (raw: string): string => {
  const key = raw.toLowerCase();
  return (
    nameDisplayNameMapper[key] || raw.charAt(0).toUpperCase() + raw.slice(1)
  );
};

const pageNameFromPath = (pathname: string): string => {
  const parts = pathname.split("/").filter((v) => v !== "");
  const slug = parts.length > 0 ? parts[parts.length - 1] : "portfolio";
  return getTransitionName(
    slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
  );
};

export const TransitionOverlay = ({ children }: { children: JSX.Element }) => {
  const displayName = useMemo(
    () => pageNameFromPath(window.location.pathname),
    [],
  );
  // capture the previous page's name once, before overwriting the module slot
  const fromNameRef = useRef<string | null>(null);
  if (fromNameRef.current === null) {
    fromNameRef.current = lastShownName;
    lastShownName = displayName;
  }
  const fromName = fromNameRef.current;

  const labelRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const label = labelRef.current;
    if (label && fromName !== displayName) {
      const oldChars = label.querySelectorAll<HTMLElement>(".__t-old .__t-ch");
      const newChars = label.querySelectorAll<HTMLElement>(".__t-new .__t-ch");

      // ensure new chars start invisible before animation
      gsap.set(newChars, { scaleY: 0, transformOrigin: "center top", opacity: 0 });

      const tl = gsap.timeline({ delay: 0.08 });
      // old chars: compress down (scaleY 1→0) left-to-right
      tl.fromTo(
        oldChars,
        { scaleY: 1, transformOrigin: "center bottom" },
        {
          scaleY: 0,
          opacity: 0,
          duration: 0.38,
          ease: "power2.in",
          stagger: { each: 0.04, from: "start" },
        },
        0,
      );
      // new chars: expand from top (scaleY 0→1) left-to-right
      tl.fromTo(
        newChars,
        { scaleY: 0, transformOrigin: "center top" },
        {
          scaleY: 1,
          opacity: 1,
          duration: 0.46,
          ease: "power3.out",
          stagger: { each: 0.04, from: "start" },
        },
        0.2,
      );
    }

    const timer = setTimeout(() => {
      window.scrollTo({ top: 0 });
    }, 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderChars = (word: string) =>
    word.split("").map((ch, i) => (
      <span key={i} className="__t-ch inline-block">
        {ch === " " ? " " : ch}
      </span>
    ));

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
                top: 0,
                left: "-5vw",
                height: "100dvh",
                width: "110vw",
                backgroundColor: "#100e0c",
                borderRadius: "50dvh / 50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                willChange: "transform",
              }}
            >
              <div
                ref={labelRef}
                className="relative font-serif italic text-4xl lg:text-7xl md:text-5xl text-[#ede8e0]"
              >
                {/* old word drops away, new word drops in, left â†’ right */}
                <div className="__t-old absolute inset-0 flex items-center justify-center overflow-hidden whitespace-nowrap">
                  {renderChars(fromName)}
                </div>
                <div className="__t-new flex items-center justify-center overflow-hidden whitespace-nowrap">
                  {renderChars(displayName)}
                </div>
              </div>
            </motion.div>
          </div>
          <main>{children}</main>
        </div>
      </section>
      <Footer />
    </>
  );
};
