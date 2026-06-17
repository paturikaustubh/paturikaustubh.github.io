import { Variants, motion } from "framer-motion";
import { useEffect, useMemo } from "react";
import Navbar from "../components/Navbar/Navbar";
import { Footer } from "../components/Footer/Footer";
import { CURTAIN_DELAY, CURTAIN_DURATION, setIntroDelay } from "../lib/intro";

const nameDisplayNameMapper: Record<string, string> = {
  portfolio: "Welcome Home",
  projects: "Personal Projects",
  experience: "Experience",
  pyscope: "PyScope",
  vboss: "VBOSS",
};

const EASE: [number, number, number, number] = [0.76, 0, 0.24, 1];

const ANIM_DELAY = 0;
const STAGGER = 0.035;
const OLD_DURATION = 0.32;
const NEW_DURATION = 0.38;
// New char starts when old is ~55% done — eliminates double-visibility overlap.
const NEW_SLOT_DELAY = OLD_DURATION * 0.55;

/** Survives route unmounts so the incoming page knows which name to morph from.
 *  Advancing only on a genuine name change keeps `advanceName` idempotent under
 *  React StrictMode's double-mount and double-invoked renders. */
const nameSlot = { current: "", previous: "" };
const advanceName = (name: string): string => {
  if (nameSlot.current !== name) {
    nameSlot.previous = nameSlot.current;
    nameSlot.current = name;
  }
  return nameSlot.previous;
};

const curtainBase: Variants = {
  initial: { y: "0%" },
  exit: { y: "0%", transition: { duration: 0.7, ease: EASE } },
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
  const fromName = useMemo(() => advanceName(displayName), [displayName]);

  const crossfade = fromName !== "" && fromName !== displayName;

  // Curtain must stay down until animation finishes.
  // spacerName is the wider name — its last index is the last stagger position.
  const spacerLen = crossfade
    ? Math.max(fromName.length, displayName.length)
    : 0;
  const animEndTime = crossfade
    ? (spacerLen - 1) * STAGGER + NEW_SLOT_DELAY + NEW_DURATION
    : 0;
  const curtainDelay = crossfade ? animEndTime : CURTAIN_DELAY;

  // Sync INTRO_DELAY so page animations wait for the actual curtain lift.
  // Called during render — fires before children's useEffect/useLayoutEffect.
  setIntroDelay(curtainDelay + CURTAIN_DURATION * 0.5);

  const curtainVariants: Variants = {
    ...curtainBase,
    enter: {
      y: "-130%",
      transition: { duration: CURTAIN_DURATION, delay: curtainDelay, ease: EASE },
    },
  };

  // Wider name sizes the container; both layers sit inside absolutely.
  const spacerName =
    fromName.length >= displayName.length ? fromName : displayName;

  // Both names are centered inside spacerName's box. Stagger by horizontal
  // position (offset + charIndex) so chars at the same x-slot animate at the
  // same time — prevents overlap when names differ in length.
  const oldOffset = Math.round((spacerName.length - fromName.length) / 2);
  const newOffset = Math.round((spacerName.length - displayName.length) / 2);

  useEffect(() => {
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0 });
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const renderOldChars = (word: string) =>
    word.split("").map((ch, i) => (
      <span key={i} className="inline-block overflow-hidden leading-none">
        <motion.span
          className="inline-block"
          initial={{ y: "0%", opacity: 1 }}
          animate={{ y: "-120%", opacity: 0 }}
          transition={{
            duration: OLD_DURATION,
            delay: ANIM_DELAY + (oldOffset + i) * STAGGER,
            ease: [0.76, 0, 0.24, 1],
          }}
        >
          {ch === " " ? " " : ch}
        </motion.span>
      </span>
    ));

  const renderNewChars = (word: string) =>
    word.split("").map((ch, i) => (
      <span key={i} className="inline-block overflow-hidden leading-none">
        <motion.span
          className="inline-block"
          initial={{ y: crossfade ? "120%" : "0%", opacity: crossfade ? 0 : 1 }}
          animate={{ y: "0%", opacity: 1 }}
          transition={{
            duration: NEW_DURATION,
            delay: crossfade ? ANIM_DELAY + (newOffset + i) * STAGGER + NEW_SLOT_DELAY : 0,
            ease: [0.24, 1, 0.24, 1],
          }}
        >
          {ch === " " ? " " : ch}
        </motion.span>
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
              variants={curtainVariants}
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
              {/* Invisible spacer sizes container to the wider name.
                  Both animation layers are absolute so they don't stack. */}
              <div className="relative font-serif italic text-4xl lg:text-7xl md:text-5xl text-[#ede8e0]">
                <span className="invisible whitespace-nowrap select-none pointer-events-none">
                  {spacerName}
                </span>
                {crossfade && (
                  <div className="absolute inset-0 flex items-center justify-center whitespace-nowrap">
                    {renderOldChars(fromName)}
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center whitespace-nowrap">
                  {renderNewChars(displayName)}
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
