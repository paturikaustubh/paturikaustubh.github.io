# Portfolio Polish Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 9 visual/UX issues on the `redesign/hybrid-editorial` branch: project-details outline title, hero name color swap, accent-color button system, work-list image opacity, particle self-motion, horizontal page transition, letter-morph animation, footer connector dots + cursor, and console icon/terminal polish.

**Architecture:** Pure presentation-layer fixes across 8 files. No new dependencies, no routing or data changes. Every task is independent enough to commit on its own. Build and lint must stay green after every commit.

**Tech Stack:** React 18, TypeScript, Tailwind 3, GSAP 3, Framer Motion 11, Three.js 0.165, CSS (postcss-nesting). Branch: `redesign/hybrid-editorial`.

---

## File Map

| Task | Files touched |
|------|--------------|
| 1 | `src/Pages/Projects/detailsStyles.css` |
| 2 | `src/components/Name/Name.tsx`, `src/components/Name/styles.css` |
| 3 | `src/index.css` |
| 4 | `src/components/WorkList/WorkList.tsx` |
| 5 | `src/components/Three/HeroScene.tsx` |
| 6+7 | `src/Transition/transition.tsx` |
| 8 | `src/components/Footer/styles.css`, `src/components/Footer/Footer.tsx`, `src/components/Cursor/Cursor.tsx` |
| 9 | `src/components/Console/style.css`, `src/components/Console/Console.tsx` |

---

### Task 1: Fix "Next Up" title (remove outline, solid fill by default)

**Files:**
- Modify: `src/Pages/Projects/detailsStyles.css`

The `.__next-case-title` currently shows `color: transparent` + `-webkit-text-stroke` (hollow outline) by default. It only fills on hover. User wants it solid by default, accent on hover.

- [ ] **Step 1:** In `src/Pages/Projects/detailsStyles.css`, replace the `.__next-case-title` block:

```css
/* next-case title: solid by default, accent fill on hover */
.__next-case-title {
  color: var(--text-color);
  -webkit-text-stroke: none;
  transition: color 350ms ease;
  display: inline-block;
  letter-spacing: -0.03em;
}

.__next-case:hover .__next-case-title {
  color: var(--accent-color);
}
```

- [ ] **Step 2:** Run `npm run build` — Expected: `✓ built` with no new errors.
- [ ] **Step 3:** Commit:
```bash
git add src/Pages/Projects/detailsStyles.css
git commit -m "fix: next-up title solid text, accent on hover"
```

---

### Task 2: Hero name — KAUSTUBH in accent, PATURI in text color

**Files:**
- Modify: `src/components/Name/Name.tsx`
- Modify: `src/components/Name/styles.css`

Currently KAUSTUBH is dark ink, PATURI is accent orange. User wants first name (KAUSTUBH) in accent.

- [ ] **Step 1:** Read current `src/components/Name/Name.tsx` to see exact class on each span (it may be `__name-second` or `__stroke-only` on PATURI). Then update JSX so KAUSTUBH gets `__name-accent` and PATURI is plain:

```tsx
<h1
  id="full-name"
  className="flex flex-col items-center text-center __name-span __animate-full-name __cursor-blend"
>
  <span className="block overflow-hidden __name-accent">KAUSTUBH</span>
  <span className="block overflow-hidden">PATURI</span>
</h1>
```

- [ ] **Step 2:** In `src/components/Name/styles.css`, ensure `.__name-accent` exists and `.__name-second` / `.__stroke-only` are removed:

```css
.__name-span {
  font-family: "Space Grotesk", sans-serif;
  font-weight: 700;
  letter-spacing: -0.03em;
  font-size: clamp(2.8rem, 10.5dvw, 11rem);
  line-height: 0.92;
  text-transform: uppercase;
  white-space: nowrap;
}

.__name-span > span {
  padding-inline: 0.05em;
}

.__name-accent {
  color: var(--accent-color);
}
```

- [ ] **Step 3:** Run `npm run build` — Expected: `✓ built`.
- [ ] **Step 4:** Commit:
```bash
git add src/components/Name/Name.tsx src/components/Name/styles.css
git commit -m "fix: hero first name KAUSTUBH in accent color"
```

---

### Task 3: Consistent accent-color button + link system

**Files:**
- Modify: `src/index.css`

All interactive buttons/links should use accent color for border, hover fill, and active state. The existing `expand-bg` class fills with `var(--text-color)` (dark ink) — change to `var(--accent-color)`. Also update `inst-msg-send` (footer send button).

