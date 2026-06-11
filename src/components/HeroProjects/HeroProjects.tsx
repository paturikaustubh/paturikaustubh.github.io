import { Link } from "react-router-dom";
import { projectsInfos } from "../../ProjectsInfos";
import WorkList from "../WorkList/WorkList";


export default function Projects() {
  return (
    <section className="__section-padding" id="projects">
      <p className="__mono-label">[ 03 — selected work ]</p>
      <span className="__cursor-blend">
        <span className="__section-title">Projects</span>
      </span>
      <div className="mt-8">
        <WorkList items={projectsInfos.slice(0, 4)} linkPrefix="projects" />
      </div>
      <div className="flex items-center justify-end w-full mt-4 lg:mt-12 md:mt-8">
        <Link
          to={"projects"}
          className="px-6 py-2 font-mono text-sm uppercase tracking-widest border rounded-full expand-bg __cursor-difference"
        >
          All projects →
        </Link>
      </div>
    </section>
  );
}
