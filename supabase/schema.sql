-- Run in the Supabase SQL Editor. Review before production use.
create extension if not exists pgcrypto;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text not null default 'AI / Machine Learning',
  status text not null default 'In Progress' check (status in ('Live','Completed','Research','In Progress')),
  summary text not null default '',
  description text not null default '',
  technologies text[] not null default '{}',
  featured boolean not null default false,
  visibility text not null default 'draft' check (visibility in ('draft','published','archived')),
  live_url text,
  repository_url text,
  cover_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.projects enable row level security;
-- Anonymous visitors can only read published projects.
create policy "Public can read published projects" on public.projects
  for select to anon, authenticated using (visibility = 'published');
-- Signed-in users can manage content only if their JWT email is explicitly allowlisted.
-- Replace the example email with the portfolio owner's admin email before enabling this policy.
create policy "Portfolio owner manages projects" on public.projects
  for all to authenticated
  using ((auth.jwt() ->> 'email') = 'REPLACE_WITH_ADMIN_EMAIL')
  with check ((auth.jwt() ->> 'email') = 'REPLACE_WITH_ADMIN_EMAIL');

grant select on public.projects to anon, authenticated;
grant insert, update, delete on public.projects to authenticated;

-- Important:
-- 1) Replace REPLACE_WITH_ADMIN_EMAIL in the policy with the actual admin email.
-- 2) Create the admin account manually in Supabase Authentication; do not enable public sign-up.
-- 3) This starter uses image URLs. If you later add Supabase Storage uploads, create and test
--    separate storage.objects policies allowing only the same admin to upload/delete.
