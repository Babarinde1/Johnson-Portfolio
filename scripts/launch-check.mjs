// npm run launch-check: lists what is still unfinished before going live.
import fs from "node:fs";
import path from "node:path";

function readEnvFile(file) {
  if (!fs.existsSync(file)) return {};
  return Object.fromEntries(fs.readFileSync(file, "utf8").split(/\r?\n/).map((l) => l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)).filter(Boolean).map((m) => [m[1], m[2]]));
}
const env = { ...readEnvFile(".env"), ...readEnvFile(".env.production"), ...process.env };
const todo = [];
const ok = [];
const need = (cond, good, bad) => (cond ? ok : todo).push(cond ? good : bad);

need(env.VITE_SITE_URL, "Site URL set", "Set VITE_SITE_URL (sitemap, canonical and share tags need it)");
need(env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY, "Supabase URL and anon key set", "Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (without them the site shows only the built-in project list)");
need(env.VITE_CONTACT_EMAIL, "Contact email set", "Set VITE_CONTACT_EMAIL (the Contact page has no way to reach you without it)");
need(env.VITE_LINKEDIN_URL, "LinkedIn link set", "Set VITE_LINKEDIN_URL (GitHub is already linked)");
need(fs.existsSync("public/Johnson-Pedia-Resume.pdf"), "Resume PDF present", "Add public/Johnson-Pedia-Resume.pdf");
need(fs.existsSync("public/portrait.jpg"), "Portrait photo present", "Add public/portrait.jpg (about 640x800) so the About page shows your photo instead of a monogram");
need(fs.existsSync("public/og-image.png"), "Share image present", "Add public/og-image.png (1200x630)");

// Draft/developer wording that must not reach visitors
const phrases = [/PORTRAIT GOES HERE/, /before launch/i, /Verify publication/i, /should be verified/i, /Only verified details and measured results should be added/, /full case study should be expanded/i, /needs to be configured/i];
const hits = [];
(function walk(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p);
    else if (/\.(tsx?|css)$/.test(f.name)) fs.readFileSync(p, "utf8").split("\n").forEach((line, i) => { const re = phrases.find((x) => x.test(line)); if (re) { const at = line.search(re); hits.push(`${p}:${i + 1}  ...${line.slice(Math.max(0, at - 30), at + 70).trim()}...`); } });
  }
})("src");
if (hits.length) todo.push(`Replace ${hits.length} draft/developer note(s) that visitors would see:\n      ` + hits.join("\n      "));
else ok.push("No draft notes found in source");

console.log("\nLaunch check\n");
ok.forEach((m) => console.log("  [x] " + m));
todo.forEach((m) => console.log("  [ ] " + m));
console.log(todo.length ? `\n${todo.length} item(s) to resolve before launch.\n` : "\nReady for launch.\n");
process.exit(todo.length ? 1 : 0);
