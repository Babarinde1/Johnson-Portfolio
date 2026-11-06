import { ArrowUpRight, Download, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import Reveal from "../components/motion/Reveal";
import { usePageMeta } from "../lib/usePageMeta";
import { useEffect, useState } from "react";
import { defaultSiteContent, fetchSiteContent } from "../lib/supabase-rest";
import { safeHttpUrl } from "../lib/safeUrl";

const RESUME_PDF = "/Johnson-Pedia-Resume.pdf";
export default function ResumePage() {
  const [site, setSite] = useState(defaultSiteContent);
  useEffect(() => {
    let active = true;
    fetchSiteContent().then((content) => {
      if (active) setSite(content);
    });
    return () => {
      active = false;
    };
  }, []);
  const managedResume = safeHttpUrl(site.resume_url);
  usePageMeta(
    "Resume",
    "Education, selected projects and research experience of Johnson Pedia, AI/ML engineer.",
  );
  return (
    <div className="page-wrap">
      <section className="page-hero">
        <div className="container">
          <Reveal>
            <p className="label">Experience / education / selected work</p>
            <h1>
              My professional <span className="text-gradient">snapshot.</span>
            </h1>
            <p>A concise overview of my background and direction.</p>
          </Reveal>
        </div>
      </section>
      <section className="container resume-content">
        <div className="resume-callout">
          <div>
            <p className="label">Resume PDF</p>
            <h2>Keep a copy for later.</h2>
            <p>
              {managedResume || __HAS_RESUME__
                ? "Download the full resume as a PDF."
                : "A downloadable resume is coming soon. In the meantime, get in touch and I will send it."}
            </p>
          </div>
          {managedResume ? (
            <a
              className="btn btn--primary"
              href={managedResume}
              target="_blank"
              rel="noopener noreferrer"
            >
              Download PDF <Download size={16} />
            </a>
          ) : __HAS_RESUME__ ? (
            <a
              className="btn btn--primary"
              href={RESUME_PDF}
              download="Johnson-Pedia-Resume.pdf"
            >
              Download PDF <Download size={16} />
            </a>
          ) : (
            <Link className="btn btn--primary" to="/contact">
              Request resume <ArrowUpRight size={16} />
            </Link>
          )}
        </div>
        <div className="resume-block">
          <Reveal>
            <p className="label">Education</p>
            <h2>
              <GraduationCap size={23} /> Academic background
            </h2>
          </Reveal>
          <article className="resume-entry">
            <div>
              <h3>B.Tech Food Science</h3>
              <p>
                Ladoke Akintola University of Technology (LAUTECH), Ogbomoso.
              </p>
            </div>
            <div className="resume-entry__meta">
              <span>Second Class Upper (2:1)</span>
            </div>
          </article>
        </div>
        <div className="resume-block">
          <Reveal>
            <p className="label">Selected work</p>
            <h2>Projects and research</h2>
          </Reveal>
          {[
            "Odùduwà AI — Yorùbá language technology",
            "READLY AI — document question-answering with retrieval",
            "Automated OMR Evaluation — computer vision research",
            "Yorùbá Tone Restoration — sequence-to-sequence NLP",
            "Jarvis — local-first Windows voice assistant (in progress)",
          ].map((item) => (
            <div className="resume-simple-row" key={item}>
              {item}
            </div>
          ))}
        </div>
        <div className="resume-bottom">
          <Link className="text-link" to="/projects">
            Explore detailed projects <ArrowUpRight size={16} />
          </Link>
          {!managedResume && !__HAS_RESUME__ && (
            <span>
              <Download size={16} /> PDF download coming soon.
            </span>
          )}
        </div>
      </section>
    </div>
  );
}
