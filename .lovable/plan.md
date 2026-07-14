# ROTHME Onboarding Redesign — Plan

## Goal
Replace the current 3-step wizard (`/get-started`, `/get-started/solution`) with a full 11-step guided onboarding that feels like ROTHME is learning about the business and building the workspace in real time.

## Architecture

Single authenticated layout route `/_authenticated/onboarding` that hosts all 11 steps as child routes, plus a persistent shell:
- Progress rail (left) — step list + completion %
- Content canvas (center) — active step
- AI companion panel (right, collapsible) — live analysis, checklist, "ROTHME is thinking…" states

State: one `onboarding_sessions` row per user (jsonb `answers`, jsonb `analysis`, jsonb `checklist`, `current_step`, `completed_at`). Autosaves on every field blur via a debounced `saveOnboardingStep` server fn. Reuses existing `onboarding_responses` table where fields overlap; new columns added via migration.

## Step Map

```text
/onboarding/welcome           → Hero + 3-min estimate, animated progress ring
/onboarding/discovery         → 6 sub-steps (grouped, not 25 questions on one page):
                                  1. Identity (name, website, industry, type)
                                  2. Scale (size, employees, revenue, country, timezone, languages)
                                  3. Goals (experience, budget, business goals, success goals)
                                  4. Audience & offer (target audience, products, services, competitors)
                                  5. Current stack (social, CRM, email, analytics platforms)
                                  6. Pain points & AI level
/onboarding/analysis          → Live AI scoring (business score, maturity, opportunity,
                                  time saved, revenue opportunity, recommended features)
/onboarding/workspace-build   → Cinematic 7-line "Creating Dashboard… Building Analytics…" sequence
                                  with real background writes (create workspace defaults, seed dashboards)
/onboarding/connections       → 13 platform cards with Connect / Skip / Status
/onboarding/subscription      → 4 plans, monthly/annual toggle, comparison, FAQ
/onboarding/configuration     → Logo upload, brand colors, fonts, description, mission,
                                  voice, hours, locations, team invites
/onboarding/ai-training       → Teach-AI form: voice, style, audience, keywords, tone
/onboarding/marketing-plan    → AI-generated strategy, 90-day roadmap, calendar preview, KPIs
/onboarding/walkthrough       → Guided tour cards for Dashboard/Analytics/Calendar/Publishing/…
/onboarding/first-success     → Pick one action; confetti on completion → /dashboard
```

## AI Integration

- `analyzeBusiness` server fn → Lovable AI Gateway (Gemini via `ai-gateway.server`), structured JSON output validated by Zod, returns `{ businessScore, maturity, opportunity, timeSaved, revenueOpportunity, recommendedFeatures[] }`. Called after discovery completes.
- `generateMarketingPlan` server fn → same gateway, returns `{ strategy, roadmap[], calendar[], kpis[] }`. Called after AI training.
- Both follow the four-questions voice contract; refuse-on-low-confidence honored.

## Data & Backend

Migration adds columns to `onboarding_responses` (or new `onboarding_sessions` table) for: analysis jsonb, marketing_plan jsonb, checklist jsonb, current_step text, plan_tier text, connections jsonb. RLS: owner-scoped. Grants: authenticated + service_role.

Server fns (all `_authenticated`, `requireSupabaseAuth`):
- `getOnboardingSession`
- `saveOnboardingStep({ step, patch })` — autosave
- `analyzeBusiness()` — reads answers, writes analysis
- `generateMarketingPlan()` — reads answers+analysis+training, writes plan
- `completeOnboarding()` — flips workspace to ready

## UI System

- Reuses existing ROTHME tokens in `src/styles.css` (no new palette).
- Glassmorphism cards, gradient borders, framer-motion page transitions, animated progress ring, typing-effect for AI lines.
- Persistent checklist component in shell, updates live as steps complete.
- Every step routed so back/forward works and autosave restores position.

## Files (roughly 25)

New route files (11), new layout, new shell components (ProgressRail, AICompanion, ChecklistCard, StepShell), new form sub-components for discovery, new server fns file `src/lib/onboarding.functions.ts`, one migration, ai plan generator, marketing plan renderer. Existing `/get-started/*` routes redirect to `/onboarding/welcome`.

## Scope for this turn

Ship Phase A — foundation + first 5 steps (welcome → connections) end-to-end with real autosave, real AI analysis, real workspace-build animation writing defaults. Phases B (subscription→training) and C (plan→dashboard) land in follow-up prompts.

## Out of scope this turn

- Real OAuth for the 13 platforms (uses existing `social/registry.ts` stubs; connect buttons launch existing flows where available, mark skipped otherwise).
- Stripe checkout wiring on subscription step (UI only until user asks to enable Stripe).
- Team invite emails (UI captures, sends on completion in Phase C).
