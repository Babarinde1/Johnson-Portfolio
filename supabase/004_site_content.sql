-- Run after 002_harden.sql and 003_project_image_storage.sql.
-- Replace the UUID below with the portfolio administrator's Supabase Auth User UID.
create table if not exists public.site_content (
  key text primary key check (key = 'public'),
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.site_content enable row level security;
drop policy if exists "Public can read public site content" on public.site_content;
create policy "Public can read public site content" on public.site_content
  for select to anon, authenticated using (key = 'public');
drop policy if exists "Portfolio admin manages site content" on public.site_content;
create policy "Portfolio admin manages site content" on public.site_content
  for all to authenticated
  using (auth.uid() = 'REPLACE_WITH_ADMIN_USER_ID'::uuid)
  with check (auth.uid() = 'REPLACE_WITH_ADMIN_USER_ID'::uuid);
grant select on public.site_content to anon, authenticated;
grant insert, update, delete on public.site_content to authenticated;
-- Public content only: do not store secrets, private notes, or credentials in this table.
