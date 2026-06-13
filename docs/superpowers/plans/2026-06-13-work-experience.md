# Work Experience Feature — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Work Experience section (landing timeline, `/experience` index, `/experience/:name` details) to the redesign/hybrid-editorial branch, using resume data for Kaustubh Paturi's two roles at Centific and Veratroniks.

**Architecture:** Static TypeScript data file (`ExperienceInfos.ts`) mirrors the existing `ProjectsInfos.ts` pattern. Three new components (landing strip, index page, details page) follow the established app patterns: `TransitionOverlay`, `useGsap`, `revealChars`, `INTRO_DELAY`, `__theme-change-dark`. No new dependencies.

**Tech Stack:** React 18, TypeScript, Tailwind 3, GSAP 3 (`useGsap` + `revealChars` + `ScrollTrigger`), framer-motion (via `TransitionOverlay`), react-router-dom. Branch: `redesign/hybrid-editorial`.

---

## File Map

| Action | File |
|---|---|
| **Create** | `src/ExperienceInfos.ts` |
| **Create** | `src/components/Experience/Experience.tsx` |
| **Create** | `src/Pages/Experience/ExperienceList.tsx` |
| **Create** | `src/Pages/Experience/ExperienceDetails.tsx` |
| **Modify** | `src/AnimatedRoutes.tsx` |
| **Modify** | `src/Pages/Hero/Hero.tsx` |
| **Modify** | `src/components/Navbar/Navbar.tsx` |
| **Modify** | `src/Transition/transition.tsx` |
| **Modify** | `src/components/HeroProjects/HeroProjects.tsx` |
| **Modify** | `src/components/Console/commands.ts` |
| **Modify** | `src/components/Console/useConsole.ts` |

---

### Task 1: ExperienceInfos.ts — data file

**Files:**
- Create: `src/ExperienceInfos.ts`

- [ ] **Step 1:** Create `src/ExperienceInfos.ts` with this exact content:

```ts
export interface ExperienceType {
  readonly company: string;
  readonly role: string;
  readonly type: "full-time" | "contract" | "internship" | "freelance";
  readonly startDate: string;
  readonly endDate: string;
  readonly location: string;
  readonly summary: string;
  readonly pullQuote: string;
  readonly highlights: {
    readonly title: string;
    readonly detail: string;
  }[];
  readonly stack: string[];
  readonly to: string;
  readonly current?: boolean;
}

export const experienceInfos: ExperienceType[] = [
  {
    company: "Centific",
    role: "Associate Software Engineer",
    type: "full-time",
    startDate: "Apr 2024",
    endDate: "Present",
    location: "Hyderabad, India",
    current: true,
    summary:
      "Spearheading Agentic AI Architectures and Cloud-Native Modernization. Driving adoption of LLM Ops and high-performance computing strategies.",
    pullQuote:
      "Spearheading next-gen Agentic AI Architectures that translate ambiguous challenges into production-grade systems delivering real-world value.",
    highlights: [
      {
        title: "Multimodal GenAI & LLM Ops",
        detail:
          "Engineered a High-Throughput Synthetic Data Generation (SDG) engine orchestrating Vision-Language Models (VLMs). Orchestrated distributed model inference and deployment on RunPod Serverless GPU infrastructure to generate structured neuro-symbolic datasets (ndjson) via scalable Image-to-Image / Text-to-Image synthesis.",
      },
      {
        title: "RLHF & Data Flywheels",
        detail:
          "Designed Automated HITL (Human-in-the-Loop) pipelines for Model Red-teaming and Adversarial Jailbreak robustness. Built an event-driven orchestrator to synchronize Label Studio and OneForma, enabling self-service RLHF data acquisition for SFT (Supervised Fine-Tuning).",
      },
      {
        title: "RAG & Semantic Intelligence",
        detail:
          "Developed a Context-Aware RAG system for Meeting Intelligence, utilizing Vector Embeddings and LLM orchestration to synthesize transcripts into actionable Minutes of Meeting (MoM). Authored internal Python SDKs to abstract complex inference logic, reducing developer friction.",
      },
      {
        title: "Cloud Modernization & Governance",
        detail:
          "Architected a Multi-Tenant Migration Platform (ASP.NET Core, Angular) facilitating Lift-and-Shift transformations. Embedded Policy-as-Code for SecOps compliance and real-time FinOps observability.",
      },
    ],
    stack: [
      "LangChain",
      "LangGraph",
      "RunPod",
      "Python",
      "AWS Lambda",
      "ASP.NET Core",
      "Angular",
      "Vector DBs",
    ],
    to: "centific",
  },
  {
    company: "Veratroniks",
    role: "Software Developer",
    type: "full-time",
    startDate: "Jul 2023",
    endDate: "Mar 2024",
    location: "Hyderabad, India",
    current: false,
    summary:
      "Solely architected and deployed VBOSS (Veratroniks Back Office Support System), an end-to-end ERP suite, leading the company's digital transformation.",
    pullQuote:
      "Solely architected and deployed an end-to-end ERP suite that became the backbone of daily operations — translating chaotic paper workflows into a robust, user-centric digital system.",
    highlights: [
      {
        title: "Paper-to-Digital Evolution",
        detail:
          "Systematized chaotic manual workflows (paper/Excel) into a fully automated project lifecycle tracker. Engineered the entire stack (React, Express, MySQL) to manage complex procurement and project timelines, eliminating operational bottlenecks.",
      },
      {
        title: "Air-Gapped Intranet Deployment",
        detail:
          "Designed and deployed a secure, local-first infrastructure on the company's internal network. Optimized for zero-latency performance in an offline environment, handling all DevOps responsibilities from server configuration to database maintenance.",
      },
      {
        title: "Solo-Developer Ownership",
        detail:
          "Owned the complete Software Development Lifecycle (SDLC), translating raw business requirements into a robust, user-centric interface that became the backbone of daily operations.",
      },
    ],
    stack: ["React", "Node.js", "Express", "MySQL", "CSS3"],
    to: "veratroniks",
  },
];
```

