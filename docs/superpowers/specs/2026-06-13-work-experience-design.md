# Work Experience Feature — Design Spec

Date: 2026-06-13  
Status: Approved by owner (Kaustubh Paturi)  
Branch: `redesign/hybrid-editorial`

---

## Goal

Add a Work Experience feature to the portfolio with three surfaces:
1. **Landing page section** — vertical timeline strip (max 3, dynamic), before Personal Projects
2. **Index page** (`/experience`) — all experiences, each with short summary
3. **Details page** (`/experience/:name`) — magazine pull-quote layout with all resume content

---

## Decisions (locked)

| Topic | Decision |
|---|---|
| Landing layout | Option A — vertical timeline with left spine rule, dark section (`__theme-change-dark`) |
| Details layout | Option C — magazine pull-quote + tags + tech chips + full bullets |
| Position on landing | Inserted between Tech Stack and Personal Projects sections |
| Max entries on landing | 3 (dynamic — shows the 3 most recent; if only 2 exist, shows 2) |
| Data source | Static TypeScript file `src/ExperienceInfos.ts` (same pattern as `ProjectsInfos.ts`) |
| Nav item | Add "Experience" to navbar between Home and Personal Projects |

---

## Data Structure

File: `src/ExperienceInfos.ts`

```ts
export interface ExperienceType {
  readonly company: string;
  readonly role: string;
  readonly type: "full-time" | "contract" | "internship" | "freelance";
  readonly startDate: string;      // "Apr 2024"
  readonly endDate: string;        // "Mar 2024" or "Present"
  readonly location: string;
  readonly summary: string;        // 1–2 sentence summary for landing + index
  readonly pullQuote: string;      // italic big quote on details page
  readonly highlights: {
    title: string;
    detail: string;
  }[];
  readonly stack: string[];
  readonly to: string;             // URL slug: "centific" | "veratroniks"
  readonly current?: boolean;      // true = show "Current" tag
}
```

### Centific entry (full content from resume)
```ts
{
  company: "Centific",
  role: "Associate Software Engineer",
  type: "full-time",
  startDate: "Apr 2024",
  endDate: "Present",
  location: "Hyderabad, India",
  current: true,
  summary: "Spearheading Agentic AI Architectures and Cloud-Native Modernization. Driving adoption of LLM Ops and high-performance computing strategies.",
  pullQuote: "Spearheading next-gen Agentic AI Architectures that translate ambiguous challenges into production-grade systems delivering real-world value.",
  highlights: [
    {
      title: "Multimodal GenAI & LLM Ops",
      detail: "Engineered a High-Throughput Synthetic Data Generation (SDG) engine orchestrating Vision-Language Models (VLMs). Orchestrated distributed model inference and deployment on RunPod Serverless GPU infrastructure to generate structured neuro-symbolic datasets (ndjson) via scalable Image-to-Image / Text-to-Image synthesis."
    },
    {
      title: "RLHF & Data Flywheels",
      detail: "Designed Automated HITL (Human-in-the-Loop) pipelines for Model Red-teaming and Adversarial Jailbreak robustness. Built an event-driven orchestrator to synchronize Label Studio and OneForma, enabling self-service RLHF data acquisition for SFT (Supervised Fine-Tuning)."
    },
    {
      title: "RAG & Semantic Intelligence",
      detail: "Developed a Context-Aware RAG system for Meeting Intelligence, utilizing Vector Embeddings and LLM orchestration to synthesize transcripts into actionable Minutes of Meeting (MoM). Authored internal Python SDKs to abstract complex inference logic, reducing developer friction."
    },
    {
      title: "Cloud Modernization & Governance",
      detail: "Architected a Multi-Tenant Migration Platform (ASP.NET Core, Angular) facilitating Lift-and-Shift transformations. Embedded Policy-as-Code for SecOps compliance and real-time FinOps observability."
    }
  ],
  stack: ["LangChain", "LangGraph", "RunPod", "Python", "AWS Lambda", "ASP.NET Core", "Angular", "Vector DBs"],
  to: "centific"
}
```

