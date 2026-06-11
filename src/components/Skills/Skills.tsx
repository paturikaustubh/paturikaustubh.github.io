import { useEffect, useLayoutEffect, useState } from "react";
import "./styles.css";
import Accordion from "../Accordion/Accordion";
import { collection, getDocs } from "firebase/firestore";
import db from "../../firebase";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

interface TechStackDetails {
  title: string;
  techs: string[];
}

export default function Skills() {
  const [accordianActiveIndx, setAccordionActiveIndx] = useState(0);
  const [techStackList, setTechStackList] = useState<TechStackDetails[]>();

  useLayoutEffect(() => {
    const techStackOrder = ["frontend", "backend", "database", "genAi"];
    const fetchTechStack = async () => {
      const techStackCollection = collection(db, "techStack");
      const techStackSnapshot = await getDocs(techStackCollection);
      const techStackList = techStackSnapshot.docs.map((doc) => ({
        [doc.id]: doc.data(),
      }));
      const sortedData = techStackList
        .sort((a, b) => {
          const keyA = Object.keys(a)[0];
          const keyB = Object.keys(b)[0];

          return techStackOrder.indexOf(keyA) - techStackOrder.indexOf(keyB);
        })
        .map((item) => {
          const key = Object.keys(item)[0];
          const { techs, title } = item[key];
          return { techs, title };
        });

      setTechStackList(sortedData as TechStackDetails[]);
    };

    fetchTechStack();
  }, []);

  useEffect(() => {
    if (techStackList) {
      const gsapMatchMedia = gsap.matchMedia();
      gsap.utils.toArray(".__slide-right-left").forEach((element) => {
        gsap.to(element as Element, {
          x: "0%",
          ease: "power3.out",
          scrollTrigger: {
            trigger: element as Element,
            start: "top 78%",
            end: "bottom 50%",
            toggleActions: "play none none reverse",
          },
        });
      });

      gsapMatchMedia.add("(max-width: 768px)", () => {
        // ANCHOR RIGHT TO LEFT SLIDERS  ||========================================================================
        gsap.utils.toArray(".__slide-right-left").forEach((element) => {
          gsap.to(element as Element, {
            x: "0%",
            ease: "power3.out",
            scrollTrigger: {
              trigger: element as Element,
              start: "top 80%",
              end: "bottom 50%",
              toggleActions: "play none none none",
            },
          });
        });
      });
    }
  }, [techStackList]);

  return (
    <section className="__section-padding" id="tech-stack">
      <p className="__mono-label">[ 02 — tech stack ]</p>
      <div className="whitespace-nowrap">
        <span className="flex flex-col __section-title __cursor-blend md:flex-row">
          Tech Stack
        </span>
      </div>
      <div className="grid w-full grid-cols-12 tech-stack-info-grid gap-y-8 md:gap-x-8">
        <div className="col-span-12 lg:col-span-8 __section-desc __cursor-blend __fade-in font-display font-[400]">
          Over the time, I’ve picked up a bunch of cool tech skills. They’ve
          been my sidekicks in creating some awesome stuff and continue to fuel
          my coding adventures.
        </div>
        <div className="flex flex-col col-span-12 overflow-hidden lg:col-span-4">
          {/* ACCORDION */}
          {techStackList &&
            techStackList.map((techStack, indx) => (
              <Accordion
                key={indx}
                activeIndx={accordianActiveIndx}
                setActiveIndx={setAccordionActiveIndx}
                indx={indx + 1}
                title={techStack.title}
                description={
                  <ul className="__tech-stack-list">
                    {techStack.techs.map((tech, index) => (
                      <li key={index}>{tech}</li>
                    ))}
                  </ul>
                }
                borderB={indx === techStackList.length - 1}
              />
            ))}
        </div>
      </div>
    </section>
  );
}