- [ ] **Step 2:** Run `npm run build` — Expected: `✓ built` (no type errors).
- [ ] **Step 3:** Commit:
```bash
git add src/ExperienceInfos.ts
git commit -m "feat: ExperienceInfos data (Centific, Veratroniks)"
```

---

### Task 2: Landing section component

**Files:**
- Create: `src/components/Experience/Experience.tsx`

- [ ] **Step 1:** Create `src/components/Experience/Experience.tsx`:

```tsx
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
```

- [ ] **Step 2:** Run `npm run build` — Expected: `✓ built`.
- [ ] **Step 3:** Commit:
```bash
git add src/components/Experience/Experience.tsx
git commit -m "feat: Experience landing section (vertical timeline)"
```

---

### Task 3: Experience index page

**Files:**
- Create: `src/Pages/Experience/ExperienceList.tsx`

- [ ] **Step 1:** Create `src/Pages/Experience/ExperienceList.tsx`:

```tsx
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { experienceInfos } from "../../ExperienceInfos";
import { TransitionOverlay } from "../../Transition/transition";
import { useGsap } from "../../lib/useGsap";
import { INTRO_DELAY } from "../../lib/intro";

export default function ExperienceList() {
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
```

- [ ] **Step 2:** Run `npm run build` — Expected: `✓ built`.
- [ ] **Step 3:** Commit:
```bash
git add src/Pages/Experience/ExperienceList.tsx
git commit -m "feat: Experience index page (/experience)"
```

---

### Task 4: Experience details page

**Files:**
- Create: `src/Pages/Experience/ExperienceDetails.tsx`

- [ ] **Step 1:** Create `src/Pages/Experience/ExperienceDetails.tsx`:

```tsx
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
        <blockquote className="mt-12 font-serif italic text-2xl lg:text-3xl leading-snug text-[#d4c5b5] border-l-4 pl-6 lg:pl-8 max-w-4xl __exp-meta-cell" style={{ borderColor: "var(--accent-color)" }}>
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

        {/* highlights — all bullets, full detail */}
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

        {/* next experience — giant link */}
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
```

- [ ] **Step 2:** Run `npm run build` — Expected: `✓ built`.
- [ ] **Step 3:** Commit:
```bash
git add src/Pages/Experience/ExperienceDetails.tsx
git commit -m "feat: Experience details page (magazine pull-quote)"
```

---

### Task 5: Wire routes, navbar, hero order, transition, mono label, console

**Files:**
- Modify: `src/AnimatedRoutes.tsx`
- Modify: `src/Pages/Hero/Hero.tsx`
- Modify: `src/components/Navbar/Navbar.tsx`
- Modify: `src/Transition/transition.tsx`
- Modify: `src/components/HeroProjects/HeroProjects.tsx`
- Modify: `src/components/Console/commands.ts`
- Modify: `src/components/Console/useConsole.ts`

**Step 1 — AnimatedRoutes.tsx:** Read the file. Add two imports and two routes.

Add after `import MoreAboutMe`:
```tsx
import ExperienceList from "./Pages/Experience/ExperienceList";
import ExperienceDetails from "./Pages/Experience/ExperienceDetails";
```

Add to the `paths` array before the `portfolio/*` redirect:
```tsx
{
  path: "/experience",
  element: <ExperienceList />,
},
{
  path: "/experience/:name",
  element: <ExperienceDetails />,
},
```

