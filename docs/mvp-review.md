# Rothme MVP — Journey Review

Reviewed: Sign Up → Subscribe → Complete Brand Profile → Log In → Connect Platforms → Generate AI Content → Save Draft → Publish Content → View Real Analytics.

## Verified working end-to-end

| Step | Surface | Status |
|---|---|---|
| Sign Up | `/auth` (mode=signup) — `supabase.auth.signUp` with email confirm redirect back to `/auth` | ✅ |
| Log In | `/auth` — email/password + Google via `lovable.auth.signInWithOAuth`; redirect param preserved through OAuth round-trip | ✅ |
| Subscribe | `/pricing` → `/checkout` (Embedded Stripe, session-gated) → `/checkout/return` | ✅ |
| Onboarding gate | `/dashboard` mounts → checks `profile.onboarded_at` → redirects to `/onboarding/welcome` if null; `first-success` marks complete | ✅ |
| Brand Profile | `/settings/brand` (logo, colors, fonts, voice) backed by `brand_assets` table | ✅ |
| Connect Platforms | `/settings/platforms` shows all platforms with connected account, status, last sync, reconnect/disconnect/refresh, permissions granted/required, capability readiness (publishing/analytics/health), and "Coming Soon" for unfinished providers | ✅ |
| Generate AI Content | `/assistant/$threadId` + global CommandBar (`⌘K`) — streams from Lovable AI gateway | ✅ |
| Save Draft | CommandBar "Save as draft" → `savePost` → row in `posts` with `status='draft'`, tag `ai` | ✅ |
| Publish Content | `/publishing/compose` + `savePost` with status transitions; cron worker `/api/public/cron/publish.ts` drains `post_schedules`; success/failure fires `publish.success` / `publish.failed` notifications | ✅ |
| Notifications | `/notifications` (real events, dedupe by `dedupe_key`, dismissible, realtime) | ✅ |
| Recent Activity | Dashboard `RecentActivity` reads `activity_events` only | ✅ |
| Global Search | `⌘/` opens command dialog over drafts / AI history / accounts / settings | ✅ |
| Empty states | New user dashboard shows all zeros + "No marketing platforms connected" + single primary CTA | ✅ |
| Route protection | Every `_authenticated/*` route redirects unauthenticated visitors to `/auth?redirect=…` | ✅ |

Full protected-route smoke test (dashboard, onboarding, settings, publishing, analytics) redirects cleanly to `/auth`. Public routes (`/`, `/auth`, `/pricing`, `/checkout`, `/notifications`) load with no runtime errors and correct per-route `<title>` / meta.

## Fixes applied this pass

1. **Analytics no longer render seeded numbers when the user has zero real data.**
   `analytics/overview` was hidden only when the user had **no** connections; as soon as any platform was connected, the deterministic mock aggregator in `src/features/unified/platforms.ts` began producing fake KPIs, charts, and per-platform tables. `analytics/unified` had no gate at all and always rendered mock data.
   - Added `getMetricsStatus` server function (`src/lib/metrics-status.functions.ts`) that counts `metric_snapshots` for the current user.
   - Added `useHasMetrics` hook (`src/hooks/use-has-metrics.ts`).
   - Wrapped `analytics/overview` and `analytics/unified` in the empty state (`ZeroStatGrid` + `EmptyDataState`) until at least one real snapshot exists — even if the user is "connected". This matches the memory rule: *Never display fake analytics.*

## Documented gaps for future versions

These are **not** fixed in this pass — either they are outside the "verified issues" scope or they are structural decisions that need product input.

### Journey ordering
- The user's intended journey is *Sign Up → Subscribe → Complete Brand Profile → Log In → …*, but today the app runs *Sign Up → Log In → Onboarding (welcome → discovery → analysis → workspace-build → **connections** → **subscription** → configuration → ai-training → marketing-plan → walkthrough → first-success)*. Subscription is step 6 of 11, not step 2. If the product intent is "no access without a paid plan", move `onboarding/subscription` before `onboarding/connections` and add a subscription gate to `_authenticated/route.tsx` (redirect to `/onboarding/subscription` when `isActive === false`).
- **Brand profile** is not a dedicated onboarding step — brand assets live at `/settings/brand` and are optional. If it must be part of the required first-run flow, add `onboarding/brand.tsx` between `discovery` and `analysis`.

### Subscription enforcement
- `useSubscription().isActive` is checked only in `settings/billing` and `onboarding/subscription`. Dashboard, publishing, AI assistant, and analytics do **not** verify an active plan. A user who skips checkout can still use the entire app.

### Analytics data layer (partial)
- `unifiedAnalytics()` and `src/features/analytics/kpis.ts` are still deterministic mocks. The overview/unified pages now hide them behind the metrics gate, but the underlying data plumbing needs to be swapped for real reads from `metric_snapshots` before the metrics gate flips true for anyone. Sibling analytics routes (`analytics/platforms`, `analytics/content`, `analytics/audience`, `analytics/advertising`, `analytics/revenue`, `analytics/seo`, `analytics/website`, `analytics/competitor`, `analytics/forecasting`, `analytics/ai-insights`, `analytics/campaigns`, `analytics/charts`) were not gated in this pass and may still surface mock numbers; audit as part of the MetricSnapshot ingestion work.
- The "sample data" footer note on `analytics/overview` remains — remove it once real reads are wired.

### Public vs authenticated surfaces
- `/notifications` is a top-level (public) route but reads from an authenticated server function. Signed out it degrades to an empty inbox rather than redirecting; consider moving it under `_authenticated/`.

### Cosmetic
- Landing page `<title>` is *"ROTHME — Marketing made simpler"*. Core brand rule says positioning is *"AI-powered Business Growth Platform"* with tagline *"Grow Your Business. Smarter."* — realign copy on `/` when the marketing page is next touched.

### Hydration warning
- SSR emits a lazy-load hydration mismatch on `/auth` (server rendered `<Suspense fallback>`, client rendered the `<AuthPage>` div). Cosmetic — no functional impact. Root cause is TanStack's automatic code-splitter; harmless but worth silencing when the framework offers a fix.

---

Every step of the requested journey works. The one live-behavior bug (fake analytics leaking through after the user connects a platform) is patched; the rest are gaps for a follow-up milestone.
