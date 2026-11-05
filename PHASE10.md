# Phase 10 — Site Content CMS

This phase extends the existing project CMS with editable public-site content: homepage headline and introduction, About introduction, profile portrait URL/upload, resume PDF URL, contact email, professional profile URLs, and skill names/categories/self-assessed percentages. The public homepage, About page, Resume page, and animated skills section read the public settings from Supabase and fall back to safe defaults when no settings row exists.

## Supabase setup
1. Open `supabase/004_site_content.sql`.
2. Replace `REPLACE_WITH_ADMIN_USER_ID` with the same Auth User UID used in `002_harden.sql` and `003_project_image_storage.sql`. Keep the UUID inside the quotes.
3. Copy the entire SQL file into Supabase SQL Editor and click Run.
4. Confirm `site_content` appears in Table Editor and its RLS is enabled.
5. Ensure the public image bucket from migration 003 exists. Profile images reuse that bucket and the same admin-only upload policy.

## Use the CMS
1. Start the app with `npm install` and `npm run dev`.
2. Sign in at `/admin`.
3. Use **Profile, links & skills** to edit homepage copy, About introduction, portrait, resume URL, contact email, and social links.
4. Edit skills using one line per item: `Name|Category|Percentage`. Values must be whole numbers from 0 to 100.
5. Click **Save site content**.

## Notes
- The skills percentages are self-assessed presentation values, not standardized test scores. Verify them before publishing.
- The resume field accepts an HTTPS URL. Upload the PDF to a trusted public host or add a dedicated private/admin-only PDF storage workflow in a later phase.
- Public site content is intentionally readable by anonymous visitors. Never store API keys, credentials, private notes, or sensitive data in it.
- Profile images are uploaded into the existing public-read bucket. Upload/update/delete permissions remain governed by the Storage RLS policies from migration 003.
- If the settings table is empty or unavailable, the site continues using built-in defaults.
