# Johnson Pedia Portfolio

React + Vite + TypeScript portfolio. Navy night-sky theme with a glowing particle field, glass cards, and a 3D ring hero.

## Run locally

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # sitemap/robots + typecheck + production build
npm run preview      # serve the production build
npm run launch-check # what is still unfinished before going live
npm run verify-rls   # test your live Supabase permissions (see LAUNCH.md)
npm run sync-github  # list your GitHub repos and draft project entries
```

## How content works

- **Public pages** read published rows from Supabase. If Supabase is not configured, unreachable, or has no published rows yet, they fall back to the built-in list in `src/features/projects/project.data.ts`, so the site is never empty.
- **/admin** is a private editor (Supabase Auth). Data is protected by Row Level Security in the database, not by hiding the URL. Project cover images can be uploaded to Supabase Storage after running `supabase/003_project_image_storage.sql`.
- **Contact details** come from environment variables (`.env.example`). Blank means nothing is shown. GitHub defaults to https://github.com/Babarinde1.
- **Resume download** appears only when `public/Johnson-Pedia-Resume.pdf` exists at build time.
- **SEO**: each page sets its own title, description and canonical URL; `robots.txt` and `sitemap.xml` are generated before each build from `VITE_SITE_URL`.

## Theme files

`src/styles/cosmic.css` (navy + warm glow) and `glass.css` (particles, translucent cards) can be deleted, with their `@import` lines in `global.css`, to return to the earlier teal look. Ring colours are in `src/components/ui/HeroRings.tsx`.

## Deploy

Netlify: build command `npm run build`, publish directory `dist`. Add the variables from `.env.example` under Site settings, Environment variables. `netlify.toml` sets SPA routing, security headers (including a Content Security Policy) and asset caching. See `LAUNCH.md` for the full checklist.


## Phase 10 — Site Content CMS
See [PHASE10.md](./PHASE10.md) and run `supabase/004_site_content.sql` after the earlier migrations. This adds editable homepage/About copy, portrait URL and upload, resume URL, contact/social links, and the animated skills list.


## Phase 11
See `PHASE11.md` for the contact inbox, privacy-minimal analytics, and migration setup.
