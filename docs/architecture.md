# Marketing OS — Product Architecture

Owner: product + engineering leadership
Status: v1 shipped → v1.1 hardening → v2 real ingestion
Audience: non-expert business owners

---

## 1. Mission & Principles

**Mission.** Help business owners understand and improve their marketing without becoming marketers. Connect every major marketing platform, unify the data, and let an AI strategist explain what happened, why, what to do, and how confident it is — in plain English.

**Principles (non-negotiable):**
1. Decisions, not dashboards. Every screen answers "what should I do next?" before any number.
2. Plain English by default. Jargon (CTR, CPM, ROAS, CAC, LTV) only appears when the user opts into Advanced Mode.
3. One primary action per screen.
4. Time-to-value < 90 seconds.
5. Trust lives in the details — empty states, error copy, loading states, email tone.
6. Simplicity is the moat. Removing beats adding. Feature requests must pass: *does this help a business owner make a better marketing decision?*

Quality bar: Stripe / Linear / Notion / Figma / Apple / OpenAI.

---

## 2. Users & Jobs

**Primary — the Owner-Operator.** 1–50 person business, owns marketing by default. Has ad accounts, analytics, email, maybe a store — no time to synthesize.

Top jobs:
- "Tell me if my marketing is working this week, in one sentence."
- "Tell me the single most valuable thing to do next."
- "Warn me before I waste money."
- "Give me a short weekly recap I can forward to my team."

Non-goals (never build): social scheduling, creative generation, media buying UI, custom dashboards, generic BI.

---

## 3. Product Surface

### v1 (shipped)
```
Public                       Authenticated (_authenticated)
├── /                        ├── /dashboard
├── /auth                    ├── /onboarding
├── /auth/forgot             ├── /reports
└── /auth/reset-password     ├── /reports/$id
                             ├── /settings/profile
                             └── /settings/connections
```

### v2 (planned additions, gated by the principle test)
```
_authenticated
├── /insights/$id            single Signal → Explanation → Recommendation view
├── /reports/$id/export      shareable PDF/link (no dashboard builder)
└── /settings/notifications  digest preferences (email only, weekly default)
```

Nav stays three items: **Dashboard · Reports · Settings**. Everything else earns its way in.

---

## 4. The Core Object Model

Every insight is one of four types. Nothing else ships.

| Object | Purpose | Example |
|---|---|---|
| **Signal** | An observed change worth attention | "Weekly revenue fell 18%" |
| **Explanation** | Why, in plain English | "Meta traffic dropped after your top ad paused Tuesday" |
| **Recommendation** | One concrete action + expected impact + confidence | "Reactivate 'Spring Sale' ad — est. +$1,200/wk, high confidence" |
| **Report** | Weekly digest bundling Signals + Recommendations | Email + `/reports/$id` |

**Enforced rule:** the AI never emits a Signal without at least one Explanation and one Recommendation. Bare numbers are forbidden in the UI.

---

## 5. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser — React 19 · TanStack Start · Tailwind v4 · shadcn     │
│  Route tree · TanStack Query cache · Auth session               │
└──────────────────┬──────────────────────────────────────────────┘
                   │ typed RPC (createServerFn) + bearer
