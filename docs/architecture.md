# Marketing OS — Product Architecture

Owner: product + engineering leadership
Status: v1 (MVP shipped) → v1.1 hardening
Audience: non-expert business owners (founders, operators, small marketing teams)

---

## 1. Product Principles (non-negotiable)

1. **Decisions, not dashboards.** Every screen answers "what should I do next?" before it shows a number.
2. **Plain English over jargon.** No CTR/CPM/ROAS unless immediately translated. The AI is a translator, not a metrics printer.
3. **One primary action per screen.** Secondary actions live behind a menu, not a toolbar.
4. **Time-to-value < 90 seconds.** Sign up → first useful insight in under a minute and a half.
5. **Trust is earned in the details.** Empty states, error copy, loading states, and email tone all reflect the brand.
6. **Simplicity is the moat.** We remove more than we add. Feature requests must pass: *does this help a business owner make a better marketing decision?*

---

## 2. Users & Jobs-to-be-Done

**Primary persona — "The Owner-Operator":** runs a 1–50 person business, owns marketing by default, has ad accounts + analytics + email but no time to synthesize them.

Top jobs:
- "Tell me if my marketing is working this week, in one sentence."
- "Tell me the single most valuable thing I should do next."
- "Warn me before I waste money."
- "Give me a short weekly recap I can forward to my team."

Non-goals: campaign creation, creative production, media buying, social scheduling, SEO auditing.

---

## 3. Product Surface (v1)

```text
Public
├── /                     Landing
├── /auth                 Sign in / sign up (email+password, Google)
├── /auth/forgot          Request reset
└── /auth/reset-password  Set new password

Authenticated (_authenticated layout)
├── /dashboard            Health Score · AI Summary · Top 3 Recommendations
├── /onboarding           Profile → Connect accounts → Done  (3 steps)
├── /reports              List of weekly reports
├── /reports/$id          Weekly report detail
├── /settings/profile     Name, business, email, password, sign out
└── /settings/connections Manage mocked provider connections
```

Nav is exactly three items: **Dashboard · Reports · Settings**. Anything else is a distraction.

---

## 4. Information Architecture

Every insight the product shows is one of four object types. If a feature doesn't fit, it's the wrong feature.

| Object | Purpose | Shown as |
|---|---|---|
| **Signal** | A single observed change worth attention | "Sales dropped 18% vs last week" |
| **Explanation** | Why the signal happened, in plain English | "Meta traffic fell after your best-performing ad paused" |
| **Recommendation** | One concrete action with expected impact | "Reactivate 'Spring Sale' ad — est. +$1,200/wk" |
| **Report** | Weekly digest bundling the above | Email + in-app page |

The AI never emits a Signal without an Explanation and at least one Recommendation. Bare numbers are forbidden.

---

## 5. System Architecture

```text
┌──────────────────────────────────────────────────────────────┐
│  Browser (React 19 + TanStack Start, Tailwind v4, shadcn)    │
│  - Route tree in src/routes/                                 │
│  - Query cache in TanStack Query                             │
│  - Auth session in localStorage (backend client)             │
└───────────────┬──────────────────────────────────────────────┘
                │ typed RPC (createServerFn) + bearer token
┌───────────────▼──────────────────────────────────────────────┐
│  Server functions  (src/lib/*.functions.ts)                  │
│  - requireSupabaseAuth middleware                            │
│  - Business logic, validation, AI orchestration              │
└───────────────┬──────────────────────────────────────────────┘
                │
     ┌──────────┼──────────────────────────┐
     ▼          ▼                          ▼
┌─────────┐ ┌──────────────────┐  ┌──────────────────────┐
│Postgres │ │ Lovable AI       │  │ (v2) Provider OAuth  │
│ + RLS   │ │ Gateway          │  │ GA4 / Meta / Google  │
│         │ │ (strategist LLM) │  │ Ads / Shopify / MC   │
└─────────┘ └──────────────────┘  └──────────────────────┘
```

Rules:
- App-internal logic → `createServerFn`. Webhooks/public callbacks → `src/routes/api/public/*` with signature verification.
- Every DB read/write scoped by RLS to `auth.uid()`. Admin client only for verified webhooks and privileged maintenance.
- The AI never runs in the browser. Prompts, tools, and API keys stay server-side.

---

## 6. Data Model (v1, live)

```text
profiles(id → auth.users, full_name, business_name, onboarded_at, timestamps)
account_connections(id, user_id, provider, connected_at)   -- mocked in v1
weekly_reports(id, user_id, week_start, payload jsonb, created_at)
```

RLS: user owns rows. GRANTs to `authenticated` + `service_role` only.

**v2 additions (planned, not built):**
- `provider_credentials` (encrypted OAuth tokens)
- `metric_snapshots` (weekly rollups per provider — sales, spend, sessions, conversions)
- `signals`, `recommendations`, `report_sections` (materialized AI outputs, versioned)
- `notification_events` + `notification_preferences` (only when we ship delivery)
- `user_roles` + `has_role()` (only when we introduce teams)

Everything above is deferred until we have real data flowing.

