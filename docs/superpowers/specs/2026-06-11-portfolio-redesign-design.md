# Portfolio Redesign — "Hybrid Editorial" Design Spec

Date: 2026-06-11
Status: Approved by owner (Kaustubh Paturi)

## Goal

Transform the existing portfolio (Vite + React 18 + TS + Tailwind + GSAP + Framer Motion + Lenis) into an awwwards-caliber site: new typography, new layout, page transitions, Three.js interactivity — while staying lightweight, responsive, and unbroken on low-end devices.

## Decisions (locked)

| Topic | Decision |
|---|---|
| Visual direction | Hybrid: light hero ↔ dark rounded sections (refines current identity) |
| Typography | Fraunces (display/titles) + Outfit (body/UI) + JetBrains Mono (labels/meta/console) |
| Three.js | Hero scene + project-image WebGL distortion; auto-disabled on incompatible/low-tier devices |
| Features | Keep all: Firestore tech stack, contact form, Console easter egg — restyle only |
| Approach | Rebuild presentation layer; keep routes, data flow, feature logic |

## 1. Global systems

### Design tokens (index.css)
- Light: `--bg: #F4F1EC` (warm paper), `--ink: #141210`, `--accent: #C2410C` (burnt amber).
- Dark sections: `--bg-dark: #100E0C`, `--ink-dark: #EDE8E0`.
- Existing `__theme-change-dark` light↔dark section mechanic kept, re-tokenized.

### Fonts
- Google Fonts with `preconnect` + `display=swap`, subset weights only:
  - Fraunces: 400, 600 (+ italics, opsz axis)
  - Outfit: 300, 400, 500
  - JetBrains Mono: 400
- Replaces Montserrat/Poppins/Bebas Neue (currently ~36 weights).

### Animation core
- `useGsap` hook wrapping `gsap.context()` with automatic cleanup per component.
- Shared text-reveal utilities (SplitType char/word masks).
- Every tween behind `prefers-reduced-motion` and `gsap.matchMedia` breakpoints.
- Lenis wired to ScrollTrigger: `lenis.on('scroll', ScrollTrigger.update)` + `gsap.ticker`.

### Device tiering
- `getDeviceTier(): 'high' | 'low'` using `navigator.deviceMemory`, `hardwareConcurrency`, WebGL context check, `prefers-reduced-motion`.
- Low tier: no Three.js, no WebGL distortion, simplified reveals (opacity/translate only).

### Page transition
- Curtain sweep with curved SVG edge (gooey bottom curve), page name in Fraunces italic.
- Synced with framer-motion `AnimatePresence mode="wait"` (existing routing kept).

### Custom cursor
- Rewrite movement to `gsap.quickTo` (drop `element.animate` per mousemove).
- Magnetic attraction on buttons/links; blend/difference modes preserved; disabled on touch devices.

## 2. Home page

- **Hero:** Fraunces display name, two stacked lines, per-char mask reveal; JetBrains Mono meta strip ("based in india — application developer — 2026"); lazy-mounted Three.js particle/wave field behind text (DPR ≤ 1.5, paused off-screen, high tier only); scroll hint.
- **About:** dark rounded section; oversized serif pull-quote, word-by-word scrub reveal; mono label `[01 — about]`; "Tell me more" link kept.
- **Tech stack:** Firestore accordion kept; restyled editorial index — mono numbers, serif titles, amber hover fill.
- **Selected work:** hover-image-follow list rebuilt: `gsap.quickTo` image follower (remove scroll + `elementsFromPoint` hacks), serif titles, mono index/meta; WebGL image distortion high tier, plain `<img>` low tier; mobile grid retained.
- **Footer/contact:** same form + socials; dark editorial restyle; big serif headline; marquee name strip.

## 3. Other pages

- **/projects:** full index list, same interaction system as home work list.
- **/projects/:name:** editorial case study — huge serif title, mono meta row (repo/live), hero image with hover distortion (high tier); `loading="lazy"` images; video `preload="none"` + poster + click-to-play (eliminates 30 MB autoplay downloads); prev/next nav kept, restyled.
- **/more-about-me:** keep story + tilt photo; serif editorial column layout with drop caps.
- **404 + Console:** restyled to token system only; logic untouched.

## 4. Performance budget

- Three.js: separate lazy chunk, loaded only on high tier; target total JS ≤ ~350 KB gzip.
- Videos: never autoload; posters required.
- Images: `loading="lazy"` everywhere below the fold; existing asset files not modified.
- No per-frame React state; all listeners cleaned up on unmount.
- Capped DPR on WebGL; scenes paused when off-screen (IntersectionObserver).

## 5. Verification

- `npm run build` and `npm run lint` pass.
- Playwright manual run at 1440 px and 390 px on every route: layout unbroken, animations fire.
- Reduced-motion emulation + forced low tier verified (no WebGL, content fully readable).

## Out of scope

- Re-encoding/compressing existing media assets (flagged separately: sample.mp4 files up to 30 MB).
- Firebase schema or backend changes.
- Resume/social link content changes.
