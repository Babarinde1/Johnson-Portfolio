-- Phase 12: database-side validation and query indexes.
-- Run once in the SAME Supabase project, after migrations 002 through 006.
-- Does not require or expose the service-role key.

create index if not exists contact_messages_created_at_idx
  on public.contact_messages (created_at desc);
create index if not exists page_views_viewed_at_idx
  on public.page_views (viewed_at desc);
create index if not exists projects_public_listing_idx
  on public.projects (featured desc, updated_at desc)
  where visibility = 'published';

-- Additional constraints complement the browser's form validation.
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'contact_messages_email_format_check') then
    alter table public.contact_messages
      add constraint contact_messages_email_format_check
      check (email = btrim(email) and email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'contact_messages_name_trim_check') then
    alter table public.contact_messages
      add constraint contact_messages_name_trim_check
      check (name = btrim(name) and subject = btrim(subject) and message = btrim(message));
  end if;
end $$;

-- Explicitly keep anonymous access insert-only for the contact inbox and analytics.
revoke all on public.contact_messages from anon;
grant insert on public.contact_messages to anon;
revoke all on public.page_views from anon;
grant insert on public.page_views to anon;

-- Public project reads remain governed by the published-only RLS policy from 002_harden.sql.
