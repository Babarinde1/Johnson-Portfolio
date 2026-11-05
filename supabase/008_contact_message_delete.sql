-- Phase 14: allow the authenticated portfolio administrator to delete inbox messages.
-- Run once in the SAME Supabase project, after migrations 005 and 007.
-- Replace the UUID below with the administrator's Supabase Auth user ID.

drop policy if exists "Portfolio admin deletes contact messages" on public.contact_messages;
create policy "Portfolio admin deletes contact messages"
  on public.contact_messages
  for delete
  to authenticated
  using (auth.uid() = 'REPLACE_WITH_ADMIN_USER_ID'::uuid);

grant delete on public.contact_messages to authenticated;
