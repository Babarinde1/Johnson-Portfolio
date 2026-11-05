# Phase 13: contact form, realistic rings, review fixes

## Fixed
- **Contact form layout.** The form borrowed its styles from `admin.css`, which now loads only with the lazy-loaded admin screen, so on the public site the form appeared unstyled. It now has its own public styles in `src/styles/contact.css`: labels above fields, name and email side by side on wide screens, a stacked layout on phones, visible focus, and a clear error/success message.
- **Contact page copy.** Replaced "goes directly to the admin inbox" with visitor-friendly wording, and added a short privacy line explaining the details are stored privately to reply.
- **Admin "Total views".** It showed at most 500 because it counted only the rows it loaded. It now asks the database for the true total.
- **Name/email autofill** hints added to the form (`autocomplete`).

## Hero rings (rebuilt)
Matte and physical, no glow and no shine: each ring is shaded like a real cylinder, rings are depth-sorted so they pass in front of and behind each other, near parts cast a soft shadow, the core is a faceted crystal lit from the same direction, and small matte beads travel along the rings. Reduced-motion visitors get a still frame. Colours are in `PALETTES` in `src/components/ui/HeroRings.tsx` (aurora is the default; ice and champagne are alternatives; preview with `?palette=ice` under `npm run dev`).

## Reviewed, no change needed
- RLS policies in migrations 002 to 007: admin is restricted by user id; visitors can only insert contact messages and page views and read published content.
- No `dangerouslySetInnerHTML`, `eval` or unsafe `target="_blank"` links; no service-role key or JWT in the built bundle.
- Accessibility (axe, WCAG 2.1 AA) on all nine routes: 0 violations. Content-Security-Policy from `netlify.toml` tested on all routes: no violations.

## Known and accepted
- `npm audit` reports two moderate findings in `react-router` 6 (an open redirect that needs a visitor-controlled address passed to `<Link>`, and a server-rendering issue). This site uses neither. The fix is a major upgrade to v7, which is a larger change and is not included.
- Contact spam protection is browser-side only (honeypot and timing). A server-verified CAPTCHA is the stronger option, as noted in `PHASE12.md`.
- Link previews on WhatsApp, LinkedIn and X use the home-page tags for every page.
