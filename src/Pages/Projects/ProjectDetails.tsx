import { Link, useLocation, useParams } from "react-router-dom";
import { TransitionOverlay } from "../../Transition/transition";
import {
  Suspense,
  lazy,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { ProjectDetailsType, projectsInfos } from "../../ProjectsInfos";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./detailsStyles.css";

gsap.registerPlugin(ScrollTrigger);

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
  const [showNextProjectImg, setShowNextProjectImg] = useState(false);
  const [showPrevProjectImg, setShowPrevProjectImg] = useState(false);
  const [previewImgPath, setPreviewImgPath] = useState("");
  const [videoPlaying, setVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const minLg = gsap.matchMedia();

  const prevProjectDetails =
    projectsInfos[
    projectIndx - 1 < 0 ? projectsInfos.length - 1 : projectIndx - 1
    ];

  const nextProjectDetails =
    projectsInfos[
    projectIndx + 1 === projectsInfos.length ? 0 : projectIndx + 1
    ];

  // ANCHOR USELAYOUT EFFECT  ||========================================================================
  useLayoutEffect(() => {
    const projectFilteredArr = projectsInfos.filter(
      ({ to }) => to === projectName
    );
    setProjectDetails(projectFilteredArr[0]);
    setProjectIndx(projectsInfos.indexOf(projectFilteredArr[0]));
  }, [projectName]);

  const { pathname } = useLocation();
  useEffect(() => {
    // Cleaned up manual cursor event listeners for images/video
  }, [pathname, minLg]);

  // ANCHOR USEEFFECT  ||========================================================================


  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {

        // if (cursor) {
        //   cursor.style.cursor = "default";
        // }

        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <TransitionOverlay>
      <section className="min-h-[100dvh] __section-padding lg:space-y-10 md:space-y-8 sm:space-y-6 space-y-4 overflow-hidden">
        <div className="flex justify-between overflow-hidden md:items-center">
          <h1
            className={`__section-title __cursor-blend __cursor-difference`}
            style={{ margin: 0 }}
          >
            {projectDetails.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 __mono-label h-fit my-auto shrink-0">
            {projectDetails.repo && (
              <Link
                to={projectDetails.repo}
                target="_blank"
                className="underline"
              >
                repo ↗
              </Link>
            )}
            {projectDetails.live && (
              <Link
                to={projectDetails.live}
                target="_blank"
                className="underline"
              >
                live ↗
              </Link>
            )}
          </div>
        </div>
        <div className="grid grid-cols-12">
          <div className="lg:text-xl row-span-1 lg:leading-[2rem] font-[500] md:text-lg md:leading-[1.5rem] text-base leading-[1.5rem] lg:col-span-8 md:col-span-10 col-span-12 w-fit __cursor-blend __cursor-difference">
            {projectDetails.desc}
          </div>
        </div>
        <Suspense
          fallback={
            <img
              src={`/assets/projects/${projectDetails.img}/logo.png`}
              alt={projectDetails.title}
              className="md:w-[80%] w-full mx-auto lg:mt-12 rounded-md relative border-2 border-neutral-700"
            />
          }
        >
          <DistortImage
            src={`/assets/projects/${projectDetails.img}/logo.png`}
            alt={projectDetails.title}
            className="md:w-[80%] w-full mx-auto lg:mt-12 rounded-md relative border-2 border-neutral-700 overflow-hidden"
          />
        </Suspense>

        {/* ANCHOR RESPONSIVE IMAGES  ||========================================================== */}
        {projectDetails.responsive && (
          <div className="flex flex-col items-start justify-around gap-16 md:flex-row">
            <img
              src={`/assets/projects/${projectDetails.img}/responsive-1.png`}
              loading="lazy"
              className="mx-auto border-2 rounded-md w-72 border-neutral-700"
            />
            <img
              src={`/assets/projects/${projectDetails.img}/responsive-2.png`}
              loading="lazy"
              className="mx-auto border-2 rounded-md w-72 border-neutral-700"
            />
            <img
              src={`/assets/projects/${projectDetails.img}/responsive-3.png`}
              loading="lazy"
              className="mx-auto border-2 rounded-md w-72 border-neutral-700"
            />
          </div>
        )}

        {/* ANCHOR VIDEO  ||========================================================== */}
        <div className="relative lg:mt-12 md:mt-8 mt-4">
          <video
            src={`/assets/projects/${projectDetails.img}/sample.mp4`}
            ref={videoRef}
            loop
            muted
            playsInline
            preload="none"
            controls={false}
            poster={`/assets/projects/${projectDetails.img}/logo.png`}
            className="max-h-[35rem] mx-auto border-2 border-neutral-700 rounded-md"
            onClick={handleFullscreen}
          />
          {!videoPlaying && (
            <button
              className="absolute inset-0 m-auto h-fit w-fit px-6 py-2 font-mono text-sm uppercase tracking-widest bg-[#100e0c] text-[#ede8e0] rounded-full border"
              onClick={() => {
                videoRef.current?.play();
                setVideoPlaying(true);
              }}
            >
              ( play demo )
            </button>
          )}
        </div>

        {/* ANCHOR NEXT PROJECT  ||========================================================== */}
        <div className="relative z-10 px-0 py-3 border-t-2 lg:py-12 md:py-6 border-neutral-600 lg:px-10 md:px-5">
          <div className="flex flex-col items-center justify-between md:flex-row gap-y-4">
            <div
              className="project-link"
              onMouseEnter={() => {
                setShowPrevProjectImg(true);
                setPreviewImgPath(prevProjectDetails.img);
              }}
              onMouseLeave={() => setShowPrevProjectImg(false)}
            >
              <span className="text-2xl font-semibold lg:text-6xl md:text-4xl">
                Previous project
              </span>
              <Link
                to={`/projects/${prevProjectDetails.to}`}
                className="text-2xl lg:text-6xl md:text-4xl __nav-underline-element __cursor-difference"
                id="prev-project-link"
              >
                {prevProjectDetails.title}
              </Link>
            </div>
            <div
              className="project-link"
              onMouseEnter={() => {
                setShowNextProjectImg(true);
                setPreviewImgPath(nextProjectDetails.img);
              }}
              onMouseLeave={() => setShowNextProjectImg(false)}
            >
              <span className="text-2xl font-semibold lg:text-6xl md:text-4xl">
                Next project
              </span>
              <Link
                to={`/projects/${nextProjectDetails.to}`}
                className="text-2xl lg:text-6xl md:text-4xl __nav-underline-element __cursor-difference"
                id="next-project-link"
              >
                {nextProjectDetails.title}
              </Link>
            </div>
          </div>

          <div
            className={`absolute w-full top-0 -z-10 left-1/2 duration-300 -translate-x-1/2 next-project-img-hider`}
          >
            <img
              src={`/assets/projects/${showNextProjectImg
                ? nextProjectDetails.img
                : prevProjectDetails.img
                }/logo.png`}
              alt={
                showNextProjectImg
                  ? nextProjectDetails.title
                  : prevProjectDetails.title
              }
              loading="lazy"
              className="opacity-0"
            />
          </div>
          <div
            className={`rounded-lg overflow-hidden absolute md:w-1/2 w-3/4 top-0 -z-20 left-1/2 duration-300 -translate-x-1/2 border-2 border-neutral-700 ${showNextProjectImg || showPrevProjectImg
              ? "-translate-y-1/4"
              : "translate-y-0"
              }`}
          >
            <img
              src={`/assets/projects/${previewImgPath}/logo.png`}
              alt={
                showNextProjectImg
                  ? nextProjectDetails.title
                  : prevProjectDetails.title
              }
              loading="lazy"
              className="w-full"
            />
          </div>
        </div>
      </section>
    </TransitionOverlay>
  );
}
