import { projectsInfos } from "../../ProjectsInfos";
import { TransitionOverlay } from "../../Transition/transition";
import WorkList from "../../components/WorkList/WorkList";
import { useGsap } from "../../lib/useGsap";
import { revealChars } from "../../lib/reveal";
import { INTRO_DELAY } from "../../lib/intro";

export default function ProjectsList() {
  useGsap(() => {
    const title = document.querySelector<HTMLElement>(".__section-title");
    if (title) revealChars(title, { delay: INTRO_DELAY });
  }, []);

  return (
    <TransitionOverlay>
      <section className="__section-padding min-h-[100dvh]">
        <p className="__mono-label">[ index — all work ]</p>
        <h1 className="inline-block pb-1 overflow-hidden __section-title">
          All Personal Projects
        </h1>
        <div className="mt-6">
          <WorkList items={projectsInfos} />
        </div>
      </section>
    </TransitionOverlay>
  );
}
