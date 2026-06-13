import { Link, useParams } from "react-router-dom";
import "../Projects/detailsStyles.css";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ExperienceType, experienceInfos } from "../../ExperienceInfos";
import { TransitionOverlay } from "../../Transition/transition";
import { useGsap } from "../../lib/useGsap";
import { revealChars } from "../../lib/reveal";
import { INTRO_DELAY } from "../../lib/intro";

const MONTHS: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

function getDuration(exp: ExperienceType): string {
  try {
    const [sm, sy] = exp.startDate.split(" ");
    const end =
      exp.endDate === "Present"
        ? new Date()
        : new Date(
            Number(exp.endDate.split(" ")[1]),
            MONTHS[exp.endDate.split(" ")[0]],
          );
    const start = new Date(Number(sy), MONTHS[sm]);
    const diff =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());
    if (diff >= 12) {
      const yrs = Math.floor(diff / 12);
      const mos = diff % 12;
      return mos > 0 ? `${yrs} yr ${mos} mo` : `${yrs} yr`;
    }
    return `${diff} mo`;
  } catch {
    return "—";
  }
}

const EMPTY: ExperienceType = {
  company: "",
  role: "",
  type: "full-time",
  startDate: "",
  endDate: "",
  location: "",
  summary: "",
  pullQuote: "",
  highlights: [],
  stack: [],
  to: "",
};

export default function ExperienceDetails() {
  const { name } = useParams();
  const [exp, setExp] = useState<ExperienceType>(EMPTY);
  const [expIndx, setExpIndx] = useState(0);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const nextExp =
    experienceInfos[(expIndx + 1) % experienceInfos.length];
  const prevExp =
    experienceInfos[
      expIndx - 1 < 0 ? experienceInfos.length - 1 : expIndx - 1
    ];

  useEffect(() => {
    document.body.classList.add("__dark-mode");
    return () => document.body.classList.remove("__dark-mode");
  }, []);

  // Reset scroll BEFORE useGsap runs so getBoundingClientRect measurements
  // reflect a fresh page, not the scroll position carried from the previous route.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useLayoutEffect(() => {
    const match = experienceInfos.find((e) => e.to === name);
    if (match) {
      setExp(match);
      setExpIndx(experienceInfos.indexOf(match));
    }
  }, [name]);

  useGsap(() => {
    if (titleRef.current && exp.role)
      revealChars(titleRef.current, { delay: INTRO_DELAY });
    gsap.from(".__exp-meta-cell", {
      opacity: 0,
      y: 14,
      duration: 0.6,
      delay: INTRO_DELAY + 0.45,
      stagger: 0.06,
      ease: "power2.out",
    });
    // scroll-triggered reveals for content below the fold
    document.querySelectorAll<HTMLElement>(".__highlight-block").forEach((block) => {
      gsap.from(block, {
        opacity: 0,
        y: 28,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: { trigger: block, start: "top 85%" },
      });
    });
  }, [exp.role]);

  const caseNumber = String(expIndx + 1).padStart(2, "0");
  const caseTotal = String(experienceInfos.length).padStart(2, "0");

  return (
    <TransitionOverlay>
      <section className="min-h-[100dvh] __section-padding overflow-hidden">
        {/* header */}
        <p className="__mono-label __exp-meta-cell">
          [ {exp.company} — {caseNumber} / {caseTotal} ]
        </p>
        <h1
          ref={titleRef}
          className="font-display font-[800] uppercase leading-[0.95] tracking-tight text-[clamp(2rem,7dvw,7rem)] overflow-hidden __cursor-blend"
        >
          {exp.role}
        </h1>

        {/* meta strip */}
        <div className="grid grid-cols-2 mt-8 border-y md:grid-cols-4 border-[#3a332b] divide-x divide-[#3a332b] __exp-meta-cell">
          <div className="px-4 py-3 font-mono text-xs tracking-widest uppercase opacity-70">
            {exp.company}
          </div>
          <div className="px-4 py-3 font-mono text-xs tracking-widest uppercase opacity-70">
            {exp.type}
          </div>
          <div className="px-4 py-3 font-mono text-xs tracking-widest uppercase opacity-70">
            {exp.location}
          </div>
          <div className="px-4 py-3 font-mono text-xs tracking-widest uppercase opacity-70">
            {getDuration(exp)}
            {exp.current && (
              <span style={{ color: "var(--accent-color)" }}> · Current</span>
            )}
          </div>
        </div>

        {/* pull quote */}
        <blockquote
          className="mt-12 font-serif italic text-2xl lg:text-3xl leading-snug opacity-80 border-l-4 pl-6 lg:pl-8 max-w-4xl __exp-meta-cell"
          style={{ borderColor: "var(--accent-color)" }}
        >
          ❝ {exp.pullQuote} ❞
        </blockquote>

        {/* tech stack chips */}
        {exp.stack.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2 __exp-meta-cell">
            {exp.stack.map((s) => (
              <span
                key={s}
                className="font-mono text-xs uppercase tracking-widest border border-[#3a332b] px-3 py-1 rounded-sm"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        {/* highlights */}
        <div className="mt-14">
          <p className="__mono-label mb-6">( key work )</p>
          {exp.highlights.map((h, i) => (
            <div key={i} className="__highlight-block border-t border-[#3a332b] py-8">
              <h3 className="font-display font-[700] text-xl lg:text-2xl uppercase tracking-tight mb-4">
                {h.title}
              </h3>
              <p className="text-base lg:text-lg font-[350] leading-relaxed max-w-3xl opacity-80">
                {h.detail}
              </p>
            </div>
          ))}
          <div className="border-t border-[#3a332b]" />
        </div>

        {/* prev / next experience navigation */}
        <div className="mt-20 border-t border-[#3a332b] pt-8 flex flex-col sm:flex-row items-start justify-between gap-8">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-xs uppercase tracking-widest opacity-60">Previous experience</span>
            <Link
              to={`/experience/${prevExp.to}`}
              className="text-3xl lg:text-5xl font-display font-[800] uppercase leading-none transition-colors duration-300 hover:text-[color:var(--accent-color)] __cursor-difference"
              id="prev-experience-link"
            >
              {prevExp.company}
            </Link>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <span className="font-mono text-xs uppercase tracking-widest opacity-60">Next experience</span>
            <Link
              to={`/experience/${nextExp.to}`}
              className="text-3xl lg:text-5xl font-display font-[800] uppercase leading-none transition-colors duration-300 hover:text-[color:var(--accent-color)] __cursor-difference"
              id="next-experience-link"
            >
              {nextExp.company}
            </Link>
          </div>
        </div>

      </section>
    </TransitionOverlay>
  );
}
