// Runs before every build (npm "prebuild"). Writes public/robots.txt and, when
// VITE_SITE_URL is set, public/sitemap.xml with the static pages and project slugs.
import fs from "node:fs";

function readEnvFile(file) {
  if (!fs.existsSync(file)) return {};
  return Object.fromEntries(
    fs.readFileSync(file, "utf8").split(/\r?\n/)
      .map((l) => l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)).filter(Boolean)
      .map((m) => [m[1], m[2].replace(/^["']|["']$/g, "")]),
  );
}
const env = { ...readEnvFile(".env"), ...readEnvFile(".env.production"), ...process.env };
const site = (env.VITE_SITE_URL || "").replace(/\/$/, "");

const lines = ["User-agent: *", "Allow: /", "Disallow: /admin"];
if (site) lines.push(`Sitemap: ${site}/sitemap.xml`);
fs.writeFileSync("public/robots.txt", lines.join("\n") + "\n");

if (!site) {
  console.warn("[seo] VITE_SITE_URL is not set: wrote robots.txt only, skipped sitemap.xml.");
  process.exit(0);
}

const slugs = new Set([...fs.readFileSync("src/features/projects/project.data.ts", "utf8").matchAll(/slug:\s*"([a-z0-9-]+)"/g)].map((m) => m[1]));
if (env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY) {
  try {
    const res = await fetch(`${env.VITE_SUPABASE_URL.replace(/\/$/, "")}/rest/v1/projects?select=slug&visibility=eq.published`, {
      headers: { apikey: env.VITE_SUPABASE_ANON_KEY }, signal: AbortSignal.timeout(8000),
    });
    if (res.ok) { const rows = await res.json(); if (rows.length) { slugs.clear(); rows.forEach((r) => /^[a-z0-9-]+$/.test(r.slug) && slugs.add(r.slug)); } }
  } catch { console.warn("[seo] Could not read published slugs from Supabase; using the static list."); }
}

const paths = ["/", "/projects", "/lab", "/about", "/resume", "/contact", ...[...slugs].map((s) => `/projects/${s}`)];
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map((p) => `  <url><loc>${site}${p}</loc></url>`).join("\n")}\n</urlset>\n`;
fs.writeFileSync("public/sitemap.xml", xml);
console.log(`[seo] Wrote sitemap.xml with ${paths.length} URLs.`);
