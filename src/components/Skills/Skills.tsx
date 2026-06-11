import { useEffect, useRef, useState } from "react";
import "./styles.css";
import Accordion from "../Accordion/Accordion";
import { collection, getDocs } from "firebase/firestore";
import db from "../../firebase";

import { gsap } from "gsap";
import { useGsap } from "../../lib/useGsap";

interface TechStackDetails {
  title: string;
  techs: string[];
}

/** Shown immediately; replaced by Firestore data when (if) it arrives. */
const FALLBACK_STACK: TechStackDetails[] = [
  { title: "Frontend", techs: ["React.js", "TypeScript", "Tailwind CSS", "GSAP", "Three.js"] },
  { title: "Backend", techs: ["Node.js", "Express", "Python", "Flask"] },
  { title: "Databases", techs: ["MySQL", "MS SQL Server", "Firebase"] },
  { title: "Gen AI", techs: ["LangChain", "RAG Pipelines", "Prompt Engineering"] },
];

export default function Skills() {
  const [accordianActiveIndx, setAccordionActiveIndx] = useState(1);
  const [techStackList, setTechStackList] =
    useState<TechStackDetails[]>(FALLBACK_STACK);
  const listWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const techStackOrder = ["frontend", "backend", "database", "genAi"];
    const fetchTechStack = async () => {
      try {
        const techStackCollection = collection(db, "techStack");
        const techStackSnapshot = await getDocs(techStackCollection);
        const fetched = techStackSnapshot.docs.map((doc) => ({
          [doc.id]: doc.data(),
        }));
        if (fetched.length === 0) return; // keep fallback
        const sortedData = fetched
          .sort((a, b) => {
            const keyA = Object.keys(a)[0];
            const keyB = Object.keys(b)[0];
            return techStackOrder.indexOf(keyA) - techStackOrder.indexOf(keyB);
          })
          .map((item) => {
            const key = Object.keys(item)[0];
            const { techs, title } = item[key] as TechStackDetails;
            return { techs, title };
          });
        setTechStackList(sortedData);
      } catch {
        // offline / blocked — fallback already rendered
      }
    };

    fetchTechStack();
  }, []);

  useGsap(() => {
    const cards = listWrapRef.current?.querySelectorAll(
      ".tech-stack-info-card",
    );
    if (!cards || cards.length === 0) return;
    gsap.from(cards, {
      xPercent: 30,
      opacity: 0,
      duration: 0.7,
      ease: "power3.out",
      stagger: 0.08,
      scrollTrigger: {
        trigger: listWrapRef.current,
        start: "top 82%",
      },
    });
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
        <div className="col-span-12 lg:col-span-7 __section-desc __cursor-blend __fade-in font-serif italic font-[400]">
          Over the time, I’ve picked up a bunch of cool tech skills. They’ve
          been my sidekicks in creating some awesome stuff and continue to fuel
          my coding adventures.
        </div>
        <div
          ref={listWrapRef}
          className="flex flex-col col-span-12 overflow-hidden lg:col-span-5"
        >
          {techStackList.map((techStack, indx) => (
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
