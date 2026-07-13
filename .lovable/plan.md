
# Collaboration v1

Build a lean, opinionated collaboration layer around Velora's existing dashboard, reports, and goals. Everything is one-click where possible; admins control who can do what.

## Scope

Ship these nine capabilities as a single coherent feature:

1. **Organizations** — every user belongs to at least one; solo users get a personal org auto-created on first login.
2. **Team Members** — invite by email, remove, transfer ownership.
3. **Roles** — three fixed roles: `owner`, `admin`, `member`. No custom roles in v1 (keeps it simple).
4. **Permissions** — enforced in the database via a security-definer `has_org_role()` helper + RLS. Client hides UI it can't use.
5. **Comments** — attach to any dashboard card, report, or goal (polymorphic: `subject_type` + `subject_id`).
6. **Mentions** — `@name` picker in the comment composer; creates notifications for the mentioned user.
7. **Shared Dashboards** — the dashboard, reports, and goals become org-scoped by default. Anyone in the org sees the same data. A "Personal / Team" switch in the header toggles between the user's personal org and their team org.
8. **Task Assignments** — a Decision or Recommendation can be assigned to a member with a due date; shows on their "My tasks" list.
9. **Activity Feed** — one denormalized `activity_events` table records every meaningful action (invited, joined, commented, assigned, approved, changed goal). Feed lives at `/team`.
10. **Approval Requests** — any member can propose an action (e.g. "increase Meta Ads budget by 20%"); admins/owners approve or reject in one click.

Cut from v1 (explicitly): custom roles, per-object ACLs, real-time typing indicators, threaded comments, file uploads in comments, email digests of activity.

## Data model

New tables (all under `public`, RLS on, GRANT to `authenticated` + `service_role`):

- `organizations` — id, name, slug, created_by, created_at.
- `org_memberships` — org_id, user_id, role (`owner`|`admin`|`member`), invited_by, joined_at. PK (org_id, user_id).
- `org_invites` — id, org_id, email, role, invited_by, token, expires_at, accepted_at.
- `comments` — id, org_id, subject_type (`decision`|`report`|`goal`|`dashboard`), subject_id, author_id, body, created_at.
- `mentions` — comment_id, mentioned_user_id (fanout table for fast unread queries).
- `tasks` — id, org_id, title, description, assignee_id, assigner_id, subject_type, subject_id, due_date, status (`open`|`done`|`cancelled`), created_at.
- `approval_requests` — id, org_id, requester_id, title, rationale, subject_type, subject_id, status (`pending`|`approved`|`rejected`), decided_by, decided_at, decision_note, created_at.
- `activity_events` — id, org_id, actor_id, verb (`invited`|`joined`|`commented`|`mentioned`|`assigned`|`completed_task`|`requested_approval`|`approved`|`rejected`|`updated_goal`), subject_type, subject_id, summary (denormalized plain-English sentence), created_at.

Existing `profiles`, `metric_snapshots`, `weekly_reports`, `account_connections` gain an `org_id` column and org-scoped RLS. Migration backfills each row into the owner's personal org.

Security helper:

```sql
create or replace function public.has_org_role(_org uuid, _user uuid, _min_role text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.org_memberships m
    where m.org_id = _org and m.user_id = _user
      and case _min_role
        when 'owner'  then m.role = 'owner'
        when 'admin'  then m.role in ('owner','admin')
        else true
      end
  );
$$;
```

RLS pattern for every org-scoped table:
- SELECT: `has_org_role(org_id, auth.uid(), 'member')`
- INSERT/UPDATE/DELETE: `has_org_role(org_id, auth.uid(), 'admin')` for admin-only actions; member for own comments/tasks.

## Server functions

Under `src/lib/collab/*.functions.ts`, all `.middleware([requireSupabaseAuth])`:

- `listMyOrgs`, `getActiveOrg`, `setActiveOrg` (stored in `profiles.active_org_id`).
- `inviteMember`, `revokeInvite`, `acceptInvite`, `removeMember`, `updateMemberRole`.
- `listComments`, `postComment` (parses `@handle` → mentions), `deleteComment`.
- `listTasks`, `createTask`, `updateTaskStatus`, `assignTask`.
- `listApprovals`, `requestApproval`, `decideApproval`.
- `listActivity` (paged).

Every write also inserts one `activity_events` row via a shared helper — the feed is never derived on read.

## UI surfaces

Three new routes plus small additions to existing pages:

- `/team` — Members tab · Invites tab · Activity feed tab · Approvals tab. Admin-only controls are hidden for members.
- `/team/settings` — org name, transfer ownership, delete org (owner only).
- `/tasks` — "My tasks" (assigned to me) + "Assigned by me". Inline complete/reassign.

Existing pages gain a compact **CommentThread** component (collapsed by default under each Decision card, Goal card, and Report). The dashboard gets an org switcher in `AppHeader` (dropdown next to the account menu). Decision cards get an "Assign" and "Request approval" button next to "I'll do this".

Mention picker: lightweight — types `@`, opens a popover listing org members, arrow keys to pick. No rich text editor; plain text + rendered `@name` chips.

## Files

New:
- `supabase/migrations/<ts>_collab.sql` — all tables, RLS, helper, backfill.
- `src/features/collab/types.ts`
- `src/features/collab/OrgSwitcher.tsx`
- `src/features/collab/MembersTable.tsx`
- `src/features/collab/InviteDialog.tsx`
- `src/features/collab/CommentThread.tsx`
- `src/features/collab/MentionPicker.tsx`
- `src/features/collab/ActivityFeed.tsx`
- `src/features/collab/TaskList.tsx`
- `src/features/collab/ApprovalList.tsx`
- `src/lib/collab/orgs.functions.ts`
- `src/lib/collab/members.functions.ts`
- `src/lib/collab/comments.functions.ts`
- `src/lib/collab/tasks.functions.ts`
- `src/lib/collab/approvals.functions.ts`
- `src/lib/collab/activity.functions.ts`
- `src/routes/_authenticated/team.tsx`
- `src/routes/_authenticated/team.settings.tsx`
- `src/routes/_authenticated/tasks.tsx`
- `src/routes/invite.$token.tsx` (public — accept invite; prompts sign-in if needed)

Edited:
- `src/components/layout/AppHeader.tsx` — add Team + Tasks nav + OrgSwitcher.
- `src/features/decisions/DecisionCard.tsx` — Assign / Request approval / Comments trigger.
- `src/features/goals/GoalCard.tsx` — Comments trigger.
- `src/routes/_authenticated/reports.$id.tsx` — Comments panel.

## Guardrails

- Admins-only actions gated in both server functions (`has_org_role(..., 'admin')`) and UI (hidden buttons).
- Every org-scoped table's RLS is scoped through `has_org_role()` — never through direct membership subqueries (avoids the recursion class of bugs).
- Invitations use a signed random token; expires in 7 days; accepting requires being signed in as the invited email OR any signed-in user if the invite has no email lock (v1: email-locked only).
- Personal org is never deletable and never invitable — enforced by a boolean `is_personal` column.
- Activity feed writes go through one helper; if it fails, the action still succeeds (fire-and-forget insert, logged server-side).

## Build order

1. Migration: tables + RLS + `has_org_role` + backfill personal orgs + `active_org_id` on profiles.
2. Org switcher + `/team` Members tab + invite/accept flow.
3. Comments + mentions on Decisions, Goals, Reports.
4. Tasks + assignment on Decisions; `/tasks` route.
5. Approvals on Decisions; Approvals tab.
6. Activity feed tab.

Ship as one PR — the feature only makes sense whole.
