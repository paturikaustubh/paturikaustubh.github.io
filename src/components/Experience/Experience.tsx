import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { experienceInfos } from "../../ExperienceInfos";
import { useGsap } from "../../lib/useGsap";
import { INTRO_DELAY } from "../../lib/intro";

export default function Experience() {
  const recent = experienceInfos.slice(0, 3);

  useGsap(() => {
    const vh = window.innerHeight;
    document
      .querySelectorAll<HTMLElement>(".__exp-entry")
      .forEach((entry, i) => {
        if (entry.getBoundingClientRect().top < vh * 0.88) {
          gsap.from(entry, {
            yPercent: 40,
            opacity: 0,
            duration: 0.8,
            delay: INTRO_DELAY + i * 0.1,
            ease: "power3.out",
          });
        } else {
          gsap.from(entry, {
            yPercent: 40,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: entry, start: "top 88%" },
          });
        }
      });
  }, []);

  return (
    <section
      className="__section-padding __theme-change-dark no-bottom-radius"
      id="experience"
    >
      <p className="__mono-label">[ 03 — work experience ]</p>
      <span className="__cursor-blend">
        <span className="__section-title">Experience</span>
      </span>

      <div className="mt-8 border-l border-[#3a332b] pl-6 lg:pl-8 flex flex-col gap-8">
        {recent.map((exp) => (
          <Link
            key={exp.to}
            to={`/experience/${exp.to}`}
            className="__exp-entry group block __cursor-difference"
          >
            <p className="__mono-label mb-1">
              {exp.startDate} — {exp.endDate}
              {exp.current && (
                <span
                  className="ml-2 border px-1.5 py-0.5 rounded text-[0.6rem]"
                  style={{ borderColor: "var(--accent-color)", color: "var(--accent-color)" }}
                >
                  CURRENT
                </span>
              )}
            </p>
            <p className="font-display font-[700] text-xl lg:text-2xl uppercase tracking-tight group-hover:translate-x-1 transition-transform duration-300">
              {exp.role}
            </p>
            <p className="font-[300] text-sm opacity-60 mt-0.5">{exp.company}</p>
            <p className="text-sm font-[300] opacity-50 mt-1 line-clamp-2 lg:line-clamp-1">
              {exp.summary}
            </p>
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-end w-full mt-8">
        <Link
          to="experience"
          className="px-6 py-2 font-mono text-sm uppercase tracking-widest border rounded-full expand-bg __cursor-difference"
        >
          All experience →
        </Link>
      </div>
    </section>
  );
}
