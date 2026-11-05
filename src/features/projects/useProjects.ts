import { useEffect, useState } from "react";
import { projects as staticProjects, type Project, type ProjectStatus } from "./project.data";
import { cmsConfigured, fetchPublishedProjects, type CmsProject } from "../../lib/supabase-rest";
import { safeHttpUrl } from "../../lib/safeUrl";

// Source of truth: published rows from Supabase. If the CMS is not configured,
// unreachable, or has no published rows yet, the static list is used so the
// site is never empty.
const STATUSES: ProjectStatus[] = ["Live", "Completed", "Research", "In Progress"];

function fromCms(row: CmsProject): Project {
  return {
    slug: row.slug,
    title: row.title,
    category: row.category,
    status: STATUSES.includes(row.status as ProjectStatus) ? (row.status as ProjectStatus) : "In Progress",
    summary: row.summary,
    description: row.description,
    technologies: row.technologies ?? [],
    featured: row.featured,
    liveUrl: safeHttpUrl(row.live_url),
    repositoryUrl: safeHttpUrl(row.repository_url),
    coverImageUrl: safeHttpUrl(row.cover_image_url),
  };
}

let cache: Project[] | null = null;
let inflight: Promise<Project[]> | null = null;

// Call after admin-side project changes so the next public-page visit fetches fresh rows.
export function invalidateProjectsCache() {
  cache = null;
  inflight = null;
}

function load(): Promise<Project[]> {
  if (cache) return Promise.resolve(cache);
  if (!cmsConfigured()) return Promise.resolve(staticProjects);
  inflight ??= fetchPublishedProjects()
    .then((rows) => (cache = rows.length ? rows.map(fromCms) : staticProjects))
    .catch(() => (cache = staticProjects));
  return inflight;
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>(cache ?? staticProjects);
  const [loaded, setLoaded] = useState(cache !== null || !cmsConfigured());
  useEffect(() => {
    let active = true;
    load().then((list) => { if (active) { setProjects(list); setLoaded(true); } });
    return () => { active = false; };
  }, []);
  return { projects, loaded };
}
