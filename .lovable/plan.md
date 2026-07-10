# v1 MVP Plan

Ship the smallest thing a business owner can actually use: sign up, connect their marketing accounts (mocked in v1), see the dashboard they already like, get a weekly report, manage their profile. Nothing else lands in nav.

## What's already built and keeps shipping
- Landing page (`/`) — hero, features, how it works, testimonials, pricing, FAQ, footer
- Dashboard (`/dashboard`) — AI summary, Marketing Health Score, plain-English recommendations
- Design tokens in `src/styles.css`

## What v1 adds

### 1. Authentication (`/auth`)
- Lovable Cloud auth. Email/password + Google (both defaults).
- Single card that toggles Sign in / Create account. Forgot-password link → `/auth/forgot` → email → `/auth/reset-password`.
- Root route registers one `onAuthStateChange` listener that invalidates the router on `SIGNED_IN` / `SIGNED_OUT` / `USER_UPDATED` only, and invalidates queries when a session exists.
- Sign-out clears the query cache, calls `signOut()`, navigates to `/auth` with `replace: true`.

### 2. `_authenticated` layout (integration-managed)
- Uses the managed `src/routes/_authenticated/route.tsx` (`ssr: false`, redirects to `/auth`).
- All protected routes live under it: `/dashboard`, `/onboarding`, `/reports`, `/reports/$id`, `/settings/profile`, `/settings/connections`.

### 3. Onboarding (`/onboarding`)
Three steps, one route, local state:
1. Business name + your name (writes to `profiles`).
2. Connect marketing accounts — Google Ads, Meta Ads, GA4, Shopify, Mailchimp. Each is a mocked Connect button that inserts `{ user_id, provider, connected_at }` into `account_connections`. Skippable.
3. "You're set" → `/dashboard`.

Post-signup redirect: if `profiles.onboarded_at` is null → `/onboarding`, else → `/dashboard`.

### 4. Connections settings (`/settings/connections`)
Same provider list. Shows connected/disconnected state with timestamps. Connect/Disconnect writes to `account_connections`. Real OAuth is a v2 concern; the UI is honest ("Demo connection — real OAuth coming soon").

### 5. Weekly reports (`/reports`, `/reports/$id`)
- List: last 8 weeks, seeded from the same mock generator that powers the dashboard so the numbers agree.
- Detail: same plain-English structure as the dashboard (health score, what changed, recommendations, business impact).
- Data lives in `weekly_reports` and is created lazily on first visit for the signed-in user.

### 6. Profile settings (`/settings/profile`)
- Update name, business name.
- Update email (`supabase.auth.updateUser`).
- Update password.
- Link to `/settings/connections`.
- Sign out button.

### 7. Responsive
- Verify at 375 / 768 / 1280 via Playwright. Fix breakage in the pages above only; no visual redesign.

## What gets removed from nav (code stays, just unlinked)
- AI Assistant (`/assistant`, `/assistant/$threadId`)
- Notifications (`/notifications`, `/settings/notifications`) — bell removed from `DashboardHeader`
- Design showcase (if exists)
- Marketing / Campaigns / Analytics / Reports-beyond-weekly / Help placeholders from the nav sketch

v1 nav is exactly: **Dashboard · Reports · Settings**. Sign out lives in Settings > Profile.

## Explicitly deferred to v2
Real OAuth for any provider, ad-platform data ingestion, notifications system, AI Assistant, Slack/Teams, dark mode, push/email delivery, PDF reports, report scheduling, teams/multi-user, billing.

## Technical section

### Database migration
Three tables, all with GRANT-before-RLS per project rules.

```
profiles
  id uuid pk references auth.users(id) on delete cascade
  full_name text
  business_name text
  onboarded_at timestamptz
  created_at, updated_at timestamptz

account_connections
  id uuid pk default gen_random_uuid()
  user_id uuid references auth.users(id) on delete cascade
  provider text  -- 'google_ads' | 'meta_ads' | 'ga4' | 'shopify' | 'mailchimp'
  connected_at timestamptz default now()
  unique (user_id, provider)

weekly_reports
  id uuid pk default gen_random_uuid()
  user_id uuid references auth.users(id) on delete cascade
  week_start date
  payload jsonb  -- health score, summary, recommendations
  created_at timestamptz default now()
  unique (user_id, week_start)
```

Each table:
- `GRANT SELECT, INSERT, UPDATE, DELETE ... TO authenticated;`
- `GRANT ALL ... TO service_role;`
- `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`
- Policies scoped to `auth.uid() = user_id` (or `id` for profiles).
- Trigger on `auth.users` insert to create a matching `profiles` row.

### Server functions
All in `src/lib/*.functions.ts`, all with `.middleware([requireSupabaseAuth])`:
- `getProfile`, `updateProfile`, `completeOnboarding`
- `listConnections`, `connectProvider(provider)`, `disconnectProvider(provider)`
- `listWeeklyReports`, `getWeeklyReport(id)`, `ensureCurrentWeekReport`

Called from components via `useServerFn` + `useQuery` (or from loaders under `_authenticated`). No protected fn is called from a public loader.

### Files touched
- **New:** `src/routes/auth.tsx`, `src/routes/auth.forgot.tsx`, `src/routes/auth.reset-password.tsx`, `src/routes/_authenticated/onboarding.tsx`, `src/routes/_authenticated/reports.tsx`, `src/routes/_authenticated/reports.$id.tsx`, `src/routes/_authenticated/settings.profile.tsx`, `src/routes/_authenticated/settings.connections.tsx`, plus `src/lib/{profile,connections,reports}.functions.ts` and small onboarding/connection UI components.
- **Moved:** `src/routes/dashboard.tsx` → `src/routes/_authenticated/dashboard.tsx`.
- **Edited:** `src/routes/__root.tsx` (auth listener, head metadata), `src/components/dashboard/DashboardHeader.tsx` (nav trimmed to Dashboard / Reports / Settings, notification bell removed, sign-out wired), `src/start.ts` if bearer middleware isn't already registered.
- **Untouched, unlinked:** existing assistant / notifications / design-showcase files.

### Out of scope
Real ad-platform OAuth, data ingestion, notifications delivery, PDFs, scheduling, teams, billing, dark mode.
