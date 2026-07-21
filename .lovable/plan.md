
## Repositioning Rothme: Marketing Intelligence, not Marketing Advice

Applies your three answers everywhere: features convert to observational, AI becomes strictly educational, Health Score keeps its name but is redefined to operational health with a transparent formula.

## Scope

~40 files across product, marketing, and copy. No new routes. All existing functionality stays reachable; only the language, prompts, and recommendation surfaces change.

## Phase 1 — AI & Assistant (strictly educational)

- `src/lib/strategist-prompt.ts` → rewrite as **Educator prompt**: explain metrics, define terms, summarize connected data, describe changes. Explicit refusals: no recommendations, no "you should", no scoring, no strategy.
- `src/components/assistant/quick-actions.ts` → replace creative/suggestive actions with explain-only: *Explain my CTR · What does reach mean · Summarize last 30 days · How is Health Score calculated · Define ROAS · What changed this week · Explain this chart · Where did this number come from*.
- `src/components/assistant/AssistantMessage.tsx` → remove "Save as Draft" affordance on assistant replies (educational replies aren't drafts). Draft Library route stays intact but is no longer fed by the assistant.
- Rename user-facing assistant label to **"Marketing Educator"** (keeps "AI Marketing Assistant" fallback where the change would be too invasive).

## Phase 2 — Dashboard (observations, not advice)

- `src/features/dashboard/DashboardInsights.tsx`, `DashboardWidget.tsx`, `ProWelcome.tsx` → strip recommendation copy; replace with factual observation cards ("Facebook generated 62% of tracked leads", "Video represented 41% of published content", "CTR decreased 1.2 pp vs prior period").
- `src/components/dashboard/AISummary.tsx` → rename to **"What Happened This Period"**; output pure summary, no next-step language.
- `src/components/dashboard/UpcomingList.tsx` → rename to **"Recent Changes"** (observed changes, not "upcoming actions").
- `src/lib/analytics/insights.functions.ts` + `src/lib/onboarding/dashboard-insights.functions.ts` → return observations only; drop `suggestedAction` fields; add `sourcePlatform` + `lastSyncedAt` to every observation for transparency.

## Phase 3 — Feature conversions (observational)

- **Insights** (`features/insights/*`, `routes/_authenticated/insights.tsx`) → "Observations". Card fields become: *what happened · when · source platform · last sync · how calculated*. Remove `recommendation`, `suggestedAction`, priority scoring.
- **Decisions** (`features/decisions/*`) → **"Changes Log"**. Each entry is an observed change with timestamp + source. No "decide" verbs, no options-to-pick.
- **Goals** (`features/goals/*`, `routes/_authenticated/goals.tsx`) → user-defined tracking only. Delete `RecommendedGoals.tsx` from the page (file kept but unrouted, marked deprecated). Goal cards show progress + source data, never "we recommend hitting X".
- **AI Audit** (`lib/audit/ai-audit.functions.ts`, `routes/_authenticated/audit.tsx`) → **System State Report**. Emits factual findings only: website reachable, integration authed, pixel detected, form responding, last sync at. Remove action plans, priorities, and remediation copy.

## Phase 4 — Health Score (the "Both" answer)

Keep the label **"Marketing Health Score"**, redefine calculation to operational health of connected systems, and add a visible transparency panel that lists exactly which signals contributed.

Formula (documented in-UI):

```text
Health Score =
   30% Platforms connected & auth valid
 + 25% Data freshness (last sync < 24h)
 + 20% Tracking installed (pixels/tags detected)
 + 15% Forms & endpoints responding
 + 10% No integration errors in last 7 days
```

Applied to `MarketingHealth` card on the dashboard and the landing page section. UI copy explicitly states: *"This score reflects the operational health of your connected marketing systems. It is not a measure of marketing quality, ad effectiveness, or business performance."*

## Phase 5 — Reports, Cheat Sheet, Notifications, Emails

- `src/lib/reports-mock.ts` + reports route → performance summaries, charts, tables, definitions, comparisons. Remove "recommendation" sections.
- Marketing Cheat Sheet (landing + in-app if present) → expand every metric with *Definition · Formula · Why it exists · How Rothme calculates it · Related metrics · Platform differences · FAQ · Common misconceptions*. Remove "Tips" / "Best strategy" blocks.
- `src/lib/notifications-mock.ts` + `routes/settings.notifications.tsx` → remove notification categories for "recommendations" / "suggested actions"; keep connection events, sync events, publishing events, subscription events.
- Notification email templates in the same spirit — factual event copy only.

## Phase 6 — Landing & marketing pages

- `src/routes/index.tsx`, `routes/ai-transparency.tsx`, `routes/features.automation.tsx`, `routes/get-started.solution.tsx`, `routes/design.tsx` → sweep for recommendation verbs (recommend/optimize/improve/increase/decrease/try/best practice) and rewrite to observational language. Keep all sections, layout, and visuals.
- Hero + Solution copy: reposition as "Marketing Intelligence Platform — see what's happening, understand why, decide for yourself."

## Phase 7 — Transparency touches

Where feasible without schema changes: every metric card and observation renders **source platform + last synced at** in muted footer text. On the dashboard "What Happened This Period" block, include a "Data sources" line listing the connected platforms that fed the summary.

## Out of scope (unchanged)

- Auth, RBAC, admin, connectors, OAuth flows, Stripe, storage, RLS.
- Draft Library route stays (user-created drafts only).
- No new routes, no schema migrations.

## Execution order

Phases 1 → 2 → 3 → 4 → 5 → 6 → 7, batched with parallel edits where files don't overlap. Typecheck after each phase.
