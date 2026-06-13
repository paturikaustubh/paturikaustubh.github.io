import Name from "../../components/Name/Name";
import Projects from "../../components/HeroProjects/HeroProjects";
import Skills from "../../components/Skills/Skills";
import Summary from "../../components/Summary/Summary";
import Experience from "../../components/Experience/Experience";

import { gsap } from "gsap";
import SplitType, { TargetElement } from "split-type";

import "./styles.css";
import { TransitionOverlay } from "../../Transition/transition";
import { useGsap } from "../../lib/useGsap";
import { prefersReducedMotion } from "../../lib/device";
import { INTRO_DELAY } from "../../lib/intro";

export default function Hero() {
  useGsap(() => {
    const body = document.body;
    if (body.classList.contains("__dark-mode"))
      body.classList.remove("__dark-mode");

    gsap.fromTo(
      "nav",
      { y: "-100%" },
      { y: 0, delay: INTRO_DELAY + 0.45, duration: 0.8 },
    );

    // nav flips to ink while floating over the cream band
    document.querySelectorAll(".__theme-change-dark").forEach((band) => {
      gsap.to("nav", {
        scrollTrigger: {
          trigger: band,
          start: "top 5rem",
          end: "bottom 5rem",
          onEnter: () =>
            document.querySelector("nav")?.classList.add("__header-inverted"),
          onEnterBack: () =>
            document.querySelector("nav")?.classList.add("__header-inverted"),
          onLeave: () =>
            document
              .querySelector("nav")
              ?.classList.remove("__header-inverted"),
          onLeaveBack: () =>
            document
              .querySelector("nav")
              ?.classList.remove("__header-inverted"),
        },
      });
    });

    if (prefersReducedMotion()) return;

    // section titles: masked rise with a skew settle
    document.querySelectorAll(".__section-title").forEach((sectionTitle) => {
      const { chars } = new SplitType(sectionTitle as TargetElement, {
        types: "chars",
      });
      gsap.from(chars, {
        scrollTrigger: {
          trigger: sectionTitle,
          start: "top 80%",
          end: "bottom 40%",
          toggleActions: "play none none none",
        },
        yPercent: 120,
        skewY: 5,
        stagger: 0.025,
        ease: "power4.out",
        duration: 0.85,
      });
    });

    // long copy: word-by-word scrub on desktop, one-shot on touch/mobile
    const gsapMatchMedia = gsap.matchMedia();
    gsapMatchMedia.add("(min-width: 768px)", () => {
      document.querySelectorAll(".__fade-in").forEach((el) => {
        const { words } = new SplitType(el as TargetElement, {
          types: "words",
        });
        gsap.from(words, {
          scrollTrigger: {
            trigger: words,
            scrub: 0.6,
            start: "top 95%",
            end: "center 75%",
            toggleActions: "play none none none",
          },
          opacity: 0.03,
          filter: "blur(8px)",
          stagger: 0.04,
          duration: 1,
        });
      });
    });
    gsapMatchMedia.add("(max-width: 768px)", () => {
      document.querySelectorAll(".__fade-in").forEach((el) => {
        const { words } = new SplitType(el as TargetElement, {
          types: "words",
        });
        gsap.from(words, {
          scrollTrigger: {
            trigger: el,
            start: "top 98%",
            toggleActions: "play none none none",
          },
          opacity: 0.06,
          stagger: 0.02,
          duration: 0.5,
        });
      });
    });
  }, []);

  return (
    <TransitionOverlay>
      <>
        <Name />
        <Summary />
        <Skills />
        <Experience />
        <Projects />
      </>
    </TransitionOverlay>
  );
}
