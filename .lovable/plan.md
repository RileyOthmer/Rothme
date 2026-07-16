# Admin Console

A dedicated `/admin` area, gated to users with the `admin` role, where you can manage every OAuth credential and see live health/stats for the whole platform.

## What you'll get

**Nav:** an "Admin" chip appears in the app header only when your account has the admin role. Non-admins never see the link and get bounced from `/admin/*` back to the dashboard.

**Six pages under `/admin/`:**

1. **Dashboard** — snapshot of every stat category, updates when you land on the page.
2. **Credentials** — one row per social platform (Facebook → Bluesky). Shows configured / missing state, last-updated timestamp, and lets you paste a new Client ID + Client Secret inline. Values are AES-256-GCM encrypted using your existing `INTEGRATION_ENCRYPTION_KEY`. Secrets are never sent back to the browser (masked "••••1234").
3. **Users & growth** — total users, new signups (7d / 30d), 30d active users, latest sign-ups list.
4. **Revenue & subscriptions** — active subscribers by plan, trialing / past-due / canceled counts, MRR estimate, latest 20 subscription events, environment (test/live) filter.
5. **Connections health** — connected accounts per platform, healthy vs degraded vs disconnected, sync success/failure rate over 7d, tokens expiring in 7d.
6. **System health** — recent errors from `sync_history`, `plugin_events` and `platform_integration_logs`; AI audit counts; last cron run.

## How credential storage works

Two-tier lookup: the OAuth adapter now checks the encrypted `admin_credentials` row for a platform first, and falls back to the `<PLATFORM>_CLIENT_ID` / `_CLIENT_SECRET` env vars if the row is missing. This means:

- Editing a platform in `/admin/credentials` immediately activates real OAuth for that platform — no redeploy, no secret rotation.
- Infra secrets (Stripe, encryption key, Lovable API key) stay in the Lovable secret store — the Credentials page shows them in a read-only "Infrastructure" panel with configured/missing badges so you can see status at a glance.

## Security

- New table `public.admin_credentials` — RLS restricted to `private.has_role(auth.uid(), 'admin')` for every operation. Server_role has ALL for edge functions.
- All admin server functions use `requireSupabaseAuth` and re-verify `has_role('admin')` server-side before returning any data.
- Encrypted values are never returned in list responses; only masked previews.
- A route-level `beforeLoad` check in `_authenticated/admin/route.tsx` redirects non-admins to `/dashboard`.

## Files

**Migration** (new)
- `admin_credentials` table + admin-only RLS + updated_at trigger.

**Server** (new)
- `src/lib/admin/credentials.functions.ts` — list / upsert / delete credential (admin-gated).
- `src/lib/admin/stats.functions.ts` — users, revenue, connections, health aggregates.
- `src/lib/admin/credential-resolver.server.ts` — DB-first, env-fallback secret loader.

**Server** (edit)
- `src/lib/social-connections/adapter.server.ts` — read client_id/secret through the resolver instead of `process.env` directly.

**Routes** (new)
- `src/routes/_authenticated/admin/route.tsx` — role gate + shared shell/nav.
- `src/routes/_authenticated/admin/index.tsx` — dashboard.
- `src/routes/_authenticated/admin/credentials.tsx`
- `src/routes/_authenticated/admin/users.tsx`
- `src/routes/_authenticated/admin/revenue.tsx`
- `src/routes/_authenticated/admin/connections.tsx`
- `src/routes/_authenticated/admin/health.tsx`

**UI** (edit)
- `src/components/layout/AppHeader.tsx` — conditional "Admin" chip via a `useIsAdmin` hook.

**Hook** (new)
- `src/hooks/use-is-admin.ts` — small React Query wrapper around a `checkIsAdmin` server function.

## Notes / trade-offs

- MRR is an estimate derived from the `subscriptions` table price_id + plan mapping already used by `useSubscription`; it isn't a Stripe API roundtrip (fast, no rate limits).
- The Credentials page never re-displays a secret you typed — once submitted it's encrypted and only the last 4 chars are echoed back. To rotate, paste a new value.
- The adapter fallback preserves the current behaviour: if you never open the Credentials page, everything keeps working the same way it does today via env vars.
- You'll need to be granted the `admin` role once. The existing `claim_first_admin` function handles this — I'll surface a one-click button on the admin gate's "access denied" screen so you can self-promote on first visit if no admin exists yet.
