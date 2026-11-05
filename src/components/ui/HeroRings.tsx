import { useEffect, useRef } from "react";

// A lightweight 3D hero object drawn on a 2D canvas (no WebGL library): three tilted rings
// spinning on different axes around a faceted crystal, with small beads travelling along the rings.
//
// The look is matte and physical, not glossy. Each ring is shaded like a real cylinder: a soft
// light side and shadow side across its width, lit from the upper left. Everything is depth-sorted,
// so rings pass in front of and behind each other (and the crystal) correctly, and nearer parts
// cast a soft shadow on what is behind them. Colours live in PALETTES; sizes and speeds in RINGS.

type V3 = [number, number, number];
type RGB = [number, number, number];

const PHI = (1 + Math.sqrt(5)) / 2;
const ICO: V3[] = [
  [-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0], [0, -1, PHI], [0, 1, PHI],
  [0, -1, -PHI], [0, 1, -PHI], [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1],
];
const isEdge = (i: number, j: number) => Math.abs(Math.hypot(ICO[i][0] - ICO[j][0], ICO[i][1] - ICO[j][1], ICO[i][2] - ICO[j][2]) - 2) < 1e-6;
const ICO_FACES: [number, number, number][] = [];
for (let i = 0; i < ICO.length; i++)
  for (let j = i + 1; j < ICO.length; j++)
    for (let k = j + 1; k < ICO.length; k++) if (isEdge(i, j) && isEdge(j, k) && isEdge(i, k)) ICO_FACES.push([i, j, k]);

const BG: RGB = [10, 15, 28]; // page background: far parts fade toward it
const LIGHT2: [number, number] = [-0.6, -0.8]; // on-screen direction toward the light (upper left)
const LIGHT3: V3 = (() => { const v: V3 = [-0.45, -0.6, 0.66]; const l = Math.hypot(...v); return [v[0] / l, v[1] / l, v[2] / l]; })();

const RINGS: { r: number; tilt: [number, number]; speed: number; axis: "x" | "y"; w: number }[] = [
  { r: 0.42, tilt: [1.1, -0.55], speed: 0.3, axis: "y", w: 15 },
  { r: 0.35, tilt: [0.35, 0.95], speed: -0.42, axis: "x", w: 14 },
  { r: 0.28, tilt: [0.15, -1.25], speed: 0.56, axis: "y", w: 13 },
];
const BEADS = [
  { ring: 0, speed: 0.8, phase: 0.3, r: 10.5 },
  { ring: 1, speed: -1.1, phase: 2.4, r: 9.5 },
  { ring: 2, speed: 1.4, phase: 4.1, r: 8.5 },
];

// Colour palettes. Per ring: a shadow tone, a body tone and a soft light tone (no white).
// Change ACTIVE_PALETTE to switch. In development (npm run dev) add ?palette=ice to the URL to preview.
type Tone = { dark: RGB; mid: RGB; light: RGB };
type Palette = { rings: [Tone, Tone, Tone]; crystal: RGB };
const PALETTES: Record<string, Palette> = {
  // Champagne gold, deep cyan and violet: cool tones that suit navy, with gold echoing the warm particles.
  aurora: {
    rings: [
      { dark: [78, 55, 22], mid: [190, 146, 70], light: [236, 204, 142] },
      { dark: [6, 40, 66], mid: [24, 132, 176], light: [100, 196, 226] },
      { dark: [34, 20, 76], mid: [98, 76, 198], light: [166, 148, 238] },
    ],
    crystal: [226, 196, 140],
  },
  ice: {
    rings: [
      { dark: [38, 50, 78], mid: [138, 162, 204], light: [210, 224, 248] },
      { dark: [10, 44, 88], mid: [46, 128, 216], light: [140, 196, 246] },
      { dark: [28, 26, 84], mid: [94, 84, 212], light: [172, 166, 244] },
    ],
    crystal: [176, 204, 244],
  },
  champagne: {
    rings: [
      { dark: [88, 58, 20], mid: [208, 154, 62], light: [244, 208, 140] },
      { dark: [86, 44, 44], mid: [196, 116, 108], light: [240, 184, 170] },
      { dark: [8, 54, 62], mid: [34, 152, 152], light: [124, 214, 204] },
    ],
    crystal: [236, 190, 132],
  },
};
const ACTIVE_PALETTE = "aurora";
const requested = import.meta.env.DEV ? new URLSearchParams(window.location.search).get("palette") : null;
const PALETTE = PALETTES[requested ?? ""] ?? PALETTES[ACTIVE_PALETTE];