- [ ] **Step 1:** Read `src/index.css` around the `expand-bg` block (lines ~130–200). Replace the `expand-bg` rules:

```css
.expand-bg {
  border-color: var(--accent-color);
  color: var(--text-color);
  transition:
    color 300ms ease,
    border-radius 300ms ease,
    border-color 300ms ease;
  position: relative;
  z-index: 1;
  overflow: hidden;
}

.expand-bg::after {
  content: "";
  position: absolute;
  inset: 0;
  width: 100%;
  background-color: var(--accent-color);
  transform: translateY(100%);
  z-index: -1;
  transition: transform 0.6s cubic-bezier(0.19, 1, 0.22, 1);
  overflow: hidden;
}

.expand-bg:hover,
.expand-bg:focus {
  color: #efe9e1;
}

.expand-bg:hover::after,
.expand-bg:focus::after {
  transform: translateY(0%);
}
```

- [ ] **Step 2:** Update `inst-msg-send` to use accent color (it's the footer "Send" button, always on dark bg):

```css
.inst-msg-send {
  border-color: var(--accent-color);
  color: var(--accent-color);
  transition:
    color 300ms ease,
    border-radius 300ms ease;
  position: relative;
  z-index: 1;
  overflow: hidden;
}

.inst-msg-send::after {
  content: "";
  position: absolute;
  inset: 0;
  width: 100%;
  background-color: var(--accent-color);
  transform: translateY(100%);
  z-index: -1;
  transition: transform 0.6s cubic-bezier(0.19, 1, 0.22, 1);
}

.inst-msg-send:hover,
.inst-msg-send:focus {
  color: #efe9e1;
}

.inst-msg-send:hover::after,
.inst-msg-send:focus::after {
  transform: translateY(0%);
}
```

- [ ] **Step 3:** Run `npm run build` — Expected: `✓ built`.
- [ ] **Step 4:** Commit:
```bash
git add src/index.css
git commit -m "feat: accent-color button system (expand-bg + inst-msg-send)"
```

---

### Task 4: WorkList hover image — reduce opacity (match dev branch)

**Files:**
- Modify: `src/components/WorkList/WorkList.tsx`

The original dev-branch code applied `filter: brightness(70%)` to the image follower container. Currently no filter is applied. Add it.

- [ ] **Step 1:** In `src/components/WorkList/WorkList.tsx`, find the follower `<div ref={followerRef} ...>` and add `filter` to the inline style:

```tsx
<div
  ref={followerRef}
  className="fixed top-0 left-0 z-0 hidden lg:block w-[32rem] pointer-events-none overflow-hidden rounded-xl"
  style={{
    height: hovering ? "17rem" : "0rem",
    filter: "brightness(65%) contrast(0.95)",
    transition: "height 500ms cubic-bezier(0.76, 0, 0.24, 1)",
  }}
>
```

- [ ] **Step 2:** Run `npm run build` — Expected: `✓ built`.
- [ ] **Step 3:** Commit:
```bash
git add src/components/WorkList/WorkList.tsx
git commit -m "fix: worklist hover image dimmed to 65% brightness"
```

---

### Task 5: Hero particles — add ambient self-motion

**Files:**
- Modify: `src/components/Three/HeroScene.tsx`

Currently dots receive an initial random velocity (`vx`, `vy`) that is immediately dampened by `* 0.97` each tick, eventually coming to a stop. Add a low-amplitude time-based sine drift so each dot always has subtle movement. Each dot gets a unique `phase` and `freq` at init.

- [ ] **Step 1:** Read `src/components/Three/HeroScene.tsx` — specifically the `dots` array initialization and the `tick` function's velocity update section.

- [ ] **Step 2:** Extend the `Dot` type and initialization:

```ts
type Dot = { x: number; y: number; vx: number; vy: number; phase: number; freq: number };
const dots: Dot[] = Array.from({ length: COUNT }, () => ({
  x: Math.random() * W,
  y: Math.random() * H,
  vx: (Math.random() - 0.5) * 0.22,
  vy: (Math.random() - 0.5) * 0.22,
  phase: Math.random() * Math.PI * 2,      // random start offset
  freq: 0.0004 + Math.random() * 0.0003,   // very slow oscillation
}));
```

- [ ] **Step 3:** Add a `time` counter in the `tick` closure (replace direct use of `Date.now` to avoid the 0-second boot problem — just increment a local counter):

At the top of the `useEffect` body, after the `let frame = 0; let running = false;` lines, add:
```ts
let t = 0;
```

Then inside `tick`, at the very start before the particle loop:
```ts
t++;
```

Then inside the particle loop (replacing `d.vx *= 0.97;` section), add the drift nudge **before** velocity damping:

```ts
// ambient sine drift — keeps particles alive without cursor interaction
d.vx += Math.sin(t * d.freq + d.phase) * 0.012;
d.vy += Math.cos(t * d.freq + d.phase + 1.5) * 0.012;
// clamp velocity so drift doesn't accelerate forever
d.vx = Math.max(-0.6, Math.min(0.6, d.vx));
d.vy = Math.max(-0.6, Math.min(0.6, d.vy));
d.vx *= 0.97;
d.vy *= 0.97;
```

The full particle loop body after the cursor repulsion and before the boundary bounce should look like:

```ts
// ambient sine drift
d.vx += Math.sin(t * d.freq + d.phase) * 0.012;
d.vy += Math.cos(t * d.freq + d.phase + 1.5) * 0.012;
d.vx = Math.max(-0.6, Math.min(0.6, d.vx));
d.vy = Math.max(-0.6, Math.min(0.6, d.vy));
d.vx *= 0.97;
d.vy *= 0.97;
d.x += d.vx;
d.y += d.vy;
// boundary bounce
if (d.x < 0) { d.x = 0; d.vx *= -1; }
if (d.x > W) { d.x = W; d.vx *= -1; }
if (d.y < 0) { d.y = 0; d.vy *= -1; }
if (d.y > H) { d.y = H; d.vy *= -1; }
```

- [ ] **Step 4:** Run `npm run build` — Expected: `✓ built`.
- [ ] **Step 5:** Commit:
```bash
git add src/components/Three/HeroScene.tsx
git commit -m "feat: hero particles have continuous ambient drift"
```

---

### Task 6 + 7: Page transition — horizontal wipe + improved letter morph

**Files:**
- Modify: `src/Transition/transition.tsx`

Two changes in one file: (a) change curtain direction from vertical to horizontal, (b) improve the letter morph so letters compress/scale down then expand up, staggered left→right.

- [ ] **Step 1:** Read `src/Transition/transition.tsx` in full (it has ~170 lines). The key sections are the `curtain` Variants object and the `useLayoutEffect` letter-morph animation.

- [ ] **Step 2:** Replace the `curtain` Variants and the curtain's inline `style` prop to make it slide horizontally. Change `curtain`:

```tsx
const curtain: Variants = {
  initial: { x: "0%", borderRadius: "50dvh / 50%" },
  enter: {
    x: "110%",
    transition: { duration: 0.82, delay: 0.9, ease: EASE },
  },
  exit: {
    x: "0%",
    transition: { duration: 0.6, ease: EASE },
  },
};
```

And change the `motion.div` style (the curtain element):

```tsx
<motion.div
  variants={curtain}
  initial="initial"
  animate="enter"
  exit="exit"
  style={{
    position: "absolute",
    top: 0,
    left: "-5vw",
    height: "100dvh",
    width: "110vw",
    backgroundColor: "#efe9e1",
    borderRadius: "50dvh / 50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    willChange: "transform",
  }}
>
```

- [ ] **Step 3:** In the same file, improve the letter-morph animation inside `useLayoutEffect`. Replace the entire `gsap.timeline` block:

```tsx
const tl = gsap.timeline({ delay: 0.08 });
// old chars: compress down (scaleY 1→0, origin bottom) left-to-right
tl.fromTo(
  oldChars,
  { scaleY: 1, transformOrigin: "center bottom" },
  {
    scaleY: 0,
    opacity: 0,
    duration: 0.38,
    ease: "power2.in",
    stagger: { each: 0.04, from: "start" },
  },
  0,
);
// new chars: expand from top (scaleY 0→1, origin top) left-to-right
tl.fromTo(
  newChars,
  { scaleY: 0, transformOrigin: "center top" },
  {
    scaleY: 1,
    opacity: 1,
    duration: 0.46,
    ease: "power3.out",
    stagger: { each: 0.04, from: "start" },
  },
  0.2,
);
```

Also set the initial state of `__t-new` chars via `gsap.set` before the timeline (so there's no flash):

Add this before `const tl = gsap.timeline`:

```tsx
// ensure new chars start invisible before animation
gsap.set(newChars, { scaleY: 0, transformOrigin: "center top", opacity: 0 });
```

And update `renderChars` — remove the inline style that was doing the initial position; the initial state is now handled by `gsap.set`:

```tsx
const renderChars = (word: string, _hidden: boolean) =>
  word.split("").map((ch, i) => (
    <span key={i} className="__t-ch inline-block">
      {ch === " " ? " " : ch}
    </span>
  ));
```

(The `_hidden` param is kept for signature compatibility but no longer sets inline styles — GSAP handles the initial state.)

- [ ] **Step 4:** Run `npm run build` — Expected: `✓ built`.
- [ ] **Step 5:** Manual smoke test: `npm run dev`, navigate between pages. Curtain should slide horizontally. Letters on the curtain should compress-squeeze down letter by letter, then new name expands up letter by letter.
- [ ] **Step 6:** Commit:
```bash
git add src/Transition/transition.tsx
git commit -m "feat: horizontal curtain wipe + scaleY letter-morph L→R"
```

---

### Task 8: Footer connector dots + cursor in footer

**Files:**
- Modify: `src/components/Footer/styles.css`
- Modify: `src/components/Cursor/Cursor.tsx`

**Problem A:** Connector dots use `var(--text-color)` but the footer is dark (`bg-[#0a0807]`) without `__theme-change-dark` class. The root `--text-color` is dark ink (`#141210`), making the dots invisible (dark on dark). Fix: hardcode connector colors to light in the footer context.

**Problem B:** `applyModes` in Cursor.tsx checks `closest(".__theme-change-dark")` to flip the cursor to light mode. The footer doesn't have that class, so the cursor stays dark ink on the dark footer.

- [ ] **Step 1:** In `src/components/Footer/styles.css`, update the `.connector-circle` and `.circle-ripple` to use hardcoded light values since they only ever exist in the dark footer:

```css
.connector-circle {
  position: relative;
  width: 15px;
  aspect-ratio: 1/1;
  border-radius: 50%;
  background-color: #ede8e0;
  opacity: 0.25;
  filter: blur(4px) brightness(100%);
}

@media (max-width: 768px) {
  .connector-circle {
    width: 12px;
  }
}

.circle-ripple {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background-color: transparent;
  border: 1px solid #ede8e0;
}
```

Also update the keyframes that animate to their revealed state (they reference `filter: brightness(200%)` which is fine). No change needed there.

- [ ] **Step 2:** Read `src/components/Cursor/Cursor.tsx` and find the `applyModes` function. The relevant section is:

```tsx
cursor.classList.toggle(
  "light-mode",
  !!elementUnderCursor?.closest(".__theme-change-dark"),
);
```

Change it to also check for `dark-footer` (a class we'll add to the footer element):

```tsx
cursor.classList.toggle(
  "light-mode",
  !!elementUnderCursor?.closest(".__theme-change-dark") ||
  !!elementUnderCursor?.closest(".dark-footer"),
);
```

- [ ] **Step 3:** Read `src/components/Footer/Footer.tsx` and confirm the footer root element has `dark-footer` in its className. It should already be there (added in a previous task: `className="bg-[#0a0807] ... dark-footer"`). If missing, add `dark-footer` to the footer's className string.

- [ ] **Step 4:** Run `npm run build` — Expected: `✓ built`.
- [ ] **Step 5:** Commit:
```bash
git add src/components/Footer/styles.css src/components/Cursor/Cursor.tsx
git commit -m "fix: footer connector dots light, cursor cream in dark footer"
```

---

### Task 9: Console — modern icon + accent KP banner + terminal polish

**Files:**
- Modify: `src/components/Console/style.css`
- Modify: `src/components/Console/Console.tsx`

**Icon** (`#console-toggle`): currently a large dark circle with a `>_` material icon. Make it cleaner: smaller, accent-bordered, with a subtle glow. **KP Banner**: change from white to accent color. **Terminal header**: modernise with dot indicators.

- [ ] **Step 1:** Replace `#console-toggle` rules in `src/components/Console/style.css`:

```css
#console-toggle {
  visibility: hidden;
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  background-color: #0e0c0a;
  color: var(--accent-color, #c2410c);
  font-size: 0.85em;
  padding: 0.7em;
  border: 1.5px solid var(--accent-color, #c2410c);
  border-radius: 50%;
  z-index: 23;
  cursor: pointer;
  box-shadow: 0 0 14px rgba(194, 65, 12, 0.22), 0 2px 8px rgba(0,0,0,0.45);
  transition: box-shadow 300ms ease, transform 200ms ease;

  span {
    font-size: 2.2em;
    display: block;
  }
}

#console-toggle:hover {
  box-shadow: 0 0 22px rgba(194, 65, 12, 0.45), 0 2px 12px rgba(0,0,0,0.5);
  transform: scale(1.05);
}

@media (min-width: 1024px) {
  #console-toggle {
    visibility: visible;
  }
}

#console-toggle.invisible {
  visibility: hidden;
}
```

- [ ] **Step 2:** Update the `#console` header styling in `style.css` for a more modern look. Find the `.console-header` block and replace:

```css
  .console-header {
    background-color: #1a1815;
    padding: 0.4em 1em;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 1em;
    font-family: "JetBrains Mono", monospace;
    letter-spacing: 0.04em;
    border-bottom: 1px solid #2a2420;

    .actions {
      display: flex;
      gap: 0.6em;
      align-items: center;

      span {
        font-size: 1.1em;
        cursor: pointer;
        opacity: 0.65;
        transition: opacity 200ms;
      }

      span:hover {
        opacity: 1;
      }
    }
  }
```

Also update `border-top` on `#console` from `5px solid #696969` to `2px solid var(--accent-color, #c2410c)`:

```css
#console {
  /* ... keep all existing ... */
  border-top: 2px solid var(--accent-color, #c2410c);
```

- [ ] **Step 3:** In `src/components/Console/Console.tsx`, update the `PKBanner` function to use the accent color:

```tsx
function PKBanner() {
  return (
    <pre
      style={{
        fontSize: "1.2em",
        color: "var(--accent-color, #c2410c)",
        lineHeight: "1.2",
        whiteSpace: "pre",
        marginBottom: "0.75em",
        fontFamily: '"JetBrains Mono", monospace',
      }}
    >
      {String.raw`
██╗  ██╗ ██████╗ 
██║ ██╔╝ ██╔══██╗
█████╔╝  ██████╔╝
██╔═██╗  ██╔═══╝ 
██║ ╚██╗ ██║     
╚═╝  ╚═╝ ╚═╝     
`}
    </pre>
  );
}
```

- [ ] **Step 4:** In `Console.tsx`, update the console-toggle button to use a cleaner icon. Change `"terminal"` (the Material icon) to `"code"` which looks cleaner:

```tsx
<button
  id="console-toggle"
  ref={consoleToggle}
  onClick={toggleTerminalVisible}
  title="Open terminal (Ctrl + `)"
>
  <span className="material-symbols-outlined">code</span>
</button>
```

- [ ] **Step 5:** Run `npm run build` — Expected: `✓ built`.
- [ ] **Step 6:** Run `npm run lint` — Expected: 0 warnings.
- [ ] **Step 7:** Commit:
```bash
git add src/components/Console/style.css src/components/Console/Console.tsx
git commit -m "feat: modern console icon, accent KP banner, terminal header polish"
```

---

### Task 10: Final lint + build verification

**Files:** None (verification only)

- [ ] **Step 1:** Run `npm run lint` — Expected: 0 warnings 0 errors.
- [ ] **Step 2:** Run `npm run build` — Expected: `✓ built`. Check three.js chunk is still lazy (separate `HeroScene-*.js`).
- [ ] **Step 3:** Start `npm run dev`, smoke-test all routes:
  - `/` — hero light, KAUSTUBH orange, network alive, buttons accent-colored
  - `/projects` — dark list page, follower image dimmed
  - `/projects/pyscope` — next-up title solid dark, accent on hover
  - Footer — connector dots visible (light), cursor cream in footer
  - Console — accent icon, orange KP banner, horizontal curtain on nav clicks

---

## Self-review

**Spec coverage:**
1. Next-up outline → Task 1 ✓
2. KAUSTUBH accent color → Task 2 ✓
3. Accent color buttons → Task 3 ✓
4. WorkList image opacity → Task 4 ✓
5. Particle self-motion → Task 5 ✓
6. Transition direction change → Task 6+7 ✓
7. Letter morph compress/expand → Task 6+7 ✓
8. Footer connector dots light + cursor fix → Task 8 ✓
9. Console icon + KP + terminal → Task 9 ✓

**Placeholder scan:** All steps contain concrete code. No TBDs.

**Type consistency:** `Dot` type extended with `phase: number; freq: number` in Task 5 only. `renderChars` signature change in Task 7 (`_hidden` ignored) — no downstream callers reference the param value.
