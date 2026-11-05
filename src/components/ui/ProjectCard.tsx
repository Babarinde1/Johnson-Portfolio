import { ArrowUpRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import type { Project } from "../../features/projects/project.data";

export default function ProjectCard({ project, index = 0 }: { project: Project; index?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.article
      className="project-card"
      initial={reduce ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.07, 0.28), ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduce ? undefined : { y: -5 }}
    >
      <div className={`project-card__art project-card__art--${project.slug}`} aria-hidden="true">
        {project.coverImageUrl ? <img className="project-card__img" src={project.coverImageUrl} alt="" loading="lazy" /> : <span className="project-card__orb" />}
        <span className="project-card__art-label"><Sparkles size={14} /> {project.category}</span>
        <span className="project-card__art-index">0{index + 1}</span>
      </div>
      <div className="project-card__body">
        <div className="project-card__meta"><span className={`status status--${project.status.toLowerCase().replace(/ /g, "-")}`}>{project.status}</span><span>{project.category}</span></div>
        <h3>{project.title}</h3>
        <p>{project.summary}</p>
        <ul className="tag-list" aria-label="Technologies">{project.technologies.map((tech) => <li key={tech}>{tech}</li>)}</ul>
        <div className="project-card__links">
          <Link to={`/projects/${project.slug}`} className="text-link">Explore case study <ArrowUpRight size={16} aria-hidden="true" /></Link>
          {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="project-card__external">Live site ↗</a>}
        </div>
      </div>
    </motion.article>
  );
}
