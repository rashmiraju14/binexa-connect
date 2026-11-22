# Members-only Discussion Board — setup and verification

Prepared November 21, 2026. **Not yet activated on the hosted database.**

## What is implemented

The existing protected `/discussions` page now loads persistent threads through `/api/discussions`. Members can create threads, reply (including replies to replies), edit/delete their own contributions, like/unlike posts and replies, report content, search, filter nine categories, browse latest/popular/pinned discussions, and choose a public display name. Administrators can publish announcements, pin/unpin, lock/unlock, hide/restore/remove content, restrict/restore member access, and review/resolve reports. Destructive author deletes require confirmation. Moderator actions require a recorded reason.

The existing Google/email login, header, server route guards, Discord membership integration, and public-page access have not been changed. The database supports all existing authenticated, non-anonymous accounts; Discord verification is not an additional requirement.

## Existing project and migration

- Project: `Binexa-healthcare-connect`, reference `higsmfwztdljumgqczfi`.
- Existing schema inspected read-only: `public.community_members` is a Discord identity mapping, not a public profile table. It is left unchanged.
- New migration: `supabase/migrations/20261121171423_live_member_discussions.sql`.
- No production migration, new project, test user, administrator grant, or demonstration post has been created.

**Approval required before applying this migration to the hosted project.** The user brief explicitly says: “Do not apply migrations to the production Supabase database without explicit approval.”

After approval, apply exactly this migration, using Supabase's migration tool or its SQL Editor in the verified project. The file is transactional and includes its own grants, RLS, functions, triggers, and schema-cache notification. Do not rerun already-applied historic migrations or add a second copy of this migration. Preserve the migration in version control for future environments. Take the project's normal backup before a production schema change.

## Tables and security model

| Location | Purpose | Browser permission |
|---|---|---|
| `public.discussion_profiles` | Random community profile ID, display name, permitted Google avatar, timestamps | Member-only SELECT |
| `public.discussions` | Threads, categories, author profile, visibility, pin/lock state | Visible content SELECT for active members; hidden content for admins |
| `public.discussion_replies` | Threaded replies and visibility | SELECT follows thread/reply authorization |
| `public.discussion_reactions` | One like per member per post/reply | SELECT follows content authorization |
| `public.discussion_reports` | Report reasons and review status | Reporter or administrator only |
| `discussion_private.identities` | Private Auth ID → public profile mapping, admin/restriction state | No direct access |
| `discussion_private.requests` | Idempotency receipts and server posting-rate checks | No direct access |
| `discussion_private.moderation_log` | Administrator, target, action, reason, timestamp | Database operators only |

RLS is enabled on every new table. Anonymous roles have no table or RPC access. Direct member INSERT/UPDATE/DELETE is revoked on every new table; checked RPCs are the only write path. Public RPC wrappers use invoker security. Narrow definer implementations are in an unexposed private schema with an empty search path and revoked default execution grants. Every operation checks the current authenticated account, its current Auth session, and restrictions; author identity always comes from the database session. Browser-supplied authors/admin flags have no effect. Administrator privileges come from the private identity table, never editable JWT user metadata.

Public profile IDs are separate from Supabase Auth IDs. Responses contain no member email addresses, telephone numbers, or Auth IDs. Profile photos are limited to permitted Google image hosts. Content is plain text, HTML-like tags are rejected, and React renders text without `dangerouslySetInnerHTML`. The API rejects cross-origin writes and oversized streamed bodies, revalidates the signed-in user for every request, uses uncached private responses, and does not reveal database diagnostics.

A per-account database lock serializes idempotency/rate checks: at most 30 successful mutations/minute, five discussions/hour, and 60 replies/hour. A request ID cannot be reused with a different payload. Retrying an uncertain network save reuses its request ID. Likes and open reports have uniqueness indexes. Reply parent foreign keys enforce the same discussion; deleting a thread cascades to its replies/reactions/reports. Deleting an individual reply preserves other members’ nested replies by clearing their parent link.

## Realtime

Database triggers call `realtime.send` on private topic `binexa:discussions`, event `changed`. Messages contain `{}` only: no post text, profile data, Auth IDs, or deleted-row payloads. A restrictive topic/membership SELECT policy on `realtime.messages` authorizes receipt; clients have no send policy from this migration. Discussion tables are not added to public Postgres Changes.

The client subscribes once per mounted view, refreshes through the authenticated API after notifications, updates its Realtime token on token refresh, and removes channels/listeners/timers on cleanup. It also refetches every 15 seconds while visible and on window focus/network restoration. Errors do not pretend a save succeeded. Sign-out clears loaded data and aborts in-flight requests; deleted/revoked Auth sessions lose database access even with an unexpired token. A restricted member might retain an already authorized socket until reconnection, but it receives only empty invalidations and cannot refetch protected data.

The existing hosted project had no other `realtime.messages` policies during inspection. If policies have changed before application, review them: permissive policies combine with OR and must not unintentionally authorize this topic.

## Administrator setup (manual, trusted operator only)

