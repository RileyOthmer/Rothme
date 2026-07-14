# Fix billing, entitlement & purchase flow gaps

Based on your answers: **Pro Monthly $49 / Pro Annual $490**, **7-day trial**, **per-org entitlement**, **full tax compliance handling (+3.5%)**.

## What's broken today (short version)

1. **Pro is decorative** — no route/feature is actually gated; `has_active_subscription` exists but is called nowhere.
2. **Two pricing systems** — onboarding shows a fake $0/$39/$129/Enterprise picker that never touches Stripe; the real system (`/pricing`) sells one Pro plan at different prices.
3. **No Stripe products in code** — `pro_monthly`/`pro_annual` lookup_keys are referenced but never created.
4. **No trial, no tax config, no managed_payments** on checkout.
5. **Webhook**: `checkout.session.completed` doesn't activate entitlement (races on `subscription.created`); `invoice.payment_failed` ignores `environment`; no `invoice.payment_succeeded` to clear past-due.
6. **Client-controlled `environment` param** on server fns (trust boundary).
7. **Portal fn throws** instead of returning `{error}`.

## Plan

### 1. Product catalog (Stripe)
- `payments--batch_create_product`: one product `pro`, two prices `pro_monthly` ($4900/mo) & `pro_annual` ($49000/yr, ~2 months free), `tax_code: txcd_10103001` (SaaS), quantity 1/1.

### 2. Checkout hardening (`src/lib/payments.functions.ts`)
- Add `subscription_data.trial_period_days: 7`.
- Add `managed_payments: { enabled: true }` (cast to `SessionCreateParams` — dahlia field).
- Stamp `subscription_data.metadata.orgId` (already stamps userId).
- `createPortalSession`: return `{ error }` on failures instead of throwing.
- Derive `environment` server-side from `STRIPE_LIVE_API_KEY` presence + a signed hint, rather than trusting client. (Simplest: ignore client `environment`, pick sandbox in preview / live once live key exists.)

### 3. Onboarding ↔ real billing (`src/routes/_authenticated/onboarding.subscription.tsx`)
- Replace fake 4-tier picker with the same two-price flow used by `/pricing`: Pro Monthly / Pro Annual toggle + "Start 7-day free trial" CTA that opens embedded checkout via `useStripeCheckout`.
- Skip step entirely if org already has active subscription.
- Remove `plan_tier` writes from this step.

### 4. Per-org entitlement (`supabase/migrations/…`)
- New DB function `private.org_has_active_subscription(org uuid)` — checks `subscriptions.org_id` + active/trialing/past_due/canceled-with-future-period_end.
- Update `subscriptions` RLS: users can select rows for orgs they're members of (`is_org_member`).
- Update `useSubscription` to query by active org id (from `profiles.active_org_id`) instead of user_id; keep env filter; keep realtime.

### 5. Feature gating
- Add `<RequirePro>` wrapper component in `src/components/RequirePro.tsx` (checks org subscription via hook; if not active, redirects to `/settings/billing?upgrade=1` and shows soft upgrade CTA).
- Wrap Pro-only route groups: analytics/*, assistant, dev-center, insights, reports, plugins.
- Onboarding + settings + dashboard remain free (needed to reach checkout).

### 6. Webhook (`src/routes/api/public/payments/webhook.ts`)
- `checkout.session.completed`: if `mode=subscription` and `subscription` id present, fetch subscription + upsert immediately (idempotent fallback for race with `customer.subscription.created`).
- `invoice.payment_succeeded`: clear past_due, log activity event `subscription.renewed`.
- `invoice.payment_failed`: add `.eq('environment', env)` filter.
- `handleSubscriptionUpsert`: log `subscription.updated` activity when status transitions.
- Keep custom HMAC verify (works fine; SDK swap is nice-to-have, not blocking).

### 7. Billing UI polish (`src/routes/_authenticated/settings.billing.tsx`)
- Rename duplicate portal buttons to one **"Manage subscription"** button; separate **"View invoices"** deep-links portal `flow_data`.
- Show trial-ending badge when `status === 'trialing'` and `current_period_end` < 3 days away.

### 8. Return page (`src/routes/checkout.return.tsx`)
- Already polls subscriptions + resumes onboarding — keep. Add success toast + `activity_events` client insert removed (webhook handles it).

## Files touched

- **new**: `supabase/migrations/<ts>_pro_entitlement.sql`, `src/components/RequirePro.tsx`
- **edit**: `src/lib/payments.functions.ts`, `src/routes/api/public/payments/webhook.ts`, `src/hooks/useSubscription.ts`, `src/routes/_authenticated/onboarding.subscription.tsx`, `src/routes/_authenticated/settings.billing.tsx`, `src/routes/_authenticated/analytics.*` (wrap with RequirePro via `_authenticated/route.tsx` matcher — single edit, not per-route)
- **Stripe**: `payments--batch_create_product` (one call)

## Testing in preview (test mode)

1. **Sign in** to preview → complete onboarding until "Subscription" step.
2. **Click "Start 7-day trial – Pro Monthly"** → embedded checkout opens inline (orange test-mode banner at top).
3. **Test card**: `4242 4242 4242 4242`, any future expiry (e.g. `12/34`), any CVC (`123`), any ZIP.
4. Stripe redirects to `/checkout/return?session_id=…` → success screen → routes into `/dashboard`.
5. Verify **`/settings/billing`** shows "Trial – ends in 7 days", plan = Pro Monthly.
6. Verify **`/analytics/overview`** now loads (was blocked before checkout).
7. **Cancel test**: click "Manage subscription" → opens Stripe portal in new tab → cancel → return to app → banner shows "Access until <date>", app still works until period end.
8. **Failed payment test**: use `4000 0000 0000 0341` (attaches successfully but fails on renewal) → after next webhook, banner "Payment failed, we're retrying".
9. **3DS test**: `4000 0025 0000 3155` — checkout will prompt for auth code.
10. **Annual test**: repeat with the annual toggle.

Reset between tests: delete rows from `subscriptions` where `environment='sandbox'` for your user (Cloud → tables).

## Out of scope (deferred)

- SDK-based webhook signature verify (works today).
- Removing dead `has_active_subscription` (kept, still referenced by new org variant).
- Email templates for renewals/dunning (needs domain — you flagged separately).
- Win-back banner for canceled users (V2).

Reply **approve** and I'll execute in one pass.
