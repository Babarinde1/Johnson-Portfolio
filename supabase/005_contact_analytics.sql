-- Phase 11: contact inbox + privacy-minimal page analytics
-- Run once, after 004_site_content.sql, in the SAME Supabase project.

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 100),
  email text not null check (char_length(email) between 5 and 254),
  subject text not null check (char_length(subject) between 3 and 160),
  message text not null check (char_length(message) between 10 and 5000),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.contact_messages enable row level security;
drop policy if exists "Public can submit contact messages" on public.contact_messages;
create policy "Public can submit contact messages" on public.contact_messages
  for insert to anon, authenticated with check (true);
drop policy if exists "Portfolio admin reads contact messages" on public.contact_messages;
create policy "Portfolio admin reads contact messages" on public.contact_messages
  for select to authenticated using (auth.uid() = 'REPLACE_WITH_ADMIN_USER_ID'::uuid);
drop policy if exists "Portfolio admin updates contact messages" on public.contact_messages;
create policy "Portfolio admin updates contact messages" on public.contact_messages
  for update to authenticated using (auth.uid() = 'REPLACE_WITH_ADMIN_USER_ID'::uuid)
  with check (auth.uid() = 'REPLACE_WITH_ADMIN_USER_ID'::uuid);
grant insert on public.contact_messages to anon, authenticated;
grant select, update on public.contact_messages to authenticated;

-- Counts only route views; no IP addresses, cookies, fingerprints, or personal identifiers.
create table if not exists public.page_views (
  id bigint generated always as identity primary key,
  path text not null check (char_length(path) between 1 and 200),
  viewed_at timestamptz not null default now()
);
alter table public.page_views enable row level security;
drop policy if exists "Public can record page views" on public.page_views;
create policy "Public can record page views" on public.page_views
  for insert to anon, authenticated with check (path !~* '(admin|token|password)');
drop policy if exists "Portfolio admin reads page views" on public.page_views;
create policy "Portfolio admin reads page views" on public.page_views
  for select to authenticated using (auth.uid() = 'REPLACE_WITH_ADMIN_USER_ID'::uuid);
grant insert on public.page_views to anon, authenticated;
grant select on public.page_views to authenticated;