**Step 2 — Hero.tsx:** Read the file. Add Experience import and component between Skills and Projects:

Add import:
```tsx
import Experience from "../../components/Experience/Experience";
```

In the JSX (the `<>` fragment), change:
```tsx
<Skills />
<Projects />
```
to:
```tsx
<Skills />
<Experience />
<Projects />
```

**Step 3 — Navbar.tsx:** Read the file. In `menuLinks`, add after the Home entry (`{ to: "", title: "Home", id: "nav-home" }`):
```tsx
{
  to: "experience",
  title: "Experience",
  id: "nav-experience",
},
```

**Step 4 — Transition/transition.tsx:** Read the file. In `nameDisplayNameMapper`, add:
```tsx
experience: "Experience",
```
(It already has `projects: "Personal Projects"` from the rename commit — add `experience` alongside it.)

**Step 5 — HeroProjects.tsx:** Read the file. Change the mono label from `[ 03 — selected work ]` to `[ 04 — selected work ]`.

**Step 6 — Console/commands.ts:** Read the file. In `pageLs["root"]`:

a) In the `"/"` array, add after the `projects.sh` entry:
```ts
{
  name: "experience.sh",
  type: "file" as const,
  scrollId: "experience",
},
{
  name: "experience",
  type: "dir" as const,
  path: "/experience",
},
```

b) Add two new keys to `pageLs["root"]` (alongside `/projects` and `/more-about-me`):
```ts
"/experience": experienceInfos.map((exp) => ({
  name: exp.company.toLowerCase().replace(/\s+/g, "-"),
  type: "dir" as const,
  path: `/experience/${exp.to}`,
})),
"/experience/:name": [
  {
    name: "previous-experience.sh",
    type: "file" as const,
    clickSelector: "#prev-experience-link",
  },
  {
    name: "next-experience.sh",
    type: "file" as const,
    clickSelector: "#next-experience-link",
  },
],
```

c) Add this import at the top of commands.ts (alongside the existing `projectsInfos` import):
```ts
import { experienceInfos } from "../../ExperienceInfos";
```

d) Update the `pageLs` type annotation to include the new keys:
```ts
export const pageLs: {
  "root": {
    "/": (LsFileEntry | LsDirEntry)[];
    "/projects": LsDirEntry[];
    "/projects/:name": LsFileEntry[];
    "/more-about-me": LsFileEntry[];
    "/experience": LsDirEntry[];
    "/experience/:name": LsFileEntry[];
  };
}
```

**Step 7 — useConsole.ts:** Read the file. Find the block that handles `/projects/:name` pattern matching for the `lsCmd`:
```ts
if (!routeContent && currentPath.startsWith("/projects/")) {
  routeContent = pageLs["root"]["/projects/:name"];
}
```
Add similar handling directly after it:
```ts
if (!routeContent && currentPath.startsWith("/experience/")) {
  routeContent = pageLs["root"]["/experience/:name"];
}
```

**Step 8:** Run `npm run lint` — fix any import order warnings. Then run `npm run build` — Expected: `✓ built` with no type errors.

**Step 9:** Commit:
```bash
git add src/AnimatedRoutes.tsx src/Pages/Hero/Hero.tsx src/components/Navbar/Navbar.tsx src/Transition/transition.tsx src/components/HeroProjects/HeroProjects.tsx src/components/Console/commands.ts src/components/Console/useConsole.ts
git commit -m "feat: wire experience routes, navbar, hero order, console commands"
```

---

## Self-review

**Spec coverage:**
- ✅ `ExperienceInfos.ts` — all resume data (Task 1)
- ✅ Landing section (`id="experience"`, mono label `[ 03 — work experience ]`, vertical timeline) — Task 2
- ✅ Position: between Tech Stack and Personal Projects — Task 5 Step 2
- ✅ Index page `/experience` — Task 3
- ✅ Details page `/experience/:name` (pull quote, meta strip, stack chips, all highlights, next/prev links) — Task 4
- ✅ Navbar "Experience" link — Task 5 Step 3
- ✅ Routes — Task 5 Step 1
- ✅ Transition mapper — Task 5 Step 4
- ✅ Personal Projects mono label renumbered `03→04` — Task 5 Step 5
- ✅ Console `.sh` entries — Task 5 Steps 6–7
- ✅ `#prev-experience-link` / `#next-experience-link` IDs — Task 4

**Placeholder scan:** All steps have concrete code. No TBDs.

**Type consistency:** `ExperienceType` defined in Task 1, imported in Tasks 2–4 and Task 5 Step 6. `getDuration(exp: ExperienceType)` uses the same type. `EMPTY` constant satisfies all required fields.