No account is promoted automatically. After the migration is applied, the intended administrator must sign in and visit `/discussions` once to create their community profile. A trusted database operator can then run the following in the project's SQL Editor, replacing the placeholder with the **verified intended administrator's Auth user UUID** from Supabase Auth. Never use an ID supplied by an untrusted browser or member.

```sql
begin;
update discussion_private.identities
set is_admin = true, restricted = false
where user_id = 'REPLACE_WITH_VERIFIED_ADMIN_AUTH_UUID'::uuid
returning profile_id, is_admin;
-- Expect exactly ONE row. If zero, have that account visit Discussions first.
commit;
```

Reload Discussions to see the moderation queue and announcement category. To revoke an administrator, set `is_admin=false` for the verified account. To restore a restricted member without a working administrator, a trusted operator can set `restricted=false` for the verified identity. Review moderation records using a privileged database connection; never grant browsers access to the private schema or service-role key.

Idempotency receipts older than 30 days can be pruned by an operator:

```sql
delete from discussion_private.requests
where created_at < now() - interval '30 days';
```

This does not delete discussions. Backups and retention requirements should govern moderation-log retention.

## Required hosted acceptance test after application

Use two separately signed-in, real member accounts and one signed-out browser. No real member credentials are needed in source code or chat.

1. Confirm homepage/public pages do not open Sign In automatically. Signed-out Discussions clicks open the existing popup; closing it stays on the public page. Direct board/thread URLs cannot display member content; `/api/discussions` returns 401 without authentication.
2. Member A publishes a thread. Member B sees it and replies. Member A receives the update without reloading. Disconnect Realtime and verify the 15-second/focus fallback.
3. Both members like the thread; each count reflects database state. Remove a like. Refresh, close/reopen, and sign out/in: thread/replies/reactions remain saved.
4. A edits/deletes only A's content. Direct RPC attempts by B to edit/delete A's post, impersonate A, publish an announcement, or moderate must fail. Anonymous REST/RPC calls must fail. A's report must be invisible to B and visible to the administrator.
5. Test administrator pin/lock/hide/remove, report resolution, and member restriction. Revoke a session and confirm its old token no longer reads or writes board data.
6. Confirm desktop/tablet/mobile layout, composers, filters, real counts, empty/loading/error states, and sign-out clearing the board. Keep all test contributions clearly labeled and remove them afterward with the owning account or administrator.

**Do not call this a live shared board until the hosted migration, genuine multi-account persistence, and actual Supabase Realtime have passed these checks.**

## Checks completed locally

- All 69 repository unit tests passed, including API authentication, origin/body validation, safe errors, existing Google/email callback behavior, route guards, and regressions for unrelated pages.
- Isolated PostgreSQL (PGlite) applied the actual migration. Separate member JWT identities exercised persistence after database restart, shared replies, ownership/impersonation denial, private reports, reactions, moderation, anonymous rejection, revoked sessions, idempotency, and database posting limits. Auth and Realtime infrastructure in that test are minimal test-only schemas, not the hosted Supabase services.
- Browser UI fixture checks covered post/reply/edit/like/report forms, search/category filtering, empty/setup-required states, and desktop/tablet/mobile overflow. Fixture data was used only in `/tmp`, never in the live board.
- TypeScript checking, scoped ESLint, and the Next.js production build passed.
- The hosted migration and two real account/Realtime checks remain pending approval and execution.

## Exact product files for the Discussion Board

Modified:
- `app/(community-site)/discussions/page.tsx`
- `components/DiscussionBoard.tsx`

Added:
- `app/(community-site)/discussions/[id]/page.tsx`
- `app/api/discussions/route.ts`
- `components/discussions/Shared.tsx`
- `components/discussions/ThreadView.tsx`
- `components/discussions/board.module.css`
- `lib/discussions/shared.ts`
- `lib/discussions/use-board.ts`
- `supabase/migrations/20261121171423_live_member_discussions.sql`
- `supabase/tests/discussions.mjs`
- `tests/discussions-api.test.mjs`
- `DISCUSSIONS_SETUP.md`

Separately requested YouTube-button update (not discussion behavior):
- `lib/events.ts`
- `components/events/EventsMedia.tsx`
- `tests/events-media.test.mjs`

No new Discussion Board or YouTube-button changes have been committed, pushed, or deployed.

## Repeat checks

```sh
node --test tests/*.test.mjs
node node_modules/eslint/bin/eslint.js components/DiscussionBoard.tsx components/discussions lib/discussions app/api/discussions 'app/(community-site)/discussions' tests/discussions-api.test.mjs supabase/tests/discussions.mjs
```

For isolated database tests, install `@electric-sql/pglite@0.3.14` in a temporary directory (outside this repository), then run from the repository root:

```sh
PGLITE_MODULE=/absolute/path/to/temp/node_modules/@electric-sql/pglite/dist/index.js node supabase/tests/discussions.mjs
```

The script creates its own temporary database and fabricated test identities. It never connects to the configured Supabase project. No project dependency or authentication settings need to change.

Local board: http://localhost:3100/discussions (existing sign-in required).
