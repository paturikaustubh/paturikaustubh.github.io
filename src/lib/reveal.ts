import { gsap } from "gsap";
import SplitType from "split-type";
import { prefersReducedMotion } from "./device";

const splits = new WeakMap<HTMLElement, SplitType>();

function freshSplit(el: HTMLElement, types: "chars,lines" | "words"): SplitType {
  splits.get(el)?.revert();
  const split = new SplitType(el, { types });
  splits.set(el, split);
  return split;
}

/** Per-char mask reveal (chars rise from below an overflow-hidden line). */
export function revealChars(
  target: Element,
  vars: gsap.TweenVars = {},
): gsap.core.Tween {
  if (prefersReducedMotion())
    return gsap.from(target, { opacity: 0, duration: 0.5 });
  const { chars } = freshSplit(target as HTMLElement, "chars,lines");
  (target as HTMLElement)
    .querySelectorAll(".line")
    .forEach((line) => ((line as HTMLElement).style.overflow = "hidden"));
  return gsap.from(chars, {
    yPercent: 115,
    stagger: 0.025,
    duration: 0.9,
    ease: "power4.out",
    ...vars,
  });
}

/** Word-by-word opacity scrub tied to scroll. */
export function scrubWords(
  target: Element,
  trigger: Element = target,
): gsap.core.Tween {
  if (prefersReducedMotion())
    return gsap.from(target, { opacity: 0, duration: 0.5 });
  const { words } = freshSplit(target as HTMLElement, "words");
  return gsap.from(words, {
    opacity: 0.08,
    stagger: 0.04,
    scrollTrigger: {
      trigger,
      scrub: 1,
      start: "top 85%",
      end: "bottom 55%",
    },
  });
}