---

## 7. AI Architecture

**Persona:** senior marketing strategist. Direct, specific, numerate, allergic to platitudes.

**Layered prompt strategy:**

```text
System (persistent):
  You are the user's senior marketing strategist. You have their weekly
  metrics. Give one clear recommendation per finding. Never say "consider",
  "explore", or "optimize". Say what to do, why, and expected impact.

Context (per call):
  - Business profile (industry, size, goals)
  - Connected providers + last 8 weeks of snapshots
  - Prior recommendations + user actions taken/dismissed

Task (per call):
  - Generate: weekly report | dashboard summary | recommendation batch
  - Output: strict JSON schema (Signal, Explanation, Recommendation, Impact)

Guardrails:
  - Refuse to invent numbers not in context.
  - If data is insufficient, say so explicitly and recommend the one connection
    that would unlock the most value.
```

**Model choice:** default to a fast, structured-output-capable model via Lovable AI Gateway. Report generation may use a larger model asynchronously; dashboard summaries use a smaller synchronous model. All calls return structured JSON validated by Zod before hitting the UI.

**Output contract:**
```ts
type Recommendation = {
  headline: string;       // ≤ 60 chars, verb-first
  why: string;            // ≤ 200 chars, plain English
  action: string;         // ≤ 120 chars, specific step
  impact: {
    metric: "revenue" | "leads" | "traffic" | "spend";
    direction: "up" | "down";
    estimate: string;     // "+$1,200/wk" or "-30% wasted spend"
    confidence: "low" | "medium" | "high";
  };
};
```

The UI refuses to render a recommendation missing any field. This is how we keep AI output premium.

---

## 8. Frontend Architecture

```text
src/
├── routes/                    file-based routing (do not hand-edit routeTree.gen.ts)
│   ├── __root.tsx             providers, head, auth listener
│   ├── _authenticated/        gated subtree (integration-managed)
│   └── api/public/            webhooks (v2)
├── components/
│   ├── layout/                AppHeader, shell
│   ├── ui/                    shadcn primitives (do not fork per-feature)
│   ├── dashboard/             HealthScore, AISummary, RecommendationCard
│   └── reports/               ReportHeader, SectionRenderer
├── lib/
│   ├── *.functions.ts         server functions (client-safe imports)
│   ├── *.server.ts            server-only helpers (never imported by components)
│   └── ai/                    prompts, schemas, response validators
├── hooks/
├── integrations/supabase/     auto-generated; do not edit
└── styles.css                 design tokens (oklch), no hex in components
```

**Design system rules:**
- All color, spacing, radius, shadow, motion via CSS variables in `styles.css`.
- No `text-white`, `bg-black`, no hex literals in components.
- shadcn variants extended, never forked. One button component, many variants.
- Motion budget: transitions ≤ 200ms, easings from a single token set.
- Typography scale: 6 sizes max. Two families max.

**Accessibility baseline (enforced):** keyboard-navigable, visible focus rings, WCAG AA contrast, semantic landmarks, alt text on every meaningful image, `prefers-reduced-motion` respected.

---

## 9. Quality & Delivery

- **Type safety:** strict TS, Zod at every boundary (server fn input, AI output, form input).
- **Testing pyramid:** unit for pure logic (scoring, formatters), integration for server fns with a test DB, one Playwright smoke per critical flow (sign up → onboarding → dashboard → report).
- **Observability:** structured logs on the server, client error boundary at `__root`, per-route `errorComponent` + `notFoundComponent`.
- **Performance budgets:** dashboard TTI < 1.5s on mid-tier laptop, weekly report render < 800ms, AI summary streamed.
- **Security:** RLS on every user table, admin client only in webhook handlers + role-checked server fns, no secrets in client bundles, no service-role in `.functions.ts` module scope.

---

## 10. Roadmap Discipline

**v1 (shipped):** Auth · Onboarding (mocked) · Dashboard · Weekly Reports · Settings.

**v1.1 (hardening — recommended next):**
1. Design-token pass so every screen matches the premium bar (currently inconsistent).
2. AI output contract + Zod validators wired into dashboard and reports (removes generic strings).
3. Empty, loading, and error states for every route (trust lives here).
4. Playwright smoke covering the four critical flows.

**v2 (only when v1 usage proves demand):**
- Real OAuth for one provider (GA4 first — cheapest signal, no ad review).
- Notifications delivery (email digest + one in-app inbox — no Slack/Teams, no push).
- Report scheduling.
- Team seats + roles.

**Never (unless the principle changes):**
- Social scheduling. Creative generation. Media buying UI. Full BI/analytics builder. Per-metric drilldown pages. Custom dashboards. Anything a spreadsheet does better.

---

## 11. Decision Log

- **v1 connections mocked** — validates onboarding + weekly loop before OAuth cost.
- **Three-item nav** — enforces the "decisions, not dashboards" principle.
- **AI must return structured output** — protects the premium bar from generic prose.
- **No notifications delivery in v1** — spam risk outweighs value until we have real signals worth sending.

Amendments require an entry here with date + rationale.
