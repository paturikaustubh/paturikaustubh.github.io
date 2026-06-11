import { useEffect, type DependencyList } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** gsap.context wrapper with automatic cleanup. All tweens/ScrollTriggers
 *  created inside `setup` are reverted on unmount.
 *  Pass a stable setup (module fn or useCallback) or include it in deps. */
export function useGsap(
  setup: (ctx: gsap.Context) => void,
  deps: DependencyList = [],
) {
  useEffect(() => {
    const ctx = gsap.context(setup);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
