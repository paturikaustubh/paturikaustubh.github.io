import { useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";

import Lenis from "@studio-freight/lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

import "./App.css";
import AnimatedRoutes from "./AnimatedRoutes";
import Cursor from "./components/Cursor/Cursor";
import Console from "./components/Console/Console";

function App() {
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

  return (
    <Router>
      <Cursor />
      <AnimatedRoutes />
      <Console />
    </Router>
  );
}

export default App;
