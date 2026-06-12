import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ProjectDetailsType } from "../../ProjectsInfos";
import { useGsap } from "../../lib/useGsap";
import { INTRO_DELAY } from "../../lib/intro";

export default function WorkList({
  items,
  linkPrefix = "/projects",
}: {
  items: ProjectDetailsType[];
  linkPrefix?: string;
}) {
  const [active, setActive] = useState(0);
  const [hovering, setHovering] = useState(false);
  const followerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // GSAP scroll-reveal animations only — no mousemove here because
  // gsap.Context.add(fn) does NOT treat the returned function as a cleanup;
  // cleanup only runs from what gsap.context(setup) returns, and useGsap's
  // setup type is (ctx) => void with no return path. mousemove lifecycle is
  // handled in a separate useEffect below.
  useGsap(() => {
    const vh = window.innerHeight;
    gsap.utils
      .toArray<HTMLElement>(".__work-row", listRef.current)
      .forEach((row, i) => {
        if (row.getBoundingClientRect().top < vh * 0.88) {
          // already in view at page-enter: wait for the curtain, then cascade
          gsap.from(row, {
            yPercent: 40,
            opacity: 0,
            duration: 0.8,
            delay: INTRO_DELAY + i * 0.08,
            ease: "power3.out",
          });
        } else {
          gsap.from(row, {
            yPercent: 40,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: row, start: "top 88%" },
          });
        }
      });
  }, []);

  // mousemove quickTo — plain useEffect for correct cleanup on unmount
  useEffect(() => {
    const follower = followerRef.current;
    const list = listRef.current;
    if (!follower || !list) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    gsap.set(follower, { xPercent: -50, yPercent: -50 });
    const xTo = gsap.quickTo(follower, "x", { duration: 0.55, ease: "power3" });
    const yTo = gsap.quickTo(follower, "y", { duration: 0.55, ease: "power3" });
    const move = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };
    list.addEventListener("mousemove", move);
    return () => {
      list.removeEventListener("mousemove", move);
      xTo.tween.kill();
      yTo.tween.kill();
    };
  }, []);

  return (
    <div ref={listRef} className="relative">
      {/* image follower — desktop only */}
      <div
        ref={followerRef}
        className="fixed top-0 left-0 z-0 hidden lg:block w-[32rem] pointer-events-none overflow-hidden rounded-xl"
        style={{
          height: hovering ? "17rem" : "0rem",
          filter: "brightness(65%) contrast(0.95)",
          transition: "height 500ms cubic-bezier(0.76, 0, 0.24, 1)",
        }}
      >
        {items.map(({ img, title }) => (
          <img
            key={img}
            src={`/assets/projects/${img}/logo.png`}
            alt={title}
            loading="lazy"
            className="h-[17rem] w-full object-cover"
            style={{
              transform: `translateY(${active * -100}%)`,
              transition: "transform 700ms cubic-bezier(0.19, 1, 0.22, 1)",
            }}
          />
        ))}
      </div>

      {/* desktop rows */}
      <div className="hidden lg:block">
        {items.map(({ title, to }, indx) => (
          <Link
            to={`${linkPrefix}/${to}`}
            key={to}
            className={`__work-row group relative z-[1] flex items-baseline gap-8 border-t py-10 px-2 transition-[padding] duration-300 hover:px-6 ${
              indx === items.length - 1 ? "border-b" : ""
            }`}
            style={{ borderColor: "var(--text-color)" }}
            onMouseEnter={() => {
              setActive(indx);
              setHovering(true);
            }}
            onMouseLeave={() => setHovering(false)}
          >
            <span className="font-mono text-sm opacity-60 mix-blend-difference">
              {String(indx + 1).padStart(2, "0")}
            </span>
            <span
              className={`font-display text-5xl xl:text-6xl grow mix-blend-difference transition-[opacity,transform] duration-300 group-hover:translate-x-3 ${
                hovering && indx !== active ? "opacity-30" : "opacity-100"
              }`}
            >
              {title}
            </span>
            <span className="font-mono text-2xl opacity-0 -translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 mix-blend-difference">
              ⟶
            </span>
          </Link>
        ))}
      </div>

      {/* mobile / tablet grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:hidden">
        {items.map(({ title, img, to }) => (
          <Link
            to={`${linkPrefix}/${to}`}
            className="__work-row flex flex-col gap-3"
            key={to}
          >
            <div className="w-full overflow-hidden rounded-xl">
              <img
                src={`/assets/projects/${img}/logo.png`}
                alt={title}
                loading="lazy"
                className="w-full"
              />
            </div>
            <span className="flex items-center gap-2 font-display text-2xl">
              {title}
              <span className="text-lg material-symbols-outlined">
                open_in_new
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
