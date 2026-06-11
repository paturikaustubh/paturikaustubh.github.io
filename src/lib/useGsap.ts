import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** gsap.context wrapper with automatic cleanup. All tweens/ScrollTriggers
 *  created inside `setup` are reverted on unmount. */
export function useGsap(
  setup: (ctx: gsap.Context) => void,
  deps: unknown[] = [],
) {
  useEffect(() => {
    const ctx = gsap.context(setup);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