### Veratroniks entry (full content from resume)
```ts
{
  company: "Veratroniks",
  role: "Software Developer",
  type: "full-time",
  startDate: "Jul 2023",
  endDate: "Mar 2024",
  location: "Hyderabad, India",
  current: false,
  summary: "Solely architected and deployed VBOSS (Veratroniks Back Office Support System), an end-to-end ERP suite, leading the company's digital transformation from paper to software.",
  pullQuote: "Solely architected and deployed an end-to-end ERP suite that became the backbone of daily operations — translating chaotic paper workflows into a robust, user-centric digital system.",
  highlights: [
    {
      title: "Paper-to-Digital Evolution",
      detail: "Systematized chaotic manual workflows (paper/Excel) into a fully automated project lifecycle tracker. Engineered the entire stack (React, Express, MySQL) to manage complex procurement and project timelines, eliminating operational bottlenecks."
    },
    {
      title: "Air-Gapped Intranet Deployment",
      detail: "Designed and deployed a secure, local-first infrastructure on the company's internal network. Optimized for zero-latency performance in an offline environment, handling all DevOps responsibilities from server configuration to database maintenance."
    },
    {
      title: "Solo-Developer Ownership",
      detail: "Owned the complete Software Development Lifecycle (SDLC), translating raw business requirements into a robust, user-centric interface that became the backbone of daily operations."
    }
  ],
  stack: ["React", "Node.js", "Express", "MySQL", "CSS3"],
  to: "veratroniks"
}
```

---

## Routes

Add to `AnimatedRoutes.tsx`:
- `/experience` → `<ExperienceList />`
- `/experience/:name` → `<ExperienceDetails />`

---

## 1. Landing Page Section (`src/components/Experience/Experience.tsx`)

- Dark section (`__theme-change-dark no-bottom-radius`) — same treatment as skills/about
- Mono label: `[ 04 — work experience ]`
- Section title: "Experience" (Space Grotesk 800 uppercase via `__section-title`)
- Vertical timeline: left border `1px solid #3a332b` spine, `experienceInfos.slice(0, 3)` (most recent first, which is index order)
- Each entry:
  - Mono date range (accent color, `__mono-label`)
  - Role in Space Grotesk 700
  - Company name in Outfit 300 muted
  - One-line summary (`summary` field, truncated to ~80 chars on small screens)
  - Hover: highlight the active entry (dim others), accent left-border color on active dot
- "View all →" pill button linking to `/experience` (uses `expand-bg`)
- GSAP scroll reveal: each entry reveals from `yPercent: 40, opacity: 0` on scroll (same pattern as WorkList rows)
- Section number: update Skills mono label from `[ 02 — tech stack ]` to stay `02`, Experience becomes `03`, Personal Projects becomes `04` (or keep existing numbers — **do not change** existing section numbers; just add Experience with label `[ 04 — work experience ]` and renumber the Personal Projects section to `05`)

Wait — simpler: use `[ 04 — work experience ]` for Experience and `[ 05 — selected work ]` for Personal Projects. Accordion-based sections don't need renumbering. **Update `HeroProjects.tsx` mono label from `[ 03 — selected work ]` to `[ 05 — selected work ]`**, and update `Skills.tsx` from `[ 02 — tech stack ]` to `[ 02 — tech stack ]` (unchanged). Summary stays `[ 01 — about ]`.

Final section order on landing:
1. Name/Hero
2. About (`[ 01 — about ]`)
3. Tech Stack (`[ 02 — tech stack ]`)
4. **Work Experience (`[ 03 — work experience ]`)** ← new
5. Personal Projects (`[ 04 — selected work ]`) ← renumbered from 03

---

## 2. Experience Index Page (`src/Pages/Experience/ExperienceList.tsx`)

