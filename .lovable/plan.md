# Velora Onboarding Experience — Build Plan

This is 16 distinct surfaces. Shipping it in one turn would produce shallow work on all of them. I'll break it into 4 phases, each independently valuable and reviewable. Confirm the phase 1 scope (and the design direction questions below) before I start.

## Phase 1 — Public marketing + discovery (this turn, after your answers)
The pre-auth journey. Highest leverage — this is what a first-time visitor sees.

1. **Landing** (`/`) — Hero, "Trusted by", "Everything in one place" (cards + modals), "How it works", Testimonials, CTA. Animated dashboard preview, floating charts, gradient.
2. **Business Discovery** (`/get-started`) — Multi-step wizard, progress bar, 12 questions, personalizes downstream.
3. **Personalized Solution** (`/get-started/solution`) — AI-generated summary from wizard answers via Lovable AI (server function). Recommended features, integrations, time-saved estimate.
4. **Why Velora** (`/why`) — With/without comparison, animated.
5. **Pricing** (`/pricing`) — 4 tiers, monthly/yearly toggle, comparison table, FAQ, guarantee, badges.

Discovery answers persisted in a `discovery_sessions` table (RLS: session-owned by anon session id, upgraded to user on signup).

## Phase 2 — Account creation + billing
6. **Create Account** — reuse existing `/auth`, restyle to match new brand.
7. **Checkout** — Stripe via Lovable payments (`payments--enable_stripe_payments`). Plan carry-through from pricing.
8. **Welcome** — Confetti, progress tracker, transitions into workspace setup.

## Phase 3 — Post-signup setup (extends existing `_authenticated/onboarding.tsx`)
9. **Workspace Setup** — Logo, brand colors, description, website.
10. **Business Profile** — Voice, audience, competitors, products, goals. Feeds AI strategist context.
11. **Connect Platforms** — Reuses existing `IntegrationHub` + `social/` framework. Skip allowed.
12. **Import Data** — CSV / past posts / media / contacts. Adapter-per-source.

## Phase 4 — Activation
13. **AI Setup** — Strategist generates initial strategy, calendar, KPIs from profile + connections.
14. **Dashboard Tour** — Overlay tour (react-joyride style, custom-built to match brand).
15. **First Success** — Guided single meaningful action + celebration.
16. Hand-off into existing `/dashboard`.

## Technical details

- **Routing**: All Phase 1 pages are public (top-level under `src/routes/`), each with distinct `head()` — title, description, og:title, og:description. og:image only on leaf routes.
- **Data**: `discovery_sessions` table (session_id, user_id nullable, answers jsonb, personalization jsonb, created_at). RLS + GRANTs per project rules.
- **AI**: Personalized Solution uses `createServerFn` calling Lovable AI Gateway. Structured JSON output validated by Zod. Follows the four-questions voice contract (`mem://ai/voice-contract`).
- **Payments**: Stripe via `payments--enable_stripe_payments` (per project rules — never BYOK Stripe). Phase 2.
- **Design tokens**: Add new brand palette, gradients, and font pair to `src/styles.css` under `@theme` / `@theme inline`. No hardcoded colors in components.
- **Animation**: Framer Motion (already common in this stack) for hero, section reveals, wizard transitions, comparison cards.
- **State across pre-auth flow**: Discovery answers in localStorage + server-side session row; hydrated on account creation and linked to the new user.
- **Reused primitives**: `IntegrationHub`, `social/registry.ts`, existing `_authenticated/onboarding.tsx` scaffolding, `AssistantChat`.

## Deliverable this turn
After you confirm scope and design direction: **Phase 1 only** — 5 routes, discovery table + server functions, brand tokens. Roughly 15–20 files. Phases 2–4 land in follow-up prompts.
