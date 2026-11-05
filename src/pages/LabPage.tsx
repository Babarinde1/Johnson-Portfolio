import { FlaskConical, GitBranch, NotebookPen } from "lucide-react";
import Reveal from "../components/motion/Reveal";
import { useProjects } from "../features/projects/useProjects";
import { usePageMeta } from "../lib/usePageMeta";
export default function LabPage() {
  const { projects } = useProjects();
  usePageMeta("Lab", "Experiments, prototypes and technical notes: work that is still evolving, labelled by maturity.");
  const research = projects.filter((project) => project.status === "Research" || project.status === "In Progress");
  return <div className="page-wrap"><section className="page-hero"><div className="container"><Reveal><p className="label">Research / experiments / notes</p><h1>The work behind <span className="text-gradient">the output.</span></h1><p>A place for experiments, implementation notes, and work that is still evolving.</p></Reveal></div></section><section className="container page-content"><div className="lab-intro"><div className="focus-card"><FlaskConical/><h3>Experiments</h3><p>Model exploration and evaluation, with limitations clearly stated.</p></div><div className="focus-card"><GitBranch/><h3>Systems</h3><p>Architecture decisions, pipelines, and lessons from implementation.</p></div><div className="focus-card"><NotebookPen/><h3>Technical notes</h3><p>Short write-ups that make the process easier to reproduce and improve.</p></div></div><div className="lab-list"><h2>Current research and prototypes</h2>{research.map((project) => <article className="lab-row" key={project.slug}><div><span className={`status status--${project.status.toLowerCase().replace(/ /g, "-")}`}>{project.status}</span><h3>{project.title}</h3><p>{project.summary}</p></div><span className="lab-row__category">{project.category}</span></article>)}</div><p className="muted-copy">This page distinguishes ongoing work from completed results. Research metrics and publication links will be added only after verification.</p></section></div>;
}
