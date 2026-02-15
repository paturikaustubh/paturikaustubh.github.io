import { useEffect, useRef, useState } from "react";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

import "./styles.css";
import { projectsInfos } from "../../ProjectsInfos";
import { Link } from "react-router-dom";

export default function Projects() {
  // ANCHOR STATES && REFS
  const [activeProjectIndx, setActiveProjectIndx] = useState(0);
  const [imgScale, setImgScale] = useState(0);
  const [mousePresent, setMousePresent] = useState(false);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const titleRefs = useRef<(HTMLButtonElement | null)[]>([]);



  // ANCHOR EFFECTS
  useEffect(() => {
    const gsapMatchMedia = gsap.matchMedia();

    gsapMatchMedia.add("(min-width: 1024px)", () => {
      // Get the __custom-cursor element
      const customCursor = document.querySelector(".__custom-cursor");

      // Get all elements with class name "__project-row"
      const projectRows = Array.from(
        document.querySelectorAll(".__project-row")
      );

      if (customCursor)
        window.addEventListener("scroll", () => {
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
        });
    });

    gsapMatchMedia.add("(max-width: 1024px)", () => {
      // GSAP ANIMATIONS ||================================================================
      imgRefs.current.forEach((img, index) => {
        gsap.to(img, {
          x: "0%",
          scrollTrigger: {
            trigger: img,
            start: "top 70%",
            toggleActions: "play none none reverse",
            onEnter: () =>
              gsap.to(titleRefs.current[index], {
                x: "0%",
                ease: "power1.out",
                delay: 0.2,
              }),
            onLeaveBack: () =>
              gsap.to(titleRefs.current[index], {
                x: "100%",
                ease: "power1.out",
              }),
          },
          ease: "power1.out",
        });
      });
    });
  }, [mousePresent]);

  // ANCHOR JSX
  return (
    <section
      className="__section-padding __theme-change-dark no-bottom-radius"
      id="projects"
    >
      <span className="__cursor-blend">
        <span className="__section-title">
          Projects <span className="z-[12]">⚒️</span>
        </span>
      </span>
      {/* ANCHOR LARGE SCREENS */}
      <div
        className="flex-col items-center justify-center mt-8 overflow-hidden __projects-not-mobile"
      >
        <div
          className="rounded-lg origin-top-left flex-col fixed z-[13] -translate-x-1/2 -translate-y-1/2 w-[34rem] items-center overflow-hidden duration-[600ms] __projects-img-section"
          style={{
            filter: "brightness(70%)",
            transform: `translate(-50%, -50%)`,
            height: `calc(${imgScale} * 19.1rem`,
            overflow: "hidden",
            transition:
              "height 550ms cubic-bezier(0.76, 0, 0.24, 1), scale 1300ms cubic-bezier(0.19, 1, 0.22, 1)",
          }}
        >
          {projectsInfos.slice(0, 4).map(({ img, title }, indx) => (
            <img
              key={indx}
              src={`/portfolio/assets/projects/${img}/logo.png`}
              style={{
                transform: `translateY(${activeProjectIndx * -100}%)`,
                transition: "1300ms cubic-bezier(0.19, 1, 0.22, 1)",
              }}
              alt={title}
            />
          ))}
        </div>
        {projectsInfos.slice(0, 4).map(({ title, to }, indx) => (
          <div
            key={indx}
            className={`__project-row border-t lg:text-5xl duration-300s md:text-4xl text-3xl ${mousePresent && indx !== activeProjectIndx
                ? "p-8"
                : !mousePresent
                  ? "p-8"
                  : "p-12"
              } w-full flex justify-between items-center z-[14] translate-x-full __slide-right-left overflow-hidden ${indx + 1 === 4 ? "border-b" : ""
              }`}
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
              className={`font-semibold ${mousePresent && indx === activeProjectIndx
                  ? ` brightness-100 translate-x-5`
                  : mousePresent
                    ? " brightness-[0.3]"
                    : ""
                } duration-300`}
            >
              {title}
            </span>
            <Link
              to={`projects/${to}`}
              className={`expand-bg font-light __section-desc px-6 hover:rounded-xl border-2 __cursor-difference ${mousePresent && indx === activeProjectIndx
                  ? `brightness-100 -translate-x-5`
                  : mousePresent
                    ? "brightness-[0.3]"
                    : ""
                }`}
              style={{
                transition: "transform cubic-bezier(0.19, 1, 0.22, 1), 300ms",
              }}
            >
              view
            </Link>
          </div>
        ))}
      </div>

      {/* ANCHOR not large screens */}
      <div className="mt-4 __projects-mobile">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {projectsInfos.slice(0, 4).map(({ title, img, to }, indx) => (
            <Link
              to={`projects/${to}`}
              className="flex flex-col gap-4"
              key={indx}
            >
              <div className="inline-block w-full overflow-hidden rounded-lg">
                <img
                  src={`/portfolio/assets/projects/${img}/logo.png`}
                  alt={title}
                  className="translate-x-full __project-img-mobile"
                  ref={(el) => (imgRefs.current[indx] = el)}
                />
              </div>
              <div className="overflow-hidden w-fit">
                <button
                  className="flex items-center gap-2 text-2xl translate-x-full md:text-3xl __project-title-mobile"
                  ref={(el) => (titleRefs.current[indx] = el)}
                >
                  {title}
                  <span className="text-xl material-symbols-outlined md:text-2xl">
                    open_in_new
                  </span>
                </button>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end w-full mt-4 lg:mt-12 md:mt-8">
        <Link
          to={"projects"}
          className="px-4 py-2 border-2 rounded-lg __section-desc md:px-10 expand-bg __cursor-difference"
        >
          All projects
        </Link>
      </div>
    </section>
  );
}
