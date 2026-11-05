import { ArrowLeft, ArrowUpRight, ExternalLink } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Reveal from "../components/motion/Reveal";
import { useProjects } from "../features/projects/useProjects";
import { usePageMeta } from "../lib/usePageMeta";

export default function ProjectDetailPage() {
  const { slug } = useParams();
  const { projects, loaded } = useProjects();
  const project = projects.find((item) => item.slug === slug);
  usePageMeta(
    project ? project.title : loaded ? "Project not found" : "Loading project",
    project ? project.summary : "This project could not be found.",
    { noindex: !project },
  );
  if (!project && !loaded)
    return (
      <div className="container page-content" aria-busy="true">
        <p className="label">Loading</p>
        <h1>Loading project…</h1>
      </div>
    );
  if (!project)
    return (
      <div className="container page-content">
        <p className="label">Project not found</p>
        <h1>This project isn't here.</h1>
        <Link className="text-link" to="/projects">
          <ArrowLeft size={16} /> Back to projects
        </Link>
      </div>
    );
  return (
    <div className="page-wrap">
      <section className="page-hero">
        <div className="container">
          <Link className="back-link" to="/projects">
            <ArrowLeft size={15} /> All projects
          </Link>
          <Reveal>
            <div className="project-card__meta">
              <span
                className={`status status--${project.status.toLowerCase().replace(/ /g, "-")}`}
              >
                {project.status}
              </span>
              <span>{project.category}</span>
            </div>
            <h1>{project.title}</h1>
            <p>{project.summary}</p>
            <ul className="tag-list">
              {project.technologies.map((tech) => (
                <li key={tech}>{tech}</li>
              ))}
            </ul>
            <div className="hero__actions">
              {project.liveUrl && (
                <a
                  className="btn btn--primary"
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit live project <ExternalLink size={16} />
                </a>
              )}
              {project.repositoryUrl && (
                <a
                  className="btn btn--ghost"
                  href={project.repositoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View source <ArrowUpRight size={16} />
                </a>
              )}
            </div>
          </Reveal>
        </div>
      </section>
      <section className="container case-study">
        <Reveal>
          <div className={`case-art project-card__art--${project.slug}`}>
            {project.coverImageUrl && (
              <img
                className="case-art__img"
                src={project.coverImageUrl}
                alt=""
                loading="lazy"
              />
            )}
            <div className="case-art__orb" />
            <span className="label">
              PROJECT / {project.category.toUpperCase()}
            </span>
          </div>
        </Reveal>
        <div className="case-study__grid">
          <Reveal>
            <p className="label">Overview</p>
            <h2>The idea</h2>
          </Reveal>
          <Reveal>
            <p>{project.description}</p>
            {project.note && <p>{project.note}</p>}
          </Reveal>
          <Reveal>
            <p className="label">Technology</p>
            <h2>Tools used</h2>
          </Reveal>
          <Reveal>
            <ul className="tag-list case-tags">
              {project.technologies.map((tech) => (
                <li key={tech}>{tech}</li>
              ))}
            </ul>
          </Reveal>
        </div>
        <div className="case-study__next">
          <Link className="text-link" to="/projects">
            <ArrowLeft size={16} /> Explore more projects
          </Link>
          {project.liveUrl && (
            <a
              className="text-link"
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open live product <ArrowUpRight size={16} />
            </a>
          )}
        </div>
      </section>
    </div>
  );
}
