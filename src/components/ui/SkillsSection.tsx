import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import Reveal from "../motion/Reveal";
import { defaultSiteContent, fetchSiteContent } from "../../lib/supabase-rest";


function SkillMeter({ name, category, value, index }: { name: string; category: string; value: number; index: number }) {
  const [started, setStarted] = useState(false);
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setStarted(true);
        observer.disconnect();
      }
    }, { threshold: 0.35 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    if (reduce) { setCount(value); return; }
    let frame = 0;
    let startTime = 0;
    const duration = 1050;
    const delay = index * 55;
    let timeout: ReturnType<typeof setTimeout>;
    const tick = (now: number) => {
      if (!startTime) startTime = now;
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    timeout = setTimeout(() => { frame = requestAnimationFrame(tick); }, delay);
    return () => { clearTimeout(timeout); cancelAnimationFrame(frame); };
  }, [started, value, index, reduce]);

  return (
    <motion.div ref={ref} className="skill-item" initial={reduce ? false : { opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.4, delay: index * 0.045 }}>
      <div className="skill-item__top"><div><span className="skill-item__category">{category}</span><h3>{name}</h3></div><span className="skill-item__value" aria-label={`${name}, self-assessed proficiency ${value} percent`}>{started ? count : 0}<small>%</small></span></div>
      <div className="skill-track" role="progressbar" aria-label={`${name} self-assessed proficiency`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={started ? count : 0}>
        <motion.span className="skill-track__fill" initial={{ width: "0%" }} animate={{ width: started ? `${value}%` : "0%" }} transition={{ duration: reduce ? 0 : 1.1, delay: reduce ? 0 : index * 0.055, ease: [0.22, 1, 0.36, 1] }} />
      </div>
    </motion.div>
  );
}

export default function SkillsSection() {
  const [skills, setSkills] = useState(defaultSiteContent.skills);
  useEffect(() => { let active = true; fetchSiteContent().then(content => { if (active && content.skills?.length) setSkills(content.skills); }); return () => { active = false; }; }, []);
  return (
    <section className="section skills-section" aria-labelledby="skills-title">
      <div className="container">
        <Reveal className="section-heading section-heading--split">
          <div><p className="label">Technical toolkit</p><h2 id="skills-title">Skills built through <span className="text-gradient">hands-on work.</span></h2></div>
          <p className="section-heading__aside">A snapshot of my current confidence across programming, frontend development, and applied AI.</p>
        </Reveal>
        <div className="skills-grid">{skills.map((skill, index) => <SkillMeter key={skill.name} {...skill} index={index} />)}</div>
        <p className="skills-note">Percentages are self-assessed proficiency indicators, not standardized test scores or years of experience.</p>
      </div>
    </section>
  );
}
