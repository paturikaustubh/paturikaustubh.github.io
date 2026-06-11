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
    const scrollId = setTimeout(() => {
      window.scrollTo({ top: 0 });
    }, 800);
    return () => clearTimeout(scrollId);
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
