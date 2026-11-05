-- Run in Supabase SQL Editor AFTER schema.sql and 002_harden.sql.
-- Replace the UUID below with the same admin User UID used in 002_harden.sql.
-- This creates a public-read image bucket; only the allowlisted admin can upload,
-- replace, or delete objects. Public read is required for portfolio image URLs.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio-project-images',
  'portfolio-project-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view portfolio project images" on storage.objects;
create policy "Public can view portfolio project images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'portfolio-project-images');

drop policy if exists "Portfolio admin uploads project images" on storage.objects;
create policy "Portfolio admin uploads project images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'portfolio-project-images'
    and auth.uid() = 'REPLACE_WITH_ADMIN_USER_ID'::uuid
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Portfolio admin updates project images" on storage.objects;
create policy "Portfolio admin updates project images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'portfolio-project-images'
    and auth.uid() = 'REPLACE_WITH_ADMIN_USER_ID'::uuid
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'portfolio-project-images'
    and auth.uid() = 'REPLACE_WITH_ADMIN_USER_ID'::uuid
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Portfolio admin deletes project images" on storage.objects;
create policy "Portfolio admin deletes project images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'portfolio-project-images'
    and auth.uid() = 'REPLACE_WITH_ADMIN_USER_ID'::uuid
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Note: the bucket is public so published image URLs can load without a login.
-- Upload/update/delete remain protected by the policies above.
