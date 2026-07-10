
# Dashboard MVP — Plan (revised for "confused-user-first")

Every card on the dashboard answers the same four questions in order, in the same voice a friend would use. No jargon, no charts, no numbers-without-meaning. If a term isn't in everyday English, we either replace it or explain it inline.

## The four-question card contract

Every `SectionCard` on the dashboard renders these slots in this order:

1. **What happened** — one short sentence, plain English. ("You got 12 new customers this week.")
2. **Why** — one sentence of cause. ("Your Tuesday ad reached more people than usual.")
3. **What to do** — one clear action verb. ("Boost that ad for 3 more days.")
4. **Help me do it** — a single primary button that starts the action. ("Boost it for me")

If a card can't answer all four, it doesn't ship. Cards that are purely informational (Recent Growth) still show 1–3; the button becomes "Show me why" that expands a plain-English explanation.

This contract is enforced by the `SectionCard` component API — the four slots are required props, not optional. That makes it structurally impossible to ship a jargon-y or dead-end card.

## Language rules (baked into the codebase)

- Ship `src/lib/plain-english.ts` with a `banned` list: *CTR, CPC, CPM, impressions, reach, engagement rate, conversion rate, ROAS, funnel, SEO, SERP, organic, bounce rate, sessions, MAU, DAU, retention cohort, attribution*, etc.
- A dev-only lint check (`bun run lint:plain`) greps `src/components/dashboard/**` and route files for banned terms and fails the check if found.
- Approved replacements table lives in the same file so the AI-summary generator and static copy pull from one source: `impressions → people who saw it`, `CTR → how often people clicked`, `conversion → people who bought`, `bounce rate → people who left right away`, `budget → daily spend`, etc.
- Any number ≥ 2 digits gets a comparison ("12 new customers — 3 more than last week"), never a bare number.
- Currency always with `$` and no decimals under $100.

## Sections, restated in the four-question voice

**Marketing Health Score**
- What happened: "Your marketing is healthy."
- Why: "More people bought this week than last week, and your ads are steady."
- What to do: "Keep going — one small task today."
- Help me do it: `Show today's task` → scrolls to Today's Priorities.
- No 0–100 number by default. Just the word (**Healthy / Needs attention / At risk**) and a colored dot. The number is inside `Show advanced ▾`.

**AI Summary** (the hero of the page)
- Time-aware greeting, 2–3 sentences, then 3 bulleted recommendations, each starting with a verb.
- Every bullet has its own "Help me do it" button — even if the MVP button just opens a pre-filled draft or a "coming soon" toast, the affordance is always there.
- Copy generated from mock data via a deterministic template for MVP; shape ready to swap for a Lovable AI Gateway call.

**Today's Priorities** (3 items, no more)
- Each item is itself a mini four-question card: title (what), one line why, an action button (help me do it), and a "Not now" secondary.
- Checkable, persists to localStorage.

**Recent Growth**
- One sentence. "You got 12 new customers this week — 3 more than last week."
- Button: `Why did this happen?` → expands 2 more plain sentences.
- No line chart. No sparkline.

**Performance Summary**
- Three rows: **Ads**, **Posts**, **Emails** (not "Content", not "Channels").
- Each row is one sentence ending in a verdict word: *working*, *steady*, *slipping*.
- Each row has a `What should I do?` link that expands the action.
- `Show advanced ▾` at the bottom reveals raw numbers *with a plain-English label next to each* — e.g. "CTR (how often people clicked): 3.2%". Never a naked acronym.

**Tasks (this week)**
- Same mini-card shape as Priorities. Checkable, localStorage.

**Upcoming Recommendations**
- Grouped by day. Each item is one sentence + a `Do it` button.
- "Fri — Post a short customer story. **Draft it for me**"

## Component API changes from the prior plan

```ts
// src/components/dashboard/SectionCard.tsx
type SectionCardProps = {
  eyebrow: string;                   // "Recent growth"
  whatHappened: React.ReactNode;     // required
  why?: React.ReactNode;             // optional, shown when present
  whatToDo?: React.ReactNode;        // optional, shown when present
  action?: { label: string; onClick: () => void }; // "Help me do it"
  advanced?: React.ReactNode;        // hidden behind Show advanced ▾
};
```

New primitives:
- `PlainTerm` — inline `<abbr>`-like component: `<PlainTerm term="CTR">how often people clicked</PlainTerm>` renders the plain phrase with the technical term as a hover/tap tooltip. Used only inside `advanced` slots.
- `ExplainButton` — the standard "Why did this happen?" / "Explain this" trigger that expands inline plain-English text.
- `HelpMeButton` — the standard primary action button, always labeled with a verb ("Boost it for me", "Draft it for me", "Reply for me").

## Confusion-safety defaults

- Every page loads with **all advanced sections collapsed**.
- Empty states never say "No data". They say what to do: "Nothing to review yet — connect your first channel to see how it's doing."
- Loading states show the section eyebrow + a one-sentence skeleton, never a bare spinner on the whole page.
- Errors say what happened and what to do: "We couldn't load your growth data. Try refreshing — if it keeps happening, we'll email you."

## Everything else from the prior plan still stands

- Route: `/_authenticated/dashboard`, auth via Lovable Cloud, `/auth` with email + Google
- Mock data via `src/lib/dashboard-mock.ts` behind a `getDashboardData` server function, read with TanStack Query
- Linear/Vercel dark aesthetic, semantic tokens only, mobile-first with `lg:` two-column
- No profiles table for MVP (greeting derived from `auth.user.email`)
- Marketing site's `/` stays intact; dashboard added on top

## Open question (unchanged from prior plan)

I'll keep the marketing site's `/` landing intact and add `/auth` + the dashboard on top. Say the word if you'd rather strip the landing down to a login redirect for the MVP.
