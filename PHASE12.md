# Phase 12 — Production Readiness

This phase hardens the Phase 11 portfolio for a real deployment. It is a practical readiness pass, not a claim of a completed penetration test or a guarantee against abuse.

## Included

- Route-level code splitting: public pages and the admin screen load as separate chunks.
- Contact form bot friction: hidden honeypot field, minimum completion time, duplicate-submit guard, existing input limits and validation.
- Database hardening migration: indexes for common listings, additional contact-field constraints, and explicit anonymous insert-only grants for contact messages and page-view analytics.
- Accessibility: retained skip link, visible keyboard focus, route-change focus management, and reduced-motion support.
- SEO/deployment checks: existing canonical/sitemap generation, robots exclusion for `/admin`, Netlify SPA fallback and security headers retained.
- Launch checklist and security notes.

## Install

1. Unzip this complete project over your local project folder (keep a backup of `.env` and your personal assets first).
2. Keep the existing environment variables; never put a Supabase service-role key in any `VITE_*` variable.
3. In Supabase SQL Editor, run `supabase/007_production_hardening.sql` once, after migrations `002`–`006` have been applied successfully.
4. Run `npm install` and `npm run build`.
5. Run `npm run launch-check` and resolve each item it reports.
6. Deploy the `dist` folder using the existing Netlify configuration.

## Important spam-protection limitation

The honeypot and minimum completion-time check reduce simple automated submissions, but browser-only checks can be bypassed. For stronger production protection, put a server-verified CAPTCHA (for example Cloudflare Turnstile) in front of contact inserts using a Supabase Edge Function or another server endpoint. Keep the verification secret server-side. Do not place CAPTCHA secrets or Supabase service-role keys in frontend environment variables.

## Before launch — manual verification

- Confirm Supabase RLS is enabled on `projects`, `site_content`, `contact_messages`, and `page_views`.
- Confirm only the intended admin UUID can read/update CMS data and inbox records.
- Confirm anonymous users can read only published projects and submit contact messages; they must not read inbox messages or analytics.
- Test project create/edit/publish/archive and confirm published projects appear on the public site.
- Test resume PDF and project-image uploads with allowed and rejected file types/sizes.
- Test contact form on desktop and mobile; verify messages appear in the admin inbox.
- Test keyboard-only navigation, focus visibility, reduced-motion preference, and form error announcements.
- Verify production environment variables, domain, sitemap, robots.txt, resume, portrait, and social links.
- Inspect the browser console and Network panel for failed requests and missing assets.

## Security reminders

- Supabase anon/publishable key is expected in the browser; RLS is the security boundary.
- Never ship the Supabase service-role key or admin password in source code.
- Keep `/admin` protected by Supabase Auth and database RLS; hiding the route is not authorization.
- Set production secrets in the hosting provider's environment settings, not in committed files.
- This release has not been tested against the owner's live Supabase project or hosting account.
