import { Link } from "react-router-dom";
import "./styles.css";

export default function Summary() {

  return (
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
  );
}
