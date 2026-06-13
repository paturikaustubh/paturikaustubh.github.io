import { Link, useParams } from "react-router-dom";
import { useLayoutEffect, useRef, useState } from "react";
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
          className="mt-12 font-serif italic text-2xl lg:text-3xl leading-snug text-[#d4c5b5] border-l-4 pl-6 lg:pl-8 max-w-4xl __exp-meta-cell"
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
            <div key={i} className="border-t border-[#3a332b] py-8">
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

        {/* next experience */}
        <Link
          to={`/experience/${nextExp.to}`}
          id="next-experience-link"
          className="__next-case group block mt-20 border-t border-[#3a332b] pt-10 pb-6 __cursor-difference"
        >
          <p className="__mono-label mb-4">( next up )</p>
          <span className="__next-case-title font-display font-[800] uppercase leading-[0.95] tracking-tight text-[clamp(2.4rem,8dvw,8rem)]">
            {nextExp.company}
          </span>
          <span className="block mt-4 font-mono text-sm uppercase tracking-widest opacity-0 -translate-x-3 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
            open case ⟶
          </span>
        </Link>

        {/* prev link — visually hidden, used by console */}
        <Link
          to={`/experience/${prevExp.to}`}
          id="prev-experience-link"
          className="sr-only"
        >
          prev: {prevExp.company}
        </Link>
      </section>
    </TransitionOverlay>
  );
}
