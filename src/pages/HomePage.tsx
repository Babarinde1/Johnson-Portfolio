import { ArrowDownRight, ArrowRight, ArrowUpRight, Braces, Cpu, Orbit, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import Reveal from "../components/motion/Reveal";
import HeroRings from "../components/ui/HeroRings";
import ProjectCard from "../components/ui/ProjectCard";
import SkillsSection from "../components/ui/SkillsSection";
import { useProjects } from "../features/projects/useProjects";
import { usePageMeta } from "../lib/usePageMeta";
import { defaultSiteContent, fetchSiteContent } from "../lib/supabase-rest";

function HeroOrb() {
  return (
    <div className="hero-visual" aria-label="Animated 3D rings spinning around a wireframe core, representing connected AI systems" role="img">
      <div className="hero-visual__halo" />
      <HeroRings />
      <span className="hero-visual__label hero-visual__label--top">SYSTEMS / 01</span>
      <span className="hero-visual__label hero-visual__label--bottom">BUILDING WITH INTENT</span>
      <span className="hero-visual__cross hero-visual__cross--a">+</span><span className="hero-visual__cross hero-visual__cross--b">+</span>
    </div>
  );
}

export default function HomePage() {
  const reduce = useReducedMotion();
  const { projects } = useProjects();
  const [site, setSite] = useState(defaultSiteContent);
  useEffect(() => { let active=true; fetchSiteContent().then(content=>{if(active)setSite(content);}); return ()=>{active=false;}; }, []);
  usePageMeta("Home", "Johnson Pedia: AI/ML engineer building language technology, retrieval systems, and computer vision tools.");
  const featured = projects.filter((project) => project.featured);
  return (
    <>
      <section className="hero">
        <div className="hero__grid" aria-hidden="true" />
        <div className="container hero__inner">
          <motion.div className="hero__copy" initial={reduce ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}>
            <p className="hero__eyebrow"><span className="status-dot" /> AI ENGINEERING <span>/</span> NLP <span>/</span> COMPUTER VISION</p>
            <h1>{site.hero_title}</h1>
            <p className="hero__intro">{site.hero_intro}</p>
            <div className="hero__actions"><Link className="btn btn--primary btn--large" to="/projects">Explore projects <ArrowUpRight size={17} /></Link><Link className="btn btn--ghost btn--large" to="/resume">View resume <ArrowRight size={16} /></Link></div>
            <div className="hero__proof"><div><strong>01</strong><span>Language AI</span></div><div><strong>02</strong><span>Knowledge systems</span></div><div><strong>03</strong><span>Applied ML</span></div></div>
          </motion.div>
          <motion.div className="hero__art" initial={reduce ? false : { opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}><HeroOrb /></motion.div>
        </div>
        <div className="hero__bottom container"><span>INDEPENDENT BUILDER · NIGERIA</span><a href="#selected-work">SCROLL TO EXPLORE <ArrowDownRight size={14} /></a></div>
      </section>

      <section className="section intro-section" id="selected-work">
        <div className="container intro-section__inner">
          <Reveal><p className="label">A builder's mindset</p><h2>From a meaningful problem to a <span className="text-gradient">working system.</span></h2></Reveal>
          <Reveal delay={0.12}><p className="intro-section__body">My work spans Yorùbá language technology, document intelligence, computer vision, and local-first assistants. I care about the details behind the demo: the data, the trade-offs, the evaluation, and the experience people actually use.</p><Link to="/about" className="text-link">More about my approach <ArrowRight size={16} /></Link></Reveal>
        </div>
      </section>

      <section className="section projects-section">
        <div className="container">
          <Reveal className="section-heading section-heading--split"><div><p className="label">Selected work</p><h2>Ideas, translated into <span className="text-gradient">systems.</span></h2></div><Link className="text-link section-heading__link" to="/projects">All projects <ArrowUpRight size={16} /></Link></Reveal>
          <div className="project-grid">{featured.slice(0, 4).map((project, index) => <ProjectCard key={project.slug} project={project} index={index} />)}</div>
        </div>
      </section>

      <SkillsSection />

      <section className="section focus-section">
        <div className="container">
          <Reveal><p className="label">Where I focus</p><h2>Three connected areas.<br /><span className="text-gradient">One practical mindset.</span></h2></Reveal>
          <div className="focus-grid">
            <Reveal delay={0.05}><article className="focus-card"><div className="focus-card__icon"><Braces size={22} /></div><p className="label">01 / LANGUAGE</p><h3>Language AI</h3><p>Exploring NLP systems for Yorùbá and other language experiences where meaning, tone, and context matter.</p></article></Reveal>
            <Reveal delay={0.12}><article className="focus-card"><div className="focus-card__icon"><Sparkles size={22} /></div><p className="label">02 / KNOWLEDGE</p><h3>RAG & document intelligence</h3><p>Building workflows that help people search, understand, and use information from their own documents.</p></article></Reveal>
            <Reveal delay={0.19}><article className="focus-card"><div className="focus-card__icon"><Cpu size={22} /></div><p className="label">03 / PERCEPTION</p><h3>Applied machine learning</h3><p>Working with vision, model evaluation, and assistant architectures that connect models to useful tasks.</p></article></Reveal>
          </div>
        </div>
      </section>

      <section className="contact-band"><div className="container contact-band__inner"><Reveal><p className="label">Have a problem worth building for?</p><h2>Let's make something <span className="text-gradient">useful.</span></h2><p>Open to thoughtful collaborations, AI/ML opportunities, and conversations about language technology.</p><Link to="/contact" className="btn btn--primary btn--large">Start a conversation <ArrowUpRight size={17} /></Link></Reveal><div className="contact-band__mark" aria-hidden="true"><Orbit /></div></div></section>
    </>
  );
}
