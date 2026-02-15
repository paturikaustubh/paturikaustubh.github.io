import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

import { ReactNode } from "react";

export default function Accordion({
  activeIndx,
  setActiveIndx,
  indx,
  title,
  description,
  borderB = false,
}: {
  activeIndx: number;
  setActiveIndx: React.Dispatch<React.SetStateAction<number>>;
  indx: number;
  title: string;
  description: ReactNode;
  borderB?: boolean;
}) {
  return (
    <div
      className={`tech-stack-info-card __slide-right-left expand-bg ${activeIndx === indx - 1 && indx !== 1 ? "" : "border-t-2"
        } translate-x-full transition-all duration-300 overflow-hidden ${borderB ? "border-b-2" : ""
        } ${activeIndx === indx ? "active rounded-lg" : "my-0"} __cursor-difference`}
    >
      <button
        className="flex items-center justify-between w-full p-3 overflow-hidden text-xl font-semibold lg:text-4xl md:text-3xl sm:text-2xl lg:p-5 md:p-4"
        onClick={() => {
          setActiveIndx((prevVal: number) => {
            if (prevVal !== indx) return indx;
            return 0;
          });
        }}
      >
        <span>{title}</span>
        <span>
          <svg
            className="ml-8 shrink-0 accordion-expand-indicator"
            width="16"
            height="16"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              y="7"
              width="16"
              height="2"
              rx="1"
              className={`transform origin-center ${activeIndx === indx ? "rotate-180" : "rotate-0"
                } transition duration-300 ease-out`}
            ></rect>
            <rect
              y="7"
              width="16"
              height="2"
              rx="1"
              className={`transform origin-center ${activeIndx === indx ? "rotate-0" : "-rotate-[270deg]"
                } transition duration-300 ease-out`}
            ></rect>
          </svg>
        </span>
      </button>
      <div
        className={`grid duration-300 ease-in-out ${activeIndx === indx
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
          }`}
      >
        <div className="overflow-hidden __skills-desc">
          <div className="px-5 pb-5 text-lg">{description}</div>
        </div>
      </div>
    </div>
  );
}
