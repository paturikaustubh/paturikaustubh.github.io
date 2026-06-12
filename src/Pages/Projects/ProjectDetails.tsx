import { Link, useParams } from "react-router-dom";
import { TransitionOverlay } from "../../Transition/transition";
import { Suspense, lazy, useLayoutEffect, useRef, useState } from "react";
import { ProjectDetailsType, projectsInfos } from "../../ProjectsInfos";
import { gsap } from "gsap";
import { useGsap } from "../../lib/useGsap";
import { revealChars } from "../../lib/reveal";
import { INTRO_DELAY } from "../../lib/intro";
import ReadmeViewer from "../../components/ReadmeViewer/ReadmeViewer";
import "./detailsStyles.css";

const DistortImage = lazy(() => import("../../components/Three/DistortImage"));

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
    projectsInfos[projectIndx + 1 === projectsInfos.length ? 0 : projectIndx + 1];
  const prevProjectDetails =
    projectsInfos[projectIndx - 1 < 0 ? projectsInfos.length - 1 : projectIndx - 1];

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
    gsap.from(".__case-meta", {
      opacity: 0,
      y: 14,
      duration: 0.6,
      delay: INTRO_DELAY + 0.45,
      stagger: 0.06,
      ease: "power2.out",
    });
  }, [projectDetails.title]);

  const handleFullscreen = () => {
    videoRef.current?.requestFullscreen?.();
  };

  const caseNumber = String(projectIndx + 1).padStart(2, "0");
  const caseTotal = String(projectsInfos.length).padStart(2, "0");

  return (
    <TransitionOverlay>
      <section className="min-h-[100dvh] __section-padding overflow-hidden">
        {/* header */}
        <p className="__mono-label __case-meta">
          [ case — {caseNumber} / {caseTotal} ]
        </p>
        <h1
          ref={titleRef}
          className="font-display font-[800] uppercase leading-[0.95] tracking-tight text-[clamp(2.6rem,9dvw,9rem)] overflow-hidden __cursor-blend __cursor-difference"
        >
          {projectDetails.title}
        </h1>

        {/* meta strip */}
        <div className="grid grid-cols-2 mt-8 border-y md:grid-cols-4 border-[#3a332b] divide-x divide-[#3a332b] __case-meta">
          <div className="px-4 py-3 font-mono text-xs tracking-widest uppercase opacity-70">
            nº {caseNumber}
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

        {/* body */}
        <div className="grid grid-cols-12 mt-12 gap-y-12 lg:gap-x-12">
          {/* sticky aside */}
          <aside className="col-span-12 lg:col-span-4">
            <div className="lg:sticky lg:top-28 flex flex-col gap-8">
              <div>
                <p className="__mono-label mb-3">( about )</p>
                {projectDetails.readmeRepo ? (
                  <ReadmeViewer repo={projectDetails.readmeRepo} />
                ) : (
                  <p className="text-base leading-relaxed lg:text-lg font-[350] __cursor-blend __cursor-difference">
                    {projectDetails.desc}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <p className="__mono-label mb-1">( index )</p>
                <Link
                  to="/projects"
                  className="font-mono text-sm uppercase tracking-widest opacity-70 hover:opacity-100 transition-opacity __cursor-difference"
                >
                  ← all projects
                </Link>
                <Link
                  to={`/projects/${prevProjectDetails.to}`}
                  id="prev-project-link"
                  className="font-mono text-sm uppercase tracking-widest opacity-70 hover:opacity-100 transition-opacity __cursor-difference"
                >
                  ↑ prev — {prevProjectDetails.title}
                </Link>
              </div>
            </div>
          </aside>

          {/* media column */}
          <div className="col-span-12 lg:col-span-8 space-y-10">
            {projectDetails.img && (
              <Suspense
                fallback={
                  <img
                    src={`/assets/projects/${projectDetails.img}/logo.png`}
                    alt={projectDetails.title}
                    className="w-full rounded-md border border-[#3a332b]"
                  />
                }
              >
                <DistortImage
                  src={`/assets/projects/${projectDetails.img}/logo.png`}
                  alt={projectDetails.title}
                  className="w-full rounded-md border border-[#3a332b] overflow-hidden"
                />
              </Suspense>
            )}

            {projectDetails.responsive && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
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

            <div className="relative">
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
          </div>
        </div>

        {/* giant next-project link */}
        <Link
          to={`/projects/${nextProjectDetails.to}`}
          id="next-project-link"
          className="__next-case group block mt-20 border-t border-[#3a332b] pt-10 pb-6 __cursor-difference"
        >
          <p className="__mono-label mb-4">( next up )</p>
          <span className="__next-case-title font-display font-[800] uppercase leading-[0.95] tracking-tight text-[clamp(2.4rem,8dvw,8rem)]">
            {nextProjectDetails.title}
          </span>
          <span className="block mt-4 font-mono text-sm uppercase tracking-widest opacity-0 -translate-x-3 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
            open case ⟶
          </span>
        </Link>
      </section>
    </TransitionOverlay>
  );
}