const SEGMENTS = 120;
const PERSPECTIVE = 0.35;

const rotX = (v: V3, a: number): V3 => { const c = Math.cos(a), s = Math.sin(a); return [v[0], v[1] * c - v[2] * s, v[1] * s + v[2] * c]; };
const rotY = (v: V3, a: number): V3 => { const c = Math.cos(a), s = Math.sin(a); return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c]; };
const rotZ = (v: V3, a: number): V3 => { const c = Math.cos(a), s = Math.sin(a); return [v[0] * c - v[1] * s, v[0] * s + v[1] * c, v[2]]; };
const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const css = (c: RGB, a = 1) => `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${a})`;
const shade = (c: RGB, d: number) => mix(BG, c, Math.min(1, Math.max(0, d))); // d: 1 = full colour, lower = faded into the background

type Item = { z: number; paint: () => void };

export default function HeroRings() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const view = { yaw: -0.25, pitch: 0.2 };
    const target = { yaw: -0.25, pitch: 0.2 };
    let size = 0, t = 2.2, last = 0, raf = 0, onScreen = true;

    const toView = (p: V3): V3 => rotX(rotY(p, view.yaw), view.pitch);
    const proj = (q: V3) => { const s = 1 / (1 - q[2] * PERSPECTIVE); return { x: size / 2 + q[0] * s * size, y: size / 2 + q[1] * s * size, z: q[2], s }; };
    const project = (p: V3) => proj(toView(p));

    const ringPoint = (i: number, theta: number): V3 => {
      const R = RINGS[i];
      let p: V3 = [R.r * Math.cos(theta), R.r * Math.sin(theta), 0];
      p = R.axis === "y" ? rotY(p, t * R.speed) : rotX(p, t * R.speed);
      return rotZ(rotX(p, R.tilt[0]), R.tilt[1]);
    };

    const frame = () => {
      if (size === 0) return; // not laid out yet
      const u = size / 520;
      ctx.clearRect(0, 0, size, size);
      ctx.lineJoin = "round";

      const back: Item[] = [], front: Item[] = [], shadows: Item[] = [];
      // ---- ring tubes: depth-sorted segments, each one a quad filled with a gradient across the tube ----
      // Using shared vertex normals and widths makes neighbouring segments join without seams, and the
      // gradient (shadow edge -> body -> soft light -> falling off at the rim) makes the ring read as a cylinder.
      RINGS.forEach((G, i) => {
        const T = PALETTE.rings[i];
        const N = SEGMENTS;
        const pts = Array.from({ length: N + 1 }, (_, k) => {
          const q = project(ringPoint(i, (k / N) * Math.PI * 2));
          return { ...q, f: (q.z / G.r + 1) / 2 };
        });
        const norm = Array.from({ length: N }, (_, k) => {
          const p = pts[(k - 1 + N) % N], q = pts[k + 1];
          const tx = q.x - p.x, ty = q.y - p.y, len = Math.hypot(tx, ty) || 1;
          return { x: -ty / len, y: tx / len };
        });
        const width = pts.slice(0, N).map((p) => G.w * u * (0.6 + 0.7 * p.f) * p.s);

        for (let n = 0; n < N; n++) {
          const a = pts[n], b = pts[n + 1];
          const m = (n + 1) % N;
          const na = norm[n], nb = norm[m], wa = width[n], wb = width[m];
          const f = (a.f + b.f) / 2;
          const w = (wa + wb) / 2;
          const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
          const ex = ((b.x - a.x) / len) * 0.5, ey = ((b.y - a.y) / len) * 0.5; // slight overlap hides hairline seams

          let mx = na.x + nb.x, my = na.y + nb.y;
          const ml = Math.hypot(mx, my) || 1; mx /= ml; my /= ml;
          const dot = mx * LIGHT2[0] + my * LIGHT2[1];
          const sign = dot >= 0 ? 1 : -1, facing = Math.abs(dot);
          const h = 0.5 + 0.35 * facing; // where the soft light band sits across the tube (0 = shadow side, 1 = light side)
          const d = Math.min(1, (0.5 + 0.5 * f) * (0.9 + 0.1 * facing));
          const cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2;
          const item: Item = {
            z: (a.z + b.z) / 2,
            paint: () => {
              const g = ctx.createLinearGradient(cx - mx * sign * (w / 2), cy - my * sign * (w / 2), cx + mx * sign * (w / 2), cy + my * sign * (w / 2));
              g.addColorStop(0, css(shade(T.dark, d)));
              g.addColorStop(h * 0.55, css(shade(mix(T.dark, T.mid, 0.75), d)));
              g.addColorStop(h, css(shade(mix(T.mid, T.light, 0.7), d)));
              g.addColorStop(h + (1 - h) * 0.55, css(shade(T.mid, d)));
              g.addColorStop(1, css(shade(mix(T.dark, T.mid, 0.55), d)));
              ctx.fillStyle = g;
              ctx.beginPath();
              ctx.moveTo(a.x + na.x * wa / 2 - ex, a.y + na.y * wa / 2 - ey);
              ctx.lineTo(b.x + nb.x * wb / 2 + ex, b.y + nb.y * wb / 2 + ey);
              ctx.lineTo(b.x - nb.x * wb / 2 + ex, b.y - nb.y * wb / 2 + ey);
              ctx.lineTo(a.x - na.x * wa / 2 - ex, a.y - na.y * wa / 2 - ey);
              ctx.closePath();
              ctx.fill();
            },
          };
          (f >= 0.5 ? front : back).push(item);
        }

        // Soft shadow of the near half. It is painted under ALL near parts (after the crystal), so it falls on the
        // crystal and the far parts only, as one continuous stroke: no seams or notches.
        const nearWidths = width.filter((_, k) => pts[k].f >= 0.5);
        if (nearWidths.length) {
          const wAvg = nearWidths.reduce((x, y) => x + y, 0) / nearWidths.length;
          const ox = -LIGHT2[0] * wAvg * 0.55, oy = -LIGHT2[1] * wAvg * 0.55;
          shadows.push({
            z: 0,
            paint: () => {
              ctx.lineCap = "butt"; ctx.lineWidth = wAvg * 1.05; ctx.strokeStyle = "rgba(3,6,16,0.2)";
              ctx.beginPath();
              let pen = false;
              for (let k = 0; k < N; k++) {
                if (pts[k].f >= 0.5 && pts[k + 1].f >= 0.5) {
                  if (!pen) { ctx.moveTo(pts[k].x + ox, pts[k].y + oy); pen = true; }
                  ctx.lineTo(pts[k + 1].x + ox, pts[k + 1].y + oy);
                } else pen = false;
              }
              ctx.stroke();
            },
          });
        }
      });

      // ---- beads (small matte spheres) riding on the rings ----
      for (const B of BEADS) {
        const G = RINGS[B.ring], T = PALETTE.rings[B.ring];
        const q = project(ringPoint(B.ring, B.phase + t * B.speed));
        const f = (q.z / G.r + 1) / 2;
        const rad = B.r * u * q.s * (0.8 + 0.4 * f);
        const d = 0.55 + 0.45 * f;
        const item: Item = {
          z: q.z + 0.001,
          paint: () => {
            const g = ctx.createRadialGradient(q.x + LIGHT2[0] * rad * 0.35, q.y + LIGHT2[1] * rad * 0.35, rad * 0.1, q.x, q.y, rad * 1.05);
            g.addColorStop(0, css(shade(T.light, d)));
            g.addColorStop(0.55, css(shade(T.mid, d)));
            g.addColorStop(1, css(shade(T.dark, d)));
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.arc(q.x, q.y, rad, 0, Math.PI * 2); ctx.fill();
          },
        };
        (f >= 0.5 ? front : back).push(item);
      }

      const run = (items: Item[]) => { items.sort((p, q) => p.z - q.z); for (const it of items) it.paint(); };

      // 1. far halves of the rings and far beads
      run(back);

      // 2. faceted crystal core: flat-shaded translucent facets, lit from the same direction
      const verts = ICO.map((v) => toView(rotX(rotY([v[0] * 0.092, v[1] * 0.092, v[2] * 0.092] as V3, t * 0.45), t * 0.3)));
      const proj3 = verts.map(proj);
      const faces = ICO_FACES.map(([i, j, k]) => {
        const p0 = verts[i], p1 = verts[j], p2 = verts[k];
        const e1: V3 = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]], e2: V3 = [p2[0] - p0[0], p2[1] - p0[1], p2[2] - p0[2]];
        let n: V3 = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
        const c: V3 = [(p0[0] + p1[0] + p2[0]) / 3, (p0[1] + p1[1] + p2[1]) / 3, (p0[2] + p1[2] + p2[2]) / 3];
        if (n[0] * c[0] + n[1] * c[1] + n[2] * c[2] < 0) n = [-n[0], -n[1], -n[2]];
        const nl = Math.hypot(...n) || 1;
        n = [n[0] / nl, n[1] / nl, n[2] / nl];
        return { idx: [i, j, k], n, z: c[2], lit: Math.max(0, n[0] * LIGHT3[0] + n[1] * LIGHT3[1] + n[2] * LIGHT3[2]) };
      }).sort((p, q) => p.z - q.z);
      for (const F of faces) {
        const facingViewer = F.n[2] > 0;
        const tone = mix(BG, PALETTE.crystal, 0.22 + 0.78 * F.lit);
        ctx.beginPath();
        F.idx.forEach((vi, n) => (n ? ctx.lineTo(proj3[vi].x, proj3[vi].y) : ctx.moveTo(proj3[vi].x, proj3[vi].y)));
        ctx.closePath();
        ctx.fillStyle = css(tone, facingViewer ? 0.62 : 0.2);
        ctx.fill();
        ctx.lineWidth = Math.max(0.8, 1.1 * u);
        ctx.strokeStyle = css(mix(tone, PALETTE.crystal, 0.5), facingViewer ? 0.55 : 0.18);
        ctx.stroke();
      }

      // 3. shadows of the near rings, then the near halves of the rings and near beads
      for (const sh of shadows) sh.paint();
      run(front);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      size = canvas.clientWidth;
      canvas.width = canvas.height = Math.round(size * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      frame();
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      t += dt;
      view.yaw += (target.yaw - view.yaw) * 0.05;
      view.pitch += (target.pitch - view.pitch) * 0.05;
      frame();
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      cancelAnimationFrame(raf);
      if (motion.matches || document.hidden || !onScreen) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    // The scene leans slightly toward the pointer.
    const onMove = (e: PointerEvent) => {
      if (!Number.isFinite(e.clientX) || !Number.isFinite(e.clientY)) return;
      target.yaw = -0.25 + (e.clientX / window.innerWidth - 0.5) * 0.7;
      target.pitch = 0.2 + (e.clientY / window.innerHeight - 0.5) * 0.5;
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; start(); });
    io.observe(canvas);
    const onMotionChange = () => { start(); if (motion.matches) frame(); };

    resize();
    start();
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("visibilitychange", start);
    motion.addEventListener("change", onMotionChange);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", start);
      motion.removeEventListener("change", onMotionChange);
    };
  }, []);

  return <canvas ref={ref} className="hero-rings" aria-hidden="true" />;
}
