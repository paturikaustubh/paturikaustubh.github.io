import { useEffect } from "react";
import { projectsInfos } from "../../ProjectsInfos";
import { TransitionOverlay } from "../../Transition/transition";
import WorkList from "../../components/WorkList/WorkList";

export default function ProjectsList() {
  useEffect(() => {
    document.body.classList.add("__dark-mode");
    document.querySelector("nav")?.classList.add("__header-inverted");
    return () => {
      document.querySelector("nav")?.classList.remove("__header-inverted");
    };
  }, []);

  return (
    <TransitionOverlay>
      <section className="__theme-change-dark __section-padding no-border-radius min-h-[100dvh]">
        <p className="__mono-label">[ index — all work ]</p>
        <h1 className="inline-block pb-1 overflow-hidden __section-title">
          All Projects
        </h1>
        <div className="mt-6">
          <WorkList items={projectsInfos} />
        </div>
      </section>
    </TransitionOverlay>
  );
}
