# Phase 11 — Contact inbox, analytics and sharing readiness

## Included
- Contact page form writes visitor messages to Supabase.
- Admin dashboard includes an inbox with read/unread controls.
- Privacy-minimal route analytics records page paths and timestamps only; no IPs or fingerprints.
- Existing page metadata and social preview defaults remain in place.

## Database setup
1. Confirm Phase 10 migration `004_site_content.sql` has been run successfully.
2. Open the SAME Supabase project and SQL Editor.
3. Open `supabase/005_contact_analytics.sql`, replace BOTH occurrences of `REPLACE_WITH_ADMIN_USER_ID` with the administrator Auth user UUID, then run it once.
4. Do not rerun earlier migrations. Do not expose a service-role key.

## Local test
1. Merge these files into your Phase 10 project (or use this complete ZIP).
2. Ensure `.env` has `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and optionally `VITE_SITE_URL` / `VITE_CONTACT_EMAIL`.
3. Run `npm install`, then `npm run dev`.
4. Submit a test message from `/contact`; sign in at `/admin` and verify it appears in Contact Inbox. Mark it read and refresh.
5. Visit public routes, then refresh Admin and confirm page view counts change.

## Important
Analytics are intentionally lightweight and are not a substitute for a full analytics platform. Contact messages contain personal information supplied by visitors; protect admin access, do not share inbox screenshots publicly, and define a retention/deletion practice before launch. This phase has not been live-tested against your Supabase project.

## Resume PDF upload from your computer
- In Admin → Site Content, use **Choose resume PDF from this computer**. The file picker accepts PDF files up to 10 MB.
- After upload, click **Save site content**. The public Resume page will use the uploaded PDF URL for its Download PDF action.
- Run `supabase/006_resume_pdf_upload.sql` once in the same Supabase project after migration `003_project_image_storage.sql`. This updates the existing storage bucket's allowed MIME types and size limit; it does not create a new bucket or widen upload permissions.
