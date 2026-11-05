// npm run sync-github            (optionally: -- --user=Babarinde1)
// Lists your public GitHub repositories and drafts project entries for the ones you choose.
// It only WRITES github-repos.md for you to review; it never changes the website.
// Set GITHUB_TOKEN (a read-only token is enough) if you hit GitHub's rate limit.
// GITHUB_FIXTURE=file.json reads a saved API response instead (for offline testing).
import fs from "node:fs";

const user = process.argv.find((a) => a.startsWith("--user="))?.split("=")[1] || "Babarinde1";

async function fetchRepos() {
  if (process.env.GITHUB_FIXTURE) return JSON.parse(fs.readFileSync(process.env.GITHUB_FIXTURE, "utf8"));
  const headers = { Accept: "application/vnd.github+json", "User-Agent": "portfolio-sync", ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}) };
  const all = [];
  for (let page = 1; page <= 5; page++) {
    const res = await fetch(`https://api.github.com/users/${user}/repos?per_page=100&page=${page}&sort=pushed`, { headers, signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`GitHub API ${res.status}: ${(await res.json().catch(() => ({}))).message ?? res.statusText}`);
    const rows = await res.json();
    all.push(...rows);
    if (rows.length < 100) break;
  }
  return all;
}

const esc = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

let repos;
try { repos = await fetchRepos(); } catch (e) { console.error(`Could not read GitHub: ${e.message}`); process.exit(1); }

const own = repos.filter((r) => !r.fork && r.name.toLowerCase() !== user.toLowerCase()).sort((a, b) => (b.pushed_at || "").localeCompare(a.pushed_at || ""));
const forks = repos.filter((r) => r.fork);

let md = `# GitHub repositories for ${user}\n\n${own.length} original repositories, ${forks.length} forks (forks and the profile README repo are excluded from the table).\n\n`;
md += "| Repository | Language | Last push | Live site | Description |\n|---|---|---|---|---|\n";
for (const r of own) md += `| [${esc(r.name)}](${r.html_url}) | ${esc(r.language) || "n/a"} | ${(r.pushed_at || "").slice(0, 10)} | ${r.homepage ? esc(r.homepage) : ""} | ${esc(r.description)} |\n`;
md += "\n## Draft entries\n\nCopy the ones you want into `src/features/projects/project.data.ts` (or add them in /admin), then fill in the `TODO` fields yourself. Only the facts GitHub reports are filled in.\n\n```ts\n";
for (const r of own) {
  md += `{\n  slug: "${slugify(r.name)}",\n  title: "${r.name.replace(/[-_]+/g, " ")}",\n  category: "TODO",\n  status: "TODO", // Live | Completed | Research | In Progress\n  summary: ${JSON.stringify(r.description || "TODO")},\n  description: "TODO",\n  technologies: ${JSON.stringify(r.language ? [r.language] : [])},\n  featured: false,\n  repositoryUrl: "${r.html_url}",${/^https:\/\//.test(r.homepage || "") ? `\n  liveUrl: "${r.homepage}",` : ""}\n},\n`;
}
md += "```\n";
fs.writeFileSync("github-repos.md", md);
console.log(`Wrote github-repos.md (${own.length} repositories to review).`);
