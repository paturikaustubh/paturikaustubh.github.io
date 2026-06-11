import { projectsInfos } from "../../ProjectsInfos";
import { TransitionOverlay } from "../../Transition/transition";
import WorkList from "../../components/WorkList/WorkList";

export default function ProjectsList() {
  return (
    <TransitionOverlay>
      <section className="__section-padding min-h-[100dvh]">
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