┌──────────────────▼──────────────────────────────────────────────┐
│  Server Functions & Server Routes                               │
│  - requireSupabaseAuth middleware                               │
│  - Business logic · validation · AI orchestration               │
│  - /api/public/* for provider webhooks (v2)                     │
└──────────────────┬──────────────────────────────────────────────┘
                   │
   ┌───────────────┼───────────────────┬──────────────────┐
   ▼               ▼                   ▼                  ▼
┌────────┐  ┌────────────────┐  ┌────────────────┐  ┌────────────┐
│Postgres│  │ Ingestion      │  │ AI Reasoning   │  │ Delivery   │
│ + RLS  │  │ Workers (v2)   │  │ Layer          │  │ (email v2) │
│        │  │ GA4 · Meta ·   │  │ Lovable AI     │  │            │
│        │  │ GAds · Shopify │  │ Gateway        │  │            │
│        │  │ · Mailchimp    │  │                │  │            │
└────────┘  └────────────────┘  └────────────────┘  └────────────┘
```

Hard rules:
- App-internal logic → `createServerFn`. External callers → `/api/public/*` with signature verification.
- RLS on every user table. Admin client only in verified webhooks + role-checked server fns.
- AI keys and prompts never touch the browser.
- No in-memory server state — workers are stateless.

---

## 6. Provider Integration Strategy

### v1 — Mocked connections
Connect buttons record intent, unlock the dashboard, produce seeded weekly reports. Validates the loop before OAuth cost.

### v2 — Real ingestion (phased, one provider at a time)

**Order of arrival** (chosen by leverage-per-integration-cost):
1. **GA4** — cheapest to ship (no app review), covers traffic + conversions.
2. **Shopify** — direct revenue signal for e-commerce (largest segment).
3. **Meta Ads** — largest ad-spend surface for SMB.
4. **Google Ads** — completes paid-media picture.
5. **Mailchimp / Klaviyo** — email lifecycle.

Each provider ships with the same contract:

```
provider adapter
├── connect(user)      OAuth flow → encrypted token
├── refresh(token)     handled by connector gateway when available
├── pull(user, range)  normalized MetricSnapshot rows
└── health(user)       last-sync, error state, scopes
```

Ingestion runs as scheduled server functions (nightly + on-demand). Failures don't block the app: stale-data banners appear on the dashboard, and the AI is told the freshness so it can hedge or refuse to recommend.

### Unified metric schema

Every provider normalizes into one shape. This is what makes "one dashboard" possible.

```ts
type MetricSnapshot = {
  user_id: uuid;
  provider: "ga4" | "shopify" | "meta_ads" | "google_ads" | "mailchimp";
  period_start: date;       // week or day
  period_end: date;
  // Normalized facts (nullable per provider capability)
  revenue: number | null;
  orders: number | null;
  sessions: number | null;
  new_customers: number | null;
  ad_spend: number | null;
  ad_impressions: number | null;
  ad_clicks: number | null;
  emails_sent: number | null;
  emails_opened: number | null;
  // Provider-native payload for drill-through / audit
  raw: jsonb;
  ingested_at: timestamp;
};
```

Derived metrics (CAC, ROAS, conversion rate) are computed on read — never stored — so a formula fix doesn't require a backfill.

---

## 7. Data Model

### v1 (live)
```
profiles(id → auth.users, full_name, business_name, onboarded_at)
account_connections(id, user_id, provider, connected_at)
weekly_reports(id, user_id, week_start, payload jsonb)
```

### v2 additions
```
provider_credentials(id, user_id, provider, encrypted_token, scopes, expires_at, status)
metric_snapshots(id, user_id, provider, period_start, period_end, ...normalized fields, raw)
signals(id, user_id, kind, period, magnitude, evidence jsonb, created_at)
recommendations(id, user_id, signal_id, headline, why, action, impact jsonb, confidence, status, dismissed_at)
report_sections(id, report_id, order, kind, payload jsonb)  -- versioned AI output
notification_preferences(user_id, digest_day, digest_hour, channels[])
```

Never in v1 or v2: `user_roles` (only when teams ship), analytics event tables (we're not a BI tool).

Every table: RLS scoped to `auth.uid()`, GRANTs to `authenticated` + `service_role`. Anon has no access anywhere.

---

## 8. AI Reasoning Layer

**Persona.** Senior marketing strategist. Direct, numerate, opinionated. Never uses "consider", "explore", "optimize", "leverage". Always: what happened → why → what to do → how confident.

**Three call types:**

| Call | Trigger | Latency budget | Model tier |
|---|---|---|---|
| Dashboard summary | Page load | < 1.5s streamed | Small/fast |
| Recommendation batch | Post-ingest, weekly | Async (< 60s) | Medium |
| Report narrative | Weekly cron | Async (< 3min) | Larger |

**Prompt architecture (layered):**

```
System (persistent):
  You are the user's senior marketing strategist. Given their unified
  weekly metrics, produce Signals, Explanations, and Recommendations.
  Rules:
  - Never invent numbers not in the provided context.
  - If data is stale or missing, say so and recommend the one connection
    that would unlock the most value.
  - Prefer one strong recommendation over three weak ones.
  - Use plain English. No CTR/CPM/ROAS unless the user is in Advanced Mode.

Context (per call):
  - Business profile: {industry, size, goals}
  - Connected providers + freshness per provider
  - Last 8 weeks of MetricSnapshot rows (normalized)
  - Prior recommendations + user action (taken / dismissed / ignored)
  - User mode: "plain" | "advanced"

Task (per call):
  Emit strict JSON matching the Signal/Recommendation schema below.
```

**Structured output contract (Zod-validated server-side; UI refuses malformed responses):**

```ts
type Signal = {
  headline: string;                 // ≤ 80 chars, past tense
  metric: "revenue" | "orders" | "sessions" | "new_customers" | "ad_spend" | "email_engagement";
  direction: "up" | "down" | "flat";
  magnitude_pct: number;            // signed
  period: { start: string; end: string };
  evidence: string[];               // 1–3 short bullets, plain English
};

type Recommendation = {
  headline: string;                 // ≤ 60 chars, verb-first
  why: string;                      // ≤ 200 chars
  action: string;                   // ≤ 120 chars, concrete step
  impact: {
    metric: "revenue" | "leads" | "traffic" | "spend";
    direction: "up" | "down";
    estimate: string;               // "+$1,200/wk" | "-30% wasted spend"
  };
  confidence: "low" | "medium" | "high";
  confidence_reason: string;        // ≤ 140 chars, what would raise it
  signal_ids: string[];             // links back to Signals
};
```

### How confidence is computed

Confidence is not the model's opinion alone. It's a function of four inputs, capped by the weakest:

1. **Data freshness** — all connected providers synced within 24h → +1; anything stale → cap at medium.
2. **Sample size** — recommendation based on ≥ 4 weeks of data → +1; < 2 weeks → cap at low.
3. **Signal strength** — magnitude beyond historical noise (rolling stdev) → +1; within noise → cap at low.
4. **Corroboration** — signal appears across ≥ 2 providers (e.g. Meta clicks + Shopify sessions) → +1.

The server computes a numeric score, maps to low/medium/high, and passes both to the model, which must justify it in `confidence_reason`. If the model returns a confidence that doesn't match the score, the server overrides with the computed value.

### Plain English vs Advanced Mode

A single toggle in Settings → Profile. Default: plain.
- **Plain:** "You spent $40 to get each new customer this week — last week it was $28."
- **Advanced:** "CAC $40 (↑43% WoW). Blended ROAS 2.1×."

Plain mode is the product; Advanced Mode exists so power users don't feel dumbed down. The AI is prompted with `mode` and formatters swap on the client.

---

## 9. Frontend Architecture

```
src/
├── routes/                     file-based (never hand-edit routeTree.gen.ts)
│   ├── __root.tsx              providers, head, auth listener
│   ├── _authenticated/         gated subtree (integration-managed)
│   └── api/public/             webhooks (v2)
├── components/
│   ├── layout/                 AppHeader, shell
│   ├── ui/                     shadcn primitives (extend, never fork)
│   ├── dashboard/              HealthScore, AISummary, RecommendationCard
│   ├── reports/                ReportHeader, SignalBlock, RecCard
│   └── insights/               ConfidenceBadge, EvidenceList (v2)
├── lib/
│   ├── *.functions.ts          server functions (client-safe imports)
│   ├── *.server.ts             server-only helpers
│   ├── ai/                     prompts, Zod schemas, validators
│   ├── metrics/                normalizers, formatters, plain-english
│   └── providers/              adapter contracts (v2)
├── hooks/
├── integrations/supabase/      auto-generated; do not edit
└── styles.css                  design tokens (oklch); no hex in components
```

**Design system rules:**
- All color / spacing / radius / shadow / motion via CSS variables.
- No `text-white`, no hex literals in components.
- shadcn variants extended, never forked. One Button, many variants.
- Motion: transitions ≤ 200ms, one easing token set, respect `prefers-reduced-motion`.
- Type: 6 sizes max, 2 families max.

**Accessibility baseline (enforced):** keyboard nav, visible focus, WCAG AA contrast, semantic landmarks, alt text, reduced-motion respected.

---

## 10. Quality, Security, Operations

- **Type safety:** strict TS. Zod at every boundary — server fn input, AI output, form input, provider payloads.
- **Testing:** unit for pure logic (scoring, formatters, confidence calc); integration for server fns against test DB; one Playwright smoke per critical flow.
- **Observability:** structured server logs, client error boundary at `__root`, per-route `errorComponent` + `notFoundComponent`, AI call audit log (prompt hash, model, latency, cost).
- **Performance budgets:** dashboard TTI < 1.5s, weekly report render < 800ms, AI summary streamed.
- **Security:** RLS on every user table; service-role only inside `.server.ts` loaded via `await import` in verified handlers; provider tokens encrypted at rest; no secrets in client bundles; webhook signatures verified before any write.
- **Cost control:** cache AI outputs per (user, week) — regenerate only on new ingest or explicit refresh. Cheap model for dashboard, larger for weekly report.

---

## 11. Roadmap Discipline

**v1 (shipped).** Auth · Onboarding (mocked) · Dashboard · Weekly Reports · Settings.

**v1.1 (hardening — recommended next block):**
1. Design-token pass so every current screen matches the premium bar.
2. Wire the Signal/Recommendation Zod contract into dashboard + reports; strip any generic AI prose from the UI.
3. Empty / loading / error states on every route.
4. Confidence badge component + rules (works on mocked data, ready for real).
5. Playwright smokes: sign up → onboarding → dashboard → report; sign out; password reset.

**v2 (only after v1 usage justifies it):**
- GA4 real OAuth + ingestion + adapter contract other providers implement.
- Shopify next (highest revenue signal per hour of engineering).
- Weekly email digest — one channel only, no push, no Slack/Teams.
- Advanced Mode toggle.

**v3 (later, only if the data proves demand):** additional providers (Meta, Google Ads, Mailchimp), report scheduling, team seats + roles.

**Never (unless the principle changes):** social scheduling, creative generation, custom dashboard builder, per-metric drilldown pages, full BI, in-app chatbot, notification spam channels.

---

## 12. Decision Log

- **v1 connections mocked** — validate onboarding + weekly loop before OAuth engineering.
- **Three-item nav** — enforces "decisions, not dashboards".
- **AI must return structured output** — protects the premium bar from generic prose.
- **Confidence is computed, not model-declared** — makes trust measurable and consistent.
- **Plain English default, Advanced Mode opt-in** — the product is for non-experts; power users still respected.
- **One provider at a time, GA4 first** — leverage-per-cost ordering; each adapter proves the contract for the next.
- **No notification delivery in v1** — spam risk outweighs value until real signals exist.

Amendments require an entry here with date + rationale.
