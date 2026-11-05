# Phase 14 — Inbox controls and interactive tech atmosphere

This phase continues from the supplied Phase 13 contact-rings ZIP.

## Included

- Added a delete action to every contact inbox message in `/admin`.
- The UI asks for confirmation before permanent deletion and updates the inbox immediately after Supabase confirms the delete.
- Added `supabase/008_contact_message_delete.sql` to grant the authenticated portfolio administrator delete access through Row Level Security.
- Updated the canvas particle field so particles respond to both pointer position and pointer travel direction, with a short-lived directional current and soft radial ripple.
- Added a restrained futuristic visual layer: subtle HUD grid, moving ambient aurora, cyan/violet luminous accents, glass-card depth, sheen, and more tactile hover motion.
- Kept reduced-motion support and mobile layout adjustments.

## Supabase migration

Run `supabase/008_contact_message_delete.sql` once in the existing Supabase project after migrations 005 and 007 have been applied.

Replace `REPLACE_WITH_ADMIN_USER_ID` with the administrator's actual Supabase Auth user UUID. Do not use the email address. The policy is scoped to that one authenticated user.

The migration adds a DELETE policy and grants DELETE on `public.contact_messages` to the authenticated role. It does not grant anonymous users delete access.

## Test checklist

1. Sign in at `/admin`.
2. Open Contact Inbox and delete a test message; confirm the prompt.
3. Verify the message disappears after deletion and remains absent after refreshing.
4. Verify an unauthenticated visitor cannot delete a contact message.
5. Move the mouse slowly and quickly across the public site; particles should drift away and briefly flow with the pointer's direction.
6. Test on a narrow screen and with the operating system's reduced-motion preference enabled.
7. Run `npm install`, `npm run typecheck`, `npm run build`, `npm run security-check`, and `npm run launch-check`.

## Notes

The delete operation is permanent. The browser confirmation is an accidental-deletion safeguard, not a substitute for database authorization. Supabase RLS remains the security boundary.
