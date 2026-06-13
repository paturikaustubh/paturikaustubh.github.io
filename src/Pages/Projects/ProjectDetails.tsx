import { Link, useParams } from "react-router-dom";
import { TransitionOverlay } from "../../Transition/transition";
import { useLayoutEffect, useRef, useState } from "react";
import { ProjectDetailsType, projectsInfos } from "../../ProjectsInfos";
import { gsap } from "gsap";
import { useGsap } from "../../lib/useGsap";
import { revealChars } from "../../lib/reveal";
import { INTRO_DELAY } from "../../lib/intro";
import ReadmeViewer from "../../components/ReadmeViewer/ReadmeViewer";
import "./detailsStyles.css";

// Using regular img instead of Three.js DistortImage

export default function ProjectDetails() {
  const { name: projectName } = useParams();

  const [projectDetails, setProjectDetails] = useState<ProjectDetailsType>({
    title: "",
    desc: "",
    img: "",
    responsive: false,
    to: "",
    repo: "",
    live: "",
  });
  const [projectIndx, setProjectIndx] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const nextProjectDetails =
    projectsInfos[
      projectIndx + 1 === projectsInfos.length ? 0 : projectIndx + 1
    ];
  const prevProjectDetails =
    projectsInfos[
      projectIndx - 1 < 0 ? projectsInfos.length - 1 : projectIndx - 1
    ];

  useLayoutEffect(() => {
    const match = projectsInfos.find(({ to }) => to === projectName);
    if (match) {
      setProjectDetails(match);
      setProjectIndx(projectsInfos.indexOf(match));
    }
  }, [projectName]);

  useGsap(() => {
    if (titleRef.current && projectDetails.title)
      revealChars(titleRef.current, { delay: INTRO_DELAY });
    gsap.from(".__project-meta", {
      opacity: 0,
      y: 14,
      duration: 0.6,
      delay: INTRO_DELAY + 0.45,
      stagger: 0.06,
      ease: "power2.out",
    });
    // in-view at load → delay-based; below fold → ScrollTrigger
    const vh = window.innerHeight;
    document.querySelectorAll<HTMLElement>(".__project-section").forEach((el, i) => {
      if (el.getBoundingClientRect().top < vh * 0.88) {
        gsap.from(el, {
          opacity: 0,
          y: 28,
          duration: 0.7,
          delay: INTRO_DELAY + 0.3 + i * 0.12,
          ease: "power3.out",
        });
      } else {
        gsap.from(el, {
          opacity: 0,
          y: 28,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
        });
      }
    });
  }, [projectDetails.title]);

  const handleFullscreen = () => {
    videoRef.current?.requestFullscreen?.();
  };

  const projectNumber = String(projectIndx + 1).padStart(2, "0");
  const projectTotal = String(projectsInfos.length).padStart(2, "0");

  return (
    <TransitionOverlay>
      <section className="min-h-[100dvh] __section-padding overflow-hidden">
        {/* header */}
        <p className="__mono-label __project-meta">
          [ project — {projectNumber} / {projectTotal} ]
        </p>
        <h1
          ref={titleRef}
          className="font-display font-[800] uppercase leading-[0.95] tracking-tight text-[clamp(2.6rem,9dvw,9rem)] overflow-hidden __cursor-blend __cursor-difference"
        >
          {projectDetails.title}
        </h1>

        {/* meta strip */}
        <div className="grid grid-cols-2 mt-8 border-y md:grid-cols-4 border-[#3a332b] divide-x divide-[#3a332b] __project-meta">
          <div className="px-4 py-3 font-mono text-xs tracking-widest uppercase opacity-70">
            nº {projectNumber}
          </div>
          <div className="px-4 py-3 font-mono text-xs tracking-widest uppercase opacity-70">
            {projectDetails.responsive ? "responsive build" : "desktop-first"}
          </div>
          {projectDetails.repo ? (
            <Link
              to={projectDetails.repo}
              target="_blank"
              className="px-4 py-3 font-mono text-xs tracking-widest uppercase transition-colors hover:text-[--accent-color] __cursor-difference"
            >
              repo ↗
            </Link>
          ) : (
            <div className="px-4 py-3 font-mono text-xs tracking-widest uppercase opacity-40">
              private repo
            </div>
          )}
          {projectDetails.live ? (
            <Link
              to={projectDetails.live}
              target="_blank"
              className="px-4 py-3 font-mono text-xs tracking-widest uppercase transition-colors hover:text-[--accent-color] __cursor-difference"
            >
              live ↗
            </Link>
          ) : (
            <div className="px-4 py-3 font-mono text-xs tracking-widest uppercase opacity-40">
              offline
            </div>
          )}
        </div>

        {/* body — float layout so long content wraps around the image
             and short content lets images/video use the full width below */}
        <div className="mt-12 overflow-hidden">
          {/* Main image: floated right on desktop so content flows around it */}
          {projectDetails.img && (
            <div className="lg:float-right lg:w-[52%] lg:ml-10 lg:mb-4 mb-8 __project-section">
              <img
                src={`/assets/projects/${projectDetails.img}/logo.png`}
                alt={projectDetails.title}
                className="w-full rounded-md border border-[#3a332b]"
              />
            </div>
          )}

          {/* Content: plain block (no flex/grid/overflow) so it wraps around the float */}
          <div className="__project-section">
            <div className="mb-8">
              <p className="__mono-label mb-3">( about )</p>
              {projectDetails.readmeRepo ? (
                <ReadmeViewer repo={projectDetails.readmeRepo} />
              ) : (
                <p className="text-base leading-relaxed lg:text-lg font-[350] __cursor-blend __cursor-difference">
                  {projectDetails.desc}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2 mb-10">
              <p className="__mono-label mb-1">( index )</p>
              <Link
                to="/projects"
                className="font-mono text-sm uppercase tracking-widest opacity-70 hover:opacity-100 transition-opacity __cursor-difference"
              >
                ← all projects
              </Link>
            </div>
          </div>
          {/* overflow-hidden on parent clears the float */}
        </div>

        {/* Responsive screenshots + video — always full width below both columns */}
        {projectDetails.responsive && (
          <div className="grid grid-cols-1 gap-6 mt-10 sm:grid-cols-3 __project-section">
            {[1, 2, 3].map((n) => (
              <img
                key={n}
                src={`/assets/projects/${projectDetails.img}/responsive-${n}.png`}
                loading="lazy"
                alt={`${projectDetails.title} responsive view ${n}`}
                className="w-full rounded-md border border-[#3a332b]"
              />
            ))}
          </div>
        )}

        <div className="relative mt-10 w-fit mx-auto __project-section">
          <video
            src={`/assets/projects/${projectDetails.img}/sample.mp4`}
            ref={videoRef}
            loop
            muted
            playsInline
            preload="none"
            controls={false}
            poster={`/assets/projects/${projectDetails.img}/logo.png`}
            className="w-full max-h-[36rem] object-contain rounded-md border border-[#3a332b]"
            onClick={handleFullscreen}
          />
          {!videoPlaying && (
            <button
              className="absolute inset-0 m-auto h-fit w-fit px-6 py-2 font-mono text-sm uppercase tracking-widest bg-[#efe9e1] text-[#14110e] rounded-full __cursor-difference"
              onClick={() => {
                videoRef.current?.play();
                setVideoPlaying(true);
              }}
            >
              ( play demo )
            </button>
          )}
        </div>

        {/* prev / next project navigation */}
        <div className="mt-20 border-t border-[#3a332b] pt-8 flex flex-col sm:flex-row items-start justify-between gap-8">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-xs uppercase tracking-widest opacity-60">Previous project</span>
            <Link
              to={`/projects/${prevProjectDetails.to}`}
              className="text-3xl lg:text-5xl font-display font-[800] uppercase leading-none transition-colors duration-300 hover:text-[color:var(--accent-color)] __cursor-difference"
              id="prev-project-link"
            >
              {prevProjectDetails.title}
            </Link>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <span className="font-mono text-xs uppercase tracking-widest opacity-60">Next project</span>
            <Link
              to={`/projects/${nextProjectDetails.to}`}
              className="text-3xl lg:text-5xl font-display font-[800] uppercase leading-none transition-colors duration-300 hover:text-[color:var(--accent-color)] __cursor-difference"
              id="next-project-link"
            >
              {nextProjectDetails.title}
            </Link>
          </div>
        </div>
      </section>
    </TransitionOverlay>
  );
}
