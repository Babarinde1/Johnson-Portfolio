import { safeHttpUrl } from "./safeUrl";
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "");
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const SESSION_KEY = "jp_admin_session";

export type AdminSession = {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  user: { id?: string; email?: string };
};
export type CmsProject = {
  id?: string;
  title: string;
  slug: string;
  category: string;
  status: string;
  summary: string;
  description: string;
  technologies: string[];
  featured: boolean;
  visibility: "draft" | "published" | "archived";
  live_url?: string;
  repository_url?: string;
  cover_image_url?: string;
  updated_at?: string;
};

export function cmsConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}
export function getSession(): AdminSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AdminSession) : null;
  } catch {
    return null;
  }
}
function saveSession(session: AdminSession | null) {
  if (session) sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else sessionStorage.removeItem(SESSION_KEY);
}
async function request(path: string, init: RequestInit = {}, token?: string) {
  if (!cmsConfigured())
    throw new Error(
      "CMS is not configured. Add the Supabase URL and anon key to your local .env file.",
    );
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    signal: init.signal ?? AbortSignal.timeout(10000),
    ...init,
    headers: {
      apikey: SUPABASE_ANON_KEY!,
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  });
  const body = await response.text();
  if (!response.ok) {
    let message = body || `Request failed (${response.status})`;
    try {
      const parsed = JSON.parse(body);
      message =
        parsed.msg ||
        parsed.message ||
        parsed.error_description ||
        parsed.error ||
        message;
    } catch {
      /* plain text */
    }
    throw new Error(message);
  }
  return body ? JSON.parse(body) : null;
}
export async function signIn(email: string, password: string) {
  const session = (await request("/auth/v1/token?grant_type=password", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })) as AdminSession & { expires_in?: number };
  if (session.expires_in)
    session.expires_at = Math.floor(Date.now() / 1000) + session.expires_in;
  saveSession(session);
  return session;
}
export function signOut() {
  saveSession(null);
}

