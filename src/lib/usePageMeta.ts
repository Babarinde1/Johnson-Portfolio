import { useEffect } from "react";

const SITE = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, "");

function setTag(attr: "name" | "property", key: string, value: string | null) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (value === null) { el?.remove(); return; }
  if (!el) { el = document.createElement("meta"); el.setAttribute(attr, key); document.head.appendChild(el); }
  el.setAttribute("content", value);
}

// Per-route title, description, canonical URL and share tags.
// Note: social crawlers mostly don't run JavaScript, so link previews use the
// defaults in index.html; search engines that render JS pick these up.
export function usePageMeta(title: string, description: string, opts: { noindex?: boolean } = {}) {
  useEffect(() => {
    const full = title === "Home" ? "Johnson Pedia | AI/ML Engineer" : `${title} | Johnson Pedia`;
    const url = (SITE ?? window.location.origin) + window.location.pathname;
    document.title = full;
    setTag("name", "description", description);
    setTag("property", "og:title", full);
    setTag("property", "og:description", description);
    setTag("property", "og:url", url);
    setTag("name", "robots", opts.noindex ? "noindex, nofollow" : null);
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) { link = document.createElement("link"); link.rel = "canonical"; document.head.appendChild(link); }
    link.href = url;
  }, [title, description, opts.noindex]);
}
