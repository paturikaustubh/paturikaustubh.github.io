import { useEffect, useRef, useState } from "react";
import { projectsInfos } from "../../ProjectsInfos";
import { TransitionOverlay } from "../../Transition/transition";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

export default function ProjectsList() {
  // ANCHOR STATES && REFS  ||====================||====================
  const [activeProjectIndx, setActiveProjectIndx] = useState(0);
  const [imgScale, setImgScale] = useState(0);
  const [mousePresent, setMousePresent] = useState(false);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const titleRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // ANCHOR FUNCTIONS/METHODS  ||====================||====================


  // ANCHOR EFFECTS  ||====================||====================
  useEffect(() => {
    document.body.classList.add("__dark-mode");
    document.querySelector("nav")?.classList.add("__header-inverted");

    const gsapMatchMedia = gsap.matchMedia();
    let scrollListener: (() => void) | null = null;

    gsapMatchMedia.add("(min-width:1024px)", () => {
      gsap.to(".__slide-right-left", {
        x: "0%",
        ease: "expo.out",
        stagger: 0.2,
        duration: 1,
        delay: 0.5,
      });
      // Get the __custom-cursor element
      // Get all elements with class name "__project-row"
      const projectRows = Array.from(
        document.querySelectorAll(".__project-row")
      );

      scrollListener = () => {
        // This scroll listener mainly handles activating project rows on scroll/details
        // We removed the custom cursor styling logic from here to let Cursor.tsx handle it.
        // BUT - the original logic set activeProjectIndx based on elements active.
        // We need to keep the active index logic but REMOVE direct cursor styling.

        // RE-IMPLEMENTING JUST THE LOGIC TO DETECT ACTIVE ROW, but without touching cursor styles directly 
        // (except maybe z-index if needed for logic, but prefer classes).
        // Actually, looking at original code, it adjusted Z-index and scale.
        // Let's rely on hover classes if possible? 
        // The issue is this is "scrollListener" that acts like a hover on scroll.
        // For now, I will remove the DIRECT style manipulations.
        // If we need the cursor to react to "virtual hover" during scroll, we might need a different approach,
        // but for now, let's strip the conflicting imperative styles.

        const customCursor = document.querySelector(".__custom-cursor");
        if (!customCursor) return;

        const elementsUnderCursor = document.elementsFromPoint(
          customCursor.getBoundingClientRect().x,
          customCursor.getBoundingClientRect().y
        );

        const isHoveringProjectRow = elementsUnderCursor.some((element) => {
          const isPresent = projectRows.includes(element);
          if (isPresent) {
            const parentElement = element.parentNode as ParentNode;
            const children = Array.from(parentElement.children);
            const childIndex = children.indexOf(element);
            setActiveProjectIndx(childIndex - 1);
            setMousePresent(true);
          } else {
            setMousePresent(false);
          }
          return isPresent;
        });

        if (isHoveringProjectRow) {
          setImgScale(1);
          return;
        }
        setImgScale(0);
        return;
      };
      window.addEventListener("scroll", scrollListener);
    });

    gsapMatchMedia.add("(max-width: 1024px)", () => {
      imgRefs.current.forEach((img) => {
        gsap.to(img, {
          x: "0%",
          ease: "power1.out",
        });
      });
      titleRefs.current.forEach((title) => {
        gsap.to(title, {
          x: "0%",
          ease: "power1.out",
          delay: 0.3,
        });
      });
    });


    // const textBlendElements =
    //   document.querySelectorAll<HTMLElement>(".__cursor-blend");
    // Removed direct style manipulation here

    // textBlendElements.forEach((element) => {
    //   element.addEventListener("mouseenter", handleMouseEnter);
    //   element.addEventListener("mouseleave", handleMouseLeave);
    // });

    return () => {
      if (scrollListener) {
        window.removeEventListener("scroll", scrollListener);
      }
      // textBlendElements.forEach((element) => {
      //   element.removeEventListener("mouseenter", handleMouseEnter);
      //   element.removeEventListener("mouseleave", handleMouseLeave);
      // });
      ScrollTrigger.killAll();
      document.querySelector("nav")?.classList.remove("__header-inverted");
    };
  }, [mousePresent]);

  // ANCHOR FUNCTIONS  ||========================================================================


  // ANCHOR JSX  ||====================||====================
  return (
    <TransitionOverlay>
      <>
        <section className="__theme-change-dark __section-padding no-border-radius">
          {/* ANCHOR LARGE SCREENS */}
          <h1 className="inline-block pb-1 overflow-hidden font-bold __section-title">
            All Projects <span className="emoji-z-index">⚒️</span>
          </h1>
          <div
            className="flex-col items-center justify-center mt-6 overflow-hidden __projects-not-mobile"
          >
            <div
              className="rounded-lg origin-top-left flex-col fixed z-[13] -translate-x-1/2 -translate-y-1/2 w-[34rem] items-center overflow-hidden duration-[600ms] __projects-img-section"
              style={{
                filter: "brightness(70%)",
                transform: `translate(-50%, -50%)`,
                height: `calc(${imgScale} * 19.1rem)`,
                transition:
                  "550ms height cubic-bezier(0.76, 0, 0.24, 1), 1300ms scale cubic-bezier(0.19, 1, 0.22, 1)",
              }}
            >
              {projectsInfos.map(({ img, title }, indx) => (
                <img
                  key={indx}
                  src={`/assets/projects/${img}/logo.png`}
                  style={{
                    transform: `translateY(${activeProjectIndx * -100}%)`,
                    transition: "1300ms cubic-bezier(0.19, 1, 0.22, 1)",
                  }}
                  alt={title}
                />
              ))}
            </div>
            {projectsInfos.map(({ title, to }, indx) => (
              <div
                key={indx}
                className={`border-t lg:text-4xl duration-300s md:text-3xl text-2xl p-6 w-full flex justify-between items-center z-[14] translate-x-full __slide-right-left overflow-hidden ${indx + 1 === projectsInfos.length ? "border-b" : ""
                  } __project-row`}
                style={{
                  borderColor: "var(--text-color)",
                  transition: "padding 300ms ease",
                }}
                onMouseEnter={() => {
                  setMousePresent(true);
                  setActiveProjectIndx(indx);
                  setImgScale(1);
                }}
                onMouseLeave={() => {
                  setMousePresent(false);
                  setImgScale(0);
                }}
              >
                <span
                  className={`${mousePresent && indx === activeProjectIndx
                    ? ` brightness-100 translate-x-5`
                    : mousePresent
                      ? " brightness-[0.3]"
                      : ""
                    } duration-300`}
                >
                  {title}
                </span>
                <Link
                  to={to}
                  className={`expand-bg font-light md:text-2xl duration-300s px-4 py-2 hover:rounded-md border __cursor-difference ${mousePresent && indx === activeProjectIndx
                    ? `brightness-100 -translate-x-5`
                    : mousePresent
                      ? "brightness-[0.3]"
                      : ""
                    }`}
                  style={{
                    transition:
                      "transform cubic-bezier(0.19, 1, 0.22, 1), 300ms",
                  }}
                >
                  view
                </Link>
              </div>
            ))}
          </div>
          {/* ANCHOR not large screens */}
          <div className="mt-4 __projects-mobile">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-8">
              {projectsInfos.map(({ title, img, to }, indx) => (
                <Link
                  to={`/projects/${to}`}
                  className="flex flex-col gap-2"
                  key={indx}
                >
                  <div className="inline-block w-full overflow-hidden rounded-lg">
                    <img
                      src={`/assets/projects/${img}/logo.png`}
                      alt={title}
                      className="translate-x-full __project-img-mobile"
                      ref={(el) => (imgRefs.current[indx] = el)}
                    />
                  </div>
                  <div className="overflow-hidden w-fit">
                    <button
                      className="flex items-center justify-start gap-2 text-lg translate-x-full __project-title-mobile"
                      ref={(el) => (titleRefs.current[indx] = el)}
                    >
                      {title}
                      <span className="text-base material-symbols-outlined">
                        open_in_new
                      </span>
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </>
    </TransitionOverlay>
  );
}