- Uses `TransitionOverlay` (curtain shows "Experience")
- Dark full-page section
- Mono label: `[ index — all experience ]`
- H1: "Experience" (section title)
- For each entry: a row like WorkList — company name prominent, role + date range at right, hover expands to show summary
- On click: navigates to `/experience/:to`
- Consistent with PersonalProjects list page pattern
- Transition name mapper: add `experience: "Experience"` to `nameDisplayNameMapper`

---

## 3. Experience Details Page (`src/Pages/Experience/ExperienceDetails.tsx`)

Layout (Option C — magazine pull-quote):

```
[ case — CENTIFIC ]                        [ APR 2024 – PRESENT ]

ASSOCIATE SOFTWARE
ENGINEER                                              ← big title

─────────────────────────────────────────────────────────────────
  role      │  type     │  location    │  duration
─────────────────────────────────────────────────────────────────

❝ Spearheading next-gen Agentic AI Architectures that translate   ❞
  ambiguous challenges into production-grade systems...
                                                         ← italic pull quote, Fraunces

[ stack chips: LangChain · LangGraph · RunPod · ... ]

─── KEY HIGHLIGHTS ──────────────────────────────────────────────

  Multimodal GenAI & LLM Ops
  ────────────────────────────
  Engineered a High-Throughput SDG engine...

  RLHF & Data Flywheels
  ──────────────────────
  Designed Automated HITL pipelines...

  ... (all highlights, full detail text)

─── ( next up ) ─────────────────────────────────────────────────
  VERATRONIKS ⟶                     ← giant next-experience link
```

Components:
- Header: mono company label + dates (same as case study page header pattern)
- H1: role title (Space Grotesk 800)
- Meta strip: 4-cell border grid — role, type, location, duration
- Pull quote: Fraunces italic, big size, left accent border
- Stack chips: mono tags, borderred, inline-flex wrap
- Highlights: each as a section title + paragraph (NOT accordion — all visible), separated by thin rules
- Next/prev experience navigation (giant link, same pattern as project details)
- Entry reveal via `revealChars` on title, GSAP meta fade-in with `INTRO_DELAY`

---

## 4. Navbar update

Add "Experience" link between "Home" and "Personal Projects":
```ts
{ to: "experience", title: "Experience", id: "nav-experience" }
```

---

## 5. Console `.sh` commands

Add to `commands.ts` `pageLs`:
- `/experience`: `experience-list.sh` (scrollId: `"experience"` on landing? No — navigates to `/experience`)
- `/experience/:name`: `previous-experience.sh` (clickSelector: `#prev-experience-link`), `next-experience.sh` (clickSelector: `#next-experience-link`)

---

## 6. Files to create / modify

| Action | File |
|---|---|
| **Create** | `src/ExperienceInfos.ts` |
| **Create** | `src/components/Experience/Experience.tsx` |
| **Create** | `src/Pages/Experience/ExperienceList.tsx` |
| **Create** | `src/Pages/Experience/ExperienceDetails.tsx` |
| **Modify** | `src/AnimatedRoutes.tsx` — add 2 routes |
| **Modify** | `src/Pages/Hero/Hero.tsx` — add Experience between Skills and Projects |
| **Modify** | `src/components/Navbar/Navbar.tsx` — add Experience link |
| **Modify** | `src/Transition/transition.tsx` — add `experience: "Experience"` to mapper |
| **Modify** | `src/components/HeroProjects/HeroProjects.tsx` — update mono label to `[ 04 — selected work ]` |
| **Modify** | `src/components/Console/commands.ts` — add experience `.sh` entries |

---

## Self-review

**Placeholder scan:** All data is fully specified (resume verbatim). No TBDs. Transitions named. IDs for console specified.

**Internal consistency:** Landing uses `experienceInfos.slice(0, 3)` (most recent first = array order). Index and details also use the same array. Section numbers updated consistently.

**Scope:** Single spec, single implementation plan. All pieces (landing, index, details) share one data file and one feature toggle.

**Ambiguity:** "max 3 on landing" — dynamic, not hardcoded. If only 2 entries exist, shows 2. Order = array order (Centific first = most recent).
