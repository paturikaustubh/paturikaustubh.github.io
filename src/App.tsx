import { useEffect, useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";

import Lenis from "@studio-freight/lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

import "./App.css";
import AnimatedRoutes from "./AnimatedRoutes";
import Cursor from "./components/Cursor/Cursor";
import Console from "./components/Console/Console";
import Preloader from "./components/Preloader/Preloader";

function App() {
  // Boot gate: keep the app unmounted until fonts and the page have fully
  // loaded (plus a short minimum so the loader doesn't flash). Entry
  // animations then start on an idle main thread instead of mid-load,
  // which is what made refreshes feel glitchy.
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    const minWait = new Promise((resolve) => setTimeout(resolve, 900));
    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    const pageLoaded =
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise((resolve) =>
            window.addEventListener("load", resolve, { once: true }),
          );
    Promise.all([minWait, fontsReady, pageLoaded]).then(() =>
      setBooted(true),
    );
  }, []);

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

  // After boot, lazy chunks/images below the fold can shift layout —
  // recompute ScrollTrigger positions once the entry sequence settles.
  useEffect(() => {
    if (!booted) return;
    const t = setTimeout(() => ScrollTrigger.refresh(), 1800);
    return () => clearTimeout(t);
  }, [booted]);

  return (
    <Router>
      <Preloader done={booted} />
      {booted && (
        <>
          <Cursor />
          <AnimatedRoutes />
          <Console />
        </>
      )}
    </Router>
  );
}

export default App;
