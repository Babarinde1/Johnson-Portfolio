-- Run in the SAME Supabase project after 003_project_image_storage.sql.
-- Extends the existing public portfolio storage bucket to accept resume PDFs.
-- Upload permissions remain restricted by the admin-only storage policies from migration 003.

update storage.buckets
set file_size_limit = 10485760,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'application/pdf']
where id = 'portfolio-project-images';

-- This migration intentionally does not change the bucket's public-read setting
-- or grant any additional upload permissions.
