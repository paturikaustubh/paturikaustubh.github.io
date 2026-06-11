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
  initial: { y: "0%" },
  enter: {
    y: "-130%",
    transition: { duration: 0.85, delay: 1.05, ease: EASE },
  },
  exit: {
    y: "0%",
    transition: { duration: 0.65, ease: EASE },
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
      const tl = gsap.timeline({ delay: 0.12 });
      tl.to(
        oldChars,
        {
          yPercent: 115,
          duration: 0.42,
          ease: "power3.in",
          stagger: 0.045,
        },
        0,
      );
      tl.fromTo(
        newChars,
        { yPercent: -115 },
        {
          yPercent: 0,
          duration: 0.5,
          ease: "power3.out",
          stagger: 0.045,
        },
        0.18,
      );
    }

    const timer = setTimeout(() => {
      window.scrollTo({ top: 0 });
    }, 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderChars = (word: string, hidden: boolean) =>
    word.split("").map((ch, i) => (
      <span
        key={i}
        className="__t-ch inline-block"
        style={hidden ? { transform: "translateY(-115%)" } : undefined}
      >
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
                top: "-15dvh",
                left: "-5vw",
                height: "130dvh",
                width: "110vw",
                backgroundColor: "#efe9e1",
                borderRadius: "50% / 6dvh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                willChange: "transform",
              }}
            >
              <div
                ref={labelRef}
                className="relative font-serif italic text-4xl lg:text-7xl md:text-5xl text-[#14110e]"
              >
                {/* old word drops away, new word drops in, left â†’ right */}
                <div className="__t-old absolute inset-0 flex items-center justify-center overflow-hidden whitespace-nowrap">
                  {renderChars(fromName, false)}
                </div>
                <div className="__t-new flex items-center justify-center overflow-hidden whitespace-nowrap">
                  {renderChars(
                    displayName,
                    fromName !== displayName && fromName !== "",
                  )}
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
