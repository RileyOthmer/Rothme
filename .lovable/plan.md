# Rothme — One-plan pricing + role-based access

## Business rules to enforce

- One plan only: **Rothme Pro — $200/month**.
- No access before Stripe confirms payment; full access after.
- Two roles: **Admin** and **Customer**. Everything in the app is unlocked for any active-subscription customer. Admin is a superset with the `/admin` surface added.
- Admin role is granted **only in the database** (via the migration tool or a SQL query). No frontend claim flow, no self-promotion endpoint.

## 1. Strip every "tier / upgrade / premium" surface

Files to edit or delete (already surveyed):

- **Delete** `src/routes/pricing.tsx` if it renders a comparison table; replace with a single-plan page that shows "$200/month" and one Subscribe CTA (kept because unauthenticated visitors still need a way to start checkout).
- **`src/routes/_authenticated/settings.billing.tsx`** — remove any remaining "Upgrade" / "Pro" language; label the plan simply "Rothme — $200/month".
- **`src/routes/_authenticated/onboarding.subscription.tsx`** — remove the plan-comparison card if present; leave a single confirm-and-subscribe screen.
- **`src/routes/checkout.tsx`, `checkout.return.tsx`** — replace remaining "Pro" wording with "Rothme".
- **`src/features/dashboard/ProWelcome.tsx`** — rename to `SubscriberWelcome`, remove "Pro" wording.
- **`src/components/RequirePro.tsx`** — already a passthrough; delete the file and replace its two import sites (`dev-center.tsx`, `analytics.tsx`) with the children directly.
- Grep for "premium", "Pro", "Upgrade", "tier", "plan comparison" and remove any remaining copy.

## 2. Role model

- Keep the existing `user_roles` table + `app_role` enum + `has_role` security-definer function. Already correct.
- Everyone signed in with an active subscription is a Customer implicitly — no DB row needed.
- Admins have an explicit `('admin')` row in `user_roles`. **Granted only via SQL** — no UI, no server function to self-grant.
- **Migration**: drop the `claimFirstAdmin` server function; the frontend no longer exposes a way to become admin.

## 3. Access control for `/admin/*`

- Keep the `_authenticated/admin.tsx` layout gate (`useIsAdmin`).
- Replace the "not found" fallback with an explicit **403 Access Denied** panel (title, short message, "Back to dashboard" button). No claim button.
- Every admin server function (`listAdminCredentials`, `upsertAdminCredential`, `deleteAdminCredential`, `getUserStats`, `getRevenueStats`, `getConnectionsHealth`, `getSystemHealth`) already calls `assertAdmin(context.userId)` — verify and add it to any new ones.
- Sidebar `Admin Console` link stays hidden for non-admins (already the case via `useIsAdmin`).

## 4. Admin dashboard — what to build now vs defer

The spec lists ~20 metrics. Only some have real data sources in this project today. I'll build the ones I can populate with real data and mark the rest as "Coming soon" cards so the layout is complete but never shows fake numbers.

**Built with real data (from Supabase / Stripe):**

- Total Users — `auth.users` count (already in `getUserStats`)
- Recent User Signups — last 10 signups (already in `getUserStats`)
- Active Subscribers — `subscriptions.status in ('active','trialing')`
- Monthly Recurring Revenue — active subs * $200
- Annual Recurring Revenue — MRR * 12
- Churn Rate (30d) — canceled in last 30d ÷ active-at-start-of-window
- Subscription Cancellations — recent `subscriptions` with `cancel_at_period_end=true` or `canceled_at not null`
- Stripe Revenue — `getStripeData`-style read for the last 30d of paid invoices (server fn, admin-gated)
- Connected Integrations — `platform_integrations` + `social_connections` counts (already partly in `getConnectionsHealth`)
- Recent Errors — `platform_integration_logs` where severity=error
- OAuth Status — `oauth_states` recent successes / failures
- System / Server Status — DB latency ping + `getSystemHealth` uptime signals

**Placeholder cards ("Not wired yet") — no fake data:**

- AI Usage — needs an `ai_usage` events table; deferred.
- Total API Requests — needs request logging; deferred.
- Email Delivery Statistics — no email provider connected in DB; deferred.
- SMS Delivery Statistics — no SMS provider; deferred.
- Background Job Status — no job runner in project; deferred.
- Feature Flags — no flags table; deferred.
- Support Tickets — no tickets table; deferred.
- Announcements — no announcements table; deferred.
- Impersonate users — needs Supabase Auth Admin flow + audit; **explicitly out of scope for this pass** (call out risk).

Each deferred card renders "Coming soon — needs the [X] data source" so nothing is fabricated.

## 5. Admin dashboard UI

- Redesign `admin.index.tsx` as a **premium enterprise dashboard**: 4-column stat grid, MRR/ARR/Churn hero row, a 30-day revenue sparkline (Recharts, already installed if we use it — verify), recent signups table, recent errors table, and integration health strip.
- Add a top toolbar with **search** (across users by email/name) and **date range filter** (7d / 30d / 90d) that scopes revenue + churn + errors.
- Responsive: single column on mobile, 2 cols on tablet, 4 cols on desktop.
- Skeletons for every card; no layout shift.

## 6. Files touched (summary)

- Migration: drop `claimFirstAdmin` (or leave function but disable via revoke); keep `user_roles` schema. Add a helpful `SELECT` comment showing how to grant admin.
- `src/lib/admin/credentials.functions.ts` — delete `claimFirstAdmin` export.
- `src/hooks/use-is-admin.ts` — drop `anyAdminExists`.
- `src/routes/_authenticated/admin.tsx` — replace claim UI with 403 Access Denied.
- `src/routes/_authenticated/admin.index.tsx` — full dashboard rebuild.
- `src/lib/admin/stats.functions.ts` — add churn, MRR/ARR, stripe revenue, errors, oauth status queries.
- Remove/rename `RequirePro`, `ProWelcome`; strip remaining "Pro/Upgrade" copy in `checkout.*`, `settings.billing.tsx`, `onboarding.subscription.tsx`.
- `src/routes/pricing.tsx` — collapse to single-plan page (if it currently shows tiers).

## Out of scope (call out explicitly)

- User impersonation (needs careful audit + Supabase Auth Admin session mint; separate hardened change).
- Building the email/SMS/jobs/flags/tickets/announcements data models — each is its own feature; today they'd only be placeholders.
- Any change to Stripe products or price IDs.
