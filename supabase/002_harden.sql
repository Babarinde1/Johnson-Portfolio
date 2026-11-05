-- Run once in the Supabase SQL Editor AFTER schema.sql. Safe to re-run.
-- 1) Replace REPLACE_WITH_ADMIN_USER_ID with the admin's user id
--    (Supabase dashboard > Authentication > Users > copy the "User UID").
--    Keep the quotes. If you leave the placeholder, the script fails on purpose.

-- Admin by user id (stronger than matching an email claim).
drop policy if exists "Portfolio owner manages projects" on public.projects;
create policy "Portfolio owner manages projects" on public.projects
  for all to authenticated
  using (auth.uid() = 'REPLACE_WITH_ADMIN_USER_ID'::uuid)
  with check (auth.uid() = 'REPLACE_WITH_ADMIN_USER_ID'::uuid);

-- Server-side data rules. NOT VALID checks new and changed rows only, so
-- existing rows are never blocked; run "validate constraint" later if you want.
alter table public.projects drop constraint if exists projects_slug_format;
alter table public.projects add constraint projects_slug_format
  check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$') not valid;

alter table public.projects drop constraint if exists projects_https_urls;
alter table public.projects add constraint projects_https_urls check (
  (live_url is null or live_url = '' or live_url ~* '^https://') and
  (repository_url is null or repository_url = '' or repository_url ~* '^https://') and
  (cover_image_url is null or cover_image_url = '' or cover_image_url ~* '^https://')
) not valid;

alter table public.projects drop constraint if exists projects_length_limits;
alter table public.projects add constraint projects_length_limits check (
  char_length(title) <= 120 and char_length(summary) <= 300 and char_length(description) <= 5000
) not valid;

-- updated_at is set by the database, not trusted from the browser.
create or replace function public.set_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at before update on public.projects
  for each row execute function public.set_updated_at();

-- Anonymous visitors: read only. Nothing else.
revoke insert, update, delete on public.projects from anon;
