import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import ProjectCard from "../components/ui/ProjectCard";
import Reveal from "../components/motion/Reveal";
import { useProjects } from "../features/projects/useProjects";
import { usePageMeta } from "../lib/usePageMeta";
import { GITHUB_URL } from "../lib/links";

export default function ProjectsPage() {
  const { projects } = useProjects();
  usePageMeta("Projects", "Products, research and prototypes in language AI, retrieval systems and computer vision by Johnson Pedia.");
  const categories = useMemo(() => ["All", ...Array.from(new Set(projects.map((p) => p.category)))], [projects]);
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => projects.filter((p) => (category === "All" || p.category === category) && `${p.title} ${p.summary} ${p.technologies.join(" ")}`.toLowerCase().includes(query.toLowerCase())), [projects, category, query]);
  return <div className="page-wrap"><section className="page-hero"><div className="container"><Reveal><p className="label">Selected work / experiments</p><h1>Projects with a <span className="text-gradient">purpose.</span></h1><p>Products, research, and prototypes built around language, knowledge, and applied machine learning.</p></Reveal></div></section><section className="container page-content"><div className="project-filters"><div className="filter-tabs" role="group" aria-label="Filter projects by category">{categories.map((item) => <button key={item} type="button" aria-pressed={category === item} className={category === item ? "filter-tab is-active" : "filter-tab"} onClick={() => setCategory(item)}>{item}</button>)}</div><label className="project-search"><Search size={16} aria-hidden="true"/><span className="visually-hidden">Search projects</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search projects" /></label></div>{filtered.length ? <div className="project-grid">{filtered.map((project, index) => <ProjectCard key={project.slug} project={project} index={index} />)}</div> : <div className="empty-state"><h2>No matching projects</h2><p>Try another search or category.</p><button className="btn btn--ghost" onClick={() => { setCategory("All"); setQuery(""); }}>Clear filters</button></div>}<aside className="github-cta"><div><h2>More code on GitHub</h2><p>Smaller experiments and learning projects live in my GitHub profile.</p></div><a className="btn btn--ghost" href={GITHUB_URL} target="_blank" rel="noopener noreferrer">Browse GitHub</a></aside></section></div>;
}
