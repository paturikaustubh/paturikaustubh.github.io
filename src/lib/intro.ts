/** Shared page-enter timing.
 *
 *  The transition curtain starts lifting at CURTAIN_DELAY and takes
 *  CURTAIN_DURATION to clear. Page animations must not start until the
 *  curtain has traveled ~40% of its path (≈50% of its duration with the
 *  ease-in-out curve), so nothing plays hidden behind it and the main
 *  thread isn't animating everything at once.
 */
export const CURTAIN_DELAY = 0.45;
export const CURTAIN_DURATION = 0.9;

/** Seconds after page mount when entry animations may begin.
 *  Updated per-transition by TransitionOverlay so page animations always wait
 *  for the curtain to actually start lifting (curtain delay is dynamic). */
export let INTRO_DELAY = CURTAIN_DELAY + CURTAIN_DURATION * 0.5; // default 0.9s
export const setIntroDelay = (d: number) => { INTRO_DELAY = d; };

/** Milliseconds until the curtain has fully left the viewport. */
export const CURTAIN_DONE_MS = (CURTAIN_DELAY + CURTAIN_DURATION) * 1000;
