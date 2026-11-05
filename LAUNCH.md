# Launch checklist

Run `npm run launch-check` at any time to see what is still open.

## 1. Supabase (once)
1. Run `supabase/schema.sql`, then `supabase/002_harden.sql`, then `supabase/003_project_image_storage.sql`, in the SQL Editor.
   - In `002_harden.sql`, replace `REPLACE_WITH_ADMIN_USER_ID` with the admin's **User UID** (Authentication > Users). The script fails on purpose if you leave the placeholder.
2. Create the admin user manually. Turn **off** public sign-ups (Authentication > Providers/Sign In).
3. Put `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env` and in Netlify. Never use the service-role key here.\n4. In `003_project_image_storage.sql`, replace `REPLACE_WITH_ADMIN_USER_ID` with the same Auth User UID used in `002_harden.sql` before running it.

## 2. Test the permissions from the outside
```bash
VITE_SUPABASE_URL=... VITE_SUPABASE_ANON_KEY=... \
ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run verify-rls
```
Every line must say PASS. Do not deploy the CMS until it does. (This script has not been run against your live project yet; it needs your credentials.)

## 3. Content you must confirm
- Contact email, LinkedIn link: `.env` / Netlify variables.
- Resume PDF: add `public/Johnson-Pedia-Resume.pdf`.
- Share image: replace `public/og-image.png` (1200x630) if you want your own design.
- Real portrait photo (the About page still shows a labelled placeholder).
- Draft wording that visitors would currently see: `launch-check` lists each line (project notes, About placeholder, case-study boilerplate).
- Project facts: statuses, the IJERT publication details, any metrics, and links.
- Tone-restoration results: publish only with the evaluation split, metric definitions and checkpoint.
- Which of your GitHub repositories to show: run `npm run sync-github`, review `github-repos.md`.

## 4. Deploy
Set `VITE_SITE_URL` (your real address) in Netlify, deploy, then check `/sitemap.xml`, `/robots.txt`, and each page title.

## Known limits
- Social link previews (WhatsApp, LinkedIn, X) read only the static tags in `index.html`, so every page shows the home-page preview. Per-project previews need pre-rendering, a later improvement.
- The admin session is kept in the browser tab (cleared when the tab closes). Use a strong admin password and enable Supabase MFA if available.
- Project cover images can be uploaded from `/admin` to the public-read `portfolio-project-images` bucket. Upload, update and delete are restricted by Storage RLS to the configured admin UID. JPG, PNG, WebP and AVIF are accepted up to 5 MB.