export async function uploadProjectImage(file: File): Promise<string> {
  const allowed: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/avif": "avif",
  };
  const extension = allowed[file.type];
  if (!extension) throw new Error("Choose a JPG, PNG, WebP, or AVIF image.");
  if (file.size > 5 * 1024 * 1024)
    throw new Error("Image must be 5 MB or smaller.");

  const token = await accessToken();
  const session = getSession();
  if (!session?.user?.id)
    throw new Error("Your session is missing a user ID. Please sign in again.");

  const objectPath = `${session.user.id}/${crypto.randomUUID()}.${extension}`;
  const response = await fetch(
    `${SUPABASE_URL}/storage/v1/object/portfolio-project-images/${objectPath.split("/").map(encodeURIComponent).join("/")}`,
    {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${token}`,
        "Content-Type": file.type,
        "Cache-Control": "max-age=3600",
        "x-upsert": "false",
      },
      body: file,
      signal: AbortSignal.timeout(30000),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    let message = body || `Image upload failed (${response.status}).`;
    try {
      const parsed = JSON.parse(body);
      message = parsed.message || parsed.error || parsed.statusCode || message;
    } catch {
      /* keep response text */
    }
    throw new Error(message);
  }

  return `${SUPABASE_URL}/storage/v1/object/public/portfolio-project-images/${objectPath
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}
// Returns a valid access token, refreshing it shortly before it expires.
async function accessToken(): Promise<string> {
  const session = getSession();
  if (!session) throw new Error("Please sign in again.");
  const now = Math.floor(Date.now() / 1000);
  if (!session.expires_at || session.expires_at - now > 60)
    return session.access_token;
  try {
    const next = (await request("/auth/v1/token?grant_type=refresh_token", {
      method: "POST",
      body: JSON.stringify({ refresh_token: session.refresh_token }),
    })) as AdminSession & { expires_in?: number };
    if (next.expires_in)
      next.expires_at = Math.floor(Date.now() / 1000) + next.expires_in;
    saveSession(next);
    return next.access_token;
  } catch {
    saveSession(null);
    throw new Error("Your session expired. Please sign in again.");
  }
}

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
// Mirrors the database constraints in supabase/002_harden.sql so people get a clear message first.
export function validateProject(p: CmsProject): string | null {
  if (!p.title.trim()) return "Title is required.";
  if (p.title.length > 120) return "Title must be 120 characters or fewer.";
  if (!SLUG_RE.test(p.slug))
    return "The URL slug may only contain lowercase letters, numbers and single hyphens.";
  if (p.summary.length > 300) return "Summary must be 300 characters or fewer.";
  if (p.description.length > 5000)
    return "Description must be 5000 characters or fewer.";
  const urls: [string, string | undefined][] = [
    ["Live URL", p.live_url],
    ["Repository URL", p.repository_url],
    ["Cover image URL", p.cover_image_url],
  ];
  for (const [label, value] of urls)
    if (value && !safeHttpUrl(value))
      return `${label} must be a valid https:// address.`;
  return null;
}

// Public read: anonymous visitors only ever receive published rows (enforced by RLS).
export async function fetchPublishedProjects() {
  return (await request(
    "/rest/v1/projects?select=id,title,slug,category,status,summary,description,technologies,featured,live_url,repository_url,cover_image_url,updated_at&visibility=eq.published&order=featured.desc,updated_at.desc",
  )) as CmsProject[];
}
export async function listCmsProjects() {
  const token = await accessToken();
  return (await request(
    "/rest/v1/projects?select=*&order=updated_at.desc",
    {},
    token,
  )) as CmsProject[];
}
export async function saveCmsProject(project: CmsProject) {
  const problem = validateProject(project);
  if (problem) throw new Error(problem);
  const token = await accessToken();
  const payload = {
    ...project,
    live_url: project.live_url || null,
    repository_url: project.repository_url || null,
    cover_image_url: project.cover_image_url || null,
    updated_at: new Date().toISOString(),
  };
  if (project.id) {
    const { id, ...updates } = payload;
    await request(
      `/rest/v1/projects?id=eq.${encodeURIComponent(id!)}`,
      {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify(updates),
      },
      token,
    );
  } else {
    const { id: _id, ...insert } = payload;
    await request(
      "/rest/v1/projects",
      {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify(insert),
      },
      token,
    );
  }
}
export async function deleteCmsProject(id: string) {
  const token = await accessToken();
  await request(
    `/rest/v1/projects?id=eq.${encodeURIComponent(id)}`,
    { method: "DELETE", headers: { Prefer: "return=minimal" } },
    token,
  );
}

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
};
export async function submitContactMessage(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const clean = {
    name: input.name.trim(),
    email: input.email.trim(),
    subject: input.subject.trim(),
    message: input.message.trim(),
  };
  if (clean.name.length < 2 || clean.name.length > 100)
    throw new Error("Name must be between 2 and 100 characters.");
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email) ||
    clean.email.length > 254
  )
    throw new Error("Enter a valid email address.");
  if (clean.subject.length < 3 || clean.subject.length > 160)
    throw new Error("Subject must be between 3 and 160 characters.");
  if (clean.message.length < 10 || clean.message.length > 5000)
    throw new Error("Message must be between 10 and 5000 characters.");
  await request("/rest/v1/contact_messages", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(clean),
  });
}
export async function listContactMessages(): Promise<ContactMessage[]> {
  const token = await accessToken();
  return (await request(
    "/rest/v1/contact_messages?select=*&order=created_at.desc&limit=100",
    {},
    token,
  )) as ContactMessage[];
}
export async function setContactMessageRead(id: string, is_read: boolean) {
  const token = await accessToken();
  await request(
    `/rest/v1/contact_messages?id=eq.${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ is_read }),
    },
    token,
  );
}
export async function deleteContactMessage(id: string) {
  const token = await accessToken();
  await request(
    `/rest/v1/contact_messages?id=eq.${encodeURIComponent(id)}`,
    { method: "DELETE", headers: { Prefer: "return=minimal" } },
    token,
  );
}
export async function recordPageView(path: string) {
  if (!cmsConfigured() || path.startsWith("/admin")) return;
  try {
    await request("/rest/v1/page_views", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ path: path.slice(0, 200) }),
    });
  } catch {
    /* Analytics must never interrupt page navigation. */
  }
}
export async function fetchAnalytics(): Promise<{
  total: number;
  recent: { path: string; viewed_at: string }[];
}> {
  const token = await accessToken();
  const rows = (await request(
    "/rest/v1/page_views?select=path,viewed_at&order=viewed_at.desc&limit=500",
    {},
    token,
  )) as { path: string; viewed_at: string }[];
  // The list is capped at 500 rows, so ask the database for the true total separately.
  let total = rows.length;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/page_views?select=path&limit=1`,
      {
        method: "HEAD",
        headers: {
          apikey: SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${token}`,
          Prefer: "count=exact",
        },
        signal: AbortSignal.timeout(10000),
      },
    );
    const count = Number(res.headers.get("content-range")?.split("/")[1]);
    if (res.ok && Number.isFinite(count)) total = count;
  } catch {
    /* fall back to the number of rows loaded */
  }
  return { total, recent: rows };
}

export type SiteContent = {
  hero_title: string;
  hero_intro: string;
  about_intro: string;
  portrait_url: string;
  resume_url: string;
  contact_email: string;
  linkedin_url: string;
  github_url: string;
  huggingface_url: string;
  skills: { name: string; category: string; value: number }[];
};
export const defaultSiteContent: SiteContent = {
  hero_title:
    "Building useful intelligence for language, knowledge, and the real world.",
  hero_intro:
    "I’m Babarinde Johnson Omotayo — a developer exploring practical AI systems, language technology, and tools that turn complex problems into useful experiences.",
  about_intro:
    "My background began in Food Science, where structured problem-solving and attention to process mattered. Over time, Python became a practical way to explore data, automation, and machine learning—and I began building projects across language AI, document intelligence, and computer vision.",
  portrait_url: "",
  resume_url: "",
  contact_email: "",
  linkedin_url: "",
  github_url: "https://github.com/Babarinde1",
  huggingface_url: "",
  skills: [
    { name: "Python", category: "Programming", value: 90 },
    { name: "JavaScript", category: "Programming", value: 80 },
    { name: "CSS", category: "Frontend", value: 80 },
    { name: "React.js", category: "Frontend", value: 70 },
    { name: "PyTorch", category: "Machine learning", value: 82 },
    { name: "Deep Learning", category: "Machine learning", value: 78 },
    { name: "Computer Vision", category: "AI specialties", value: 76 },
    {
      name: "Natural Language Processing",
      category: "AI specialties",
      value: 85,
    },
  ],
};
export async function fetchSiteContent(): Promise<SiteContent> {
  if (!cmsConfigured()) return defaultSiteContent;
  try {
    const rows = (await request(
      "/rest/v1/site_content?select=content&key=eq.public",
      {},
      undefined,
    )) as { content: Partial<SiteContent> }[];
    return rows[0]?.content
      ? { ...defaultSiteContent, ...rows[0].content }
      : defaultSiteContent;
  } catch {
    return defaultSiteContent;
  }
}
export async function saveSiteContent(content: SiteContent) {
  const token = await accessToken();
  const urls: [string, string][] = [
    ["Portrait URL", content.portrait_url],
    ["Resume URL", content.resume_url],
    ["LinkedIn URL", content.linkedin_url],
    ["GitHub URL", content.github_url],
    ["Hugging Face URL", content.huggingface_url],
  ];
  for (const [label, value] of urls)
    if (value && !safeHttpUrl(value))
      throw new Error(`${label} must be a valid https:// address.`);
  if (
    content.contact_email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(content.contact_email)
  )
    throw new Error("Enter a valid contact email address.");
  if (!content.hero_title.trim() || !content.hero_intro.trim())
    throw new Error("Homepage headline and introduction are required.");
  await request(
    "/rest/v1/site_content?on_conflict=key",
    {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({
        key: "public",
        content,
        updated_at: new Date().toISOString(),
      }),
    },
    token,
  );
}
export async function uploadResumePdf(file: File): Promise<string> {
  if (
    file.type !== "application/pdf" ||
    !file.name.toLowerCase().endsWith(".pdf")
  ) {
    throw new Error("Choose a PDF file for your resume.");
  }
  if (file.size > 10 * 1024 * 1024)
    throw new Error("Resume PDF must be 10 MB or smaller.");
  const token = await accessToken();
  const session = getSession();
  if (!session?.user?.id) throw new Error("Please sign in again.");
  const objectPath = `${session.user.id}/resume-${crypto.randomUUID()}.pdf`;
  const encodedPath = objectPath.split("/").map(encodeURIComponent).join("/");
  const response = await fetch(
    `${SUPABASE_URL}/storage/v1/object/portfolio-project-images/${encodedPath}`,
    {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/pdf",
        "Cache-Control": "max-age=3600",
        "x-upsert": "false",
      },
      body: file,
      signal: AbortSignal.timeout(30000),
    },
  );
  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Resume upload failed (${response.status}).`);
  }
  return `${SUPABASE_URL}/storage/v1/object/public/portfolio-project-images/${encodedPath}`;
}

export async function uploadProfileImage(file: File): Promise<string> {
  const allowed: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/avif": "avif",
  };
  const extension = allowed[file.type];
  if (!extension) throw new Error("Choose a JPG, PNG, WebP, or AVIF image.");
  if (file.size > 5 * 1024 * 1024)
    throw new Error("Image must be 5 MB or smaller.");
  const token = await accessToken();
  const session = getSession();
  if (!session?.user?.id) throw new Error("Please sign in again.");
  const objectPath = `${session.user.id}/profile-${crypto.randomUUID()}.${extension}`;
  const response = await fetch(
    `${SUPABASE_URL}/storage/v1/object/portfolio-project-images/${objectPath.split("/").map(encodeURIComponent).join("/")}`,
    {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${token}`,
        "Content-Type": file.type,
        "Cache-Control": "max-age=3600",
        "x-upsert": "false",
      },
      body: file,
      signal: AbortSignal.timeout(30000),
    },
  );
  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      body || `Profile image upload failed (${response.status}).`,
    );
  }
  return `${SUPABASE_URL}/storage/v1/object/public/portfolio-project-images/${objectPath.split("/").map(encodeURIComponent).join("/")}`;
}
