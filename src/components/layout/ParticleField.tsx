import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

// Site-wide field of softly glowing particles, fixed behind all content.
// Each particle is a pre-rendered glow sprite drawn additively, so it shines
// without any per-frame blur cost. A few large, faint "bokeh" orbs add depth.
// Pauses when the tab is hidden; draws one still frame for reduced motion.

interface Particle { x: number; y: number; vx: number; vy: number; size: number; a: number; phase: number; speed: number; c: number }

// Warm palette like the reference, with a rare cool spark.
const COLORS = ["255,176,64", "255,150,50", "255,205,120", "255,120,60", "255,190,90", "120,225,235"];
const WEIGHTS = [0, 0, 1, 1, 1, 2, 2, 3, 4, 4, 4, 5]; // index into COLORS; mostly orange/amber
const POINTER_RADIUS = 130;

function makeSprite(rgb: string) {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, `rgba(${rgb},1)`);
  grad.addColorStop(0.16, `rgba(${rgb},0.6)`);
  grad.addColorStop(0.5, `rgba(${rgb},0.12)`);
  grad.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return c;
}

export default function ParticleField() {
  const ref = useRef<HTMLCanvasElement>(null);
  const { pathname } = useLocation();
  const hidden = pathname.startsWith("/admin"); // admin is a working tool: keep it calm

  useEffect(() => {
    if (hidden) return;
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const sprites = COLORS.map(makeSprite);
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = { x: -9999, y: -9999, vx: 0, vy: 0, lastX: -9999, lastY: -9999 };
    let w = 0, h = 0, raf = 0, last = 0, time = 0;
    let particles: Particle[] = [];

    const seed = () => {
      const dots = Math.max(30, Math.min(120, Math.round((w * h) / 12000)));
      const bokeh = w < 700 ? 3 : 7;
      particles = [
        ...Array.from({ length: dots }, (): Particle => ({
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - 0.5) * 12, vy: -2 - Math.random() * 8, // slow upward drift
          size: 5 + Math.random() * 9, a: 0.55 + Math.random() * 0.45,
          phase: Math.random() * 6.28, speed: 0.6 + Math.random() * 1.6,
          c: WEIGHTS[Math.floor(Math.random() * WEIGHTS.length)],
        })),
        ...Array.from({ length: bokeh }, (): Particle => ({
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - 0.5) * 5, vy: -1 - Math.random() * 3,
          size: 36 + Math.random() * 60, a: 0.1 + Math.random() * 0.12,
          phase: Math.random() * 6.28, speed: 0.2 + Math.random() * 0.4,
          c: WEIGHTS[Math.floor(Math.random() * 5)], // warm only
        })),
      ];
    };

    const draw = (dt: number) => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      for (const p of particles) {
        if (dt > 0) {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          const dx = p.x - pointer.x, dy = p.y - pointer.y;
          const d = Math.hypot(dx, dy);
          if (d < POINTER_RADIUS && d > 0.1 && p.size < 30) {
            const influence = 1 - d / POINTER_RADIUS;
            // A soft outward ripple plus a short-lived current in the direction
            // the pointer is travelling. Particles feel like a responsive field.
            const push = influence * 92 * dt;
            const flow = influence * 0.95;
            p.x += (dx / d) * push + pointer.vx * flow * dt;
            p.y += (dy / d) * push + pointer.vy * flow * dt;
          }
          const m = p.size;
          if (p.x < -m) p.x = w + m; else if (p.x > w + m) p.x = -m;
          if (p.y < -m) p.y = h + m; else if (p.y > h + m) p.y = -m;
        }
        const twinkle = 0.65 + 0.35 * Math.sin(time * p.speed + p.phase);
        ctx.globalAlpha = p.a * twinkle;
        ctx.drawImage(sprites[p.c], p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
      if (motion.matches) draw(0);
    };

    const tick = (t: number) => {
      const dt = Math.min((t - last) / 1000, 0.05);
      last = t;
      time += dt;
      pointer.vx *= 0.91;
      pointer.vy *= 0.91;
      draw(dt);
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      cancelAnimationFrame(raf);
      if (motion.matches || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const dx = pointer.lastX < 0 ? 0 : e.clientX - pointer.lastX;
      const dy = pointer.lastY < 0 ? 0 : e.clientY - pointer.lastY;
      pointer.vx = Math.max(-900, Math.min(900, dx * 18));
      pointer.vy = Math.max(-900, Math.min(900, dy * 18));
      pointer.x = pointer.lastX = e.clientX;
      pointer.y = pointer.lastY = e.clientY;
    };
    const onLeave = () => { pointer.x = pointer.y = pointer.lastX = pointer.lastY = -9999; pointer.vx = pointer.vy = 0; };
    const onMotionChange = () => { start(); if (motion.matches) draw(0); };

    resize();
    start();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", start);
    motion.addEventListener("change", onMotionChange);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", start);
      motion.removeEventListener("change", onMotionChange);
    };
  }, [hidden]);

  if (hidden) return null;
  return <canvas ref={ref} className="particle-field" aria-hidden="true" />;
}
