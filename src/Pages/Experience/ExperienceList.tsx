import { useEffect } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { experienceInfos } from "../../ExperienceInfos";
import { TransitionOverlay } from "../../Transition/transition";
import { useGsap } from "../../lib/useGsap";
import { INTRO_DELAY } from "../../lib/intro";

export default function ExperienceList() {
  useEffect(() => {
    document.body.classList.add("__dark-mode");
    return () => document.body.classList.remove("__dark-mode");
  }, []);

  useGsap(() => {
    document
      .querySelectorAll<HTMLElement>(".__exp-row")
      .forEach((row, i) => {
        gsap.from(row, {
          yPercent: 40,
          opacity: 0,
          duration: 0.8,
          delay: INTRO_DELAY + i * 0.1,
          ease: "power3.out",
        });
      });
  }, []);

  return (
    <TransitionOverlay>
      <section className="__section-padding min-h-[100dvh]">
        <p className="__mono-label">[ index — all experience ]</p>
        <h1 className="inline-block pb-1 overflow-hidden __section-title">
          Experience
        </h1>
        <div className="mt-8">
          {experienceInfos.map((exp, indx) => (
            <Link
              to={`/experience/${exp.to}`}
              key={exp.to}
              className={`__exp-row group flex items-baseline justify-between gap-6 border-t py-8 px-2 transition-[padding] duration-300 hover:px-6 ${
                indx === experienceInfos.length - 1 ? "border-b" : ""
              }`}
              style={{ borderColor: "var(--text-color)" }}
            >
              <span className="font-mono text-sm opacity-60">
                {String(indx + 1).padStart(2, "0")}
              </span>
              <span className="font-display text-3xl lg:text-5xl xl:text-6xl grow uppercase tracking-tight">
                {exp.company}
              </span>
              <div className="text-right shrink-0">
                <p className="font-mono text-xs uppercase tracking-widest opacity-60">
                  {exp.role}
                </p>
                <p className="__mono-label mt-1">
                  {exp.startDate} — {exp.endDate}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </TransitionOverlay>
  );
}
