
# Brand refresh — calm, premium SaaS

Shift Northstar from the current dark/indigo Linear look to a calmer, lighter Stripe/Notion/OpenAI direction. This is a design-system change plus a restyle of every existing surface (landing + dashboard). No new features.

## Brand identity

- **Name**: Northstar (keep)
- **Wordmark**: lowercase `northstar` set in the display face at tight tracking; small circular mark (a soft off-center ring, evoking a compass/star) in ink — replaces the current filled purple square with an "N"
- **Voice**: quiet, direct, plain English (already established)

## Color system

Light-first, near-white surfaces, ink text, one restrained accent. Everything defined as semantic tokens in `src/styles.css`; no raw hex in components.

| Token | Role | Value (oklch) | Approx hex |
|---|---|---|---|
| `--background` | app bg | `oklch(0.99 0.002 95)` | #FCFCFB — warm off-white |
| `--surface` | cards | `oklch(1 0 0)` | #FFFFFF |
| `--surface-2` | insets, code | `oklch(0.975 0.003 95)` | #F6F5F3 |
| `--foreground` | primary text | `oklch(0.22 0.01 260)` | ~#232527 |
| `--muted-foreground` | secondary text | `oklch(0.52 0.01 260)` | ~#6B6F76 |
| `--border` | hairlines | `oklch(0 0 0 / 8%)` | rgba(0,0,0,.08) |
| `--border-strong` | inputs, focus | `oklch(0 0 0 / 14%)` | rgba(0,0,0,.14) |
| `--primary` | accent | `oklch(0.32 0.05 255)` | ~#2B3340 — deep ink-blue |
| `--primary-foreground` | text on accent | white | |
| `--success` | verdict green | `oklch(0.58 0.09 155)` | muted sage |
| `--warning` | verdict amber | `oklch(0.72 0.10 75)` | muted ochre |
| `--danger` | verdict red | `oklch(0.55 0.14 25)` | muted terracotta |

Deliberately no purple/indigo, no saturated blue, no gradients as decoration. The accent is nearly black-blue — used only for the primary button, links, and the wordmark mark. Verdict colors are muted so *working / steady / slipping* still reads without shouting.

Dark mode: keep the token map but shift `:root` values under a future toggle — out of scope for this pass; the `.dark` block stays defined but unused.

## Typography

- **Display / UI**: **Inter** (via `<link>` in `__root.tsx`). Weights 400 / 500 / 600. Tight tracking on headings (`-0.02em` at ≥ 2xl).
- **Serif accent**: **Instrument Serif** for the hero H1 on the landing only — one considered serif moment (Stripe/OpenAI move). Not used in the dashboard.
- **Mono**: **JetBrains Mono** for numeric values inside advanced disclosures.
- Scale: 12 / 13 / 14 / 15 / 16 / 18 / 20 / 24 / 30 / 40 / 56. Body sits at 15px. Line-height 1.55 on body, 1.15 on display.

## Shape, shadow, motion

- **Radius**: `--radius: 12px` (cards `rounded-xl`, buttons `rounded-lg`, pills `rounded-full`).
- **Shadows** (new tokens):
  - `--shadow-xs`: `0 1px 2px oklch(0 0 0 / 4%)` — inputs, pills
  - `--shadow-sm`: `0 1px 2px oklch(0 0 0 / 4%), 0 1px 0 oklch(0 0 0 / 3%)` — default card
  - `--shadow-md`: `0 8px 24px -8px oklch(0 0 0 / 8%), 0 2px 4px oklch(0 0 0 / 4%)` — hero surfaces
  - Combined with a 1px hairline border, never a shadow alone.
- **Motion**: `--ease-out: cubic-bezier(0.2, 0.8, 0.2, 1)`; all transitions 150–200ms. Card hover: `translateY(-1px)` + shadow step-up. Disclosure open: `opacity + max-height` at 180ms. No parallax, no bouncy springs.
- Focus ring: 2px `--ring` (accent at 40% alpha) with 2px offset in surface color.

## Reusable primitives to add / update

- `Button` variants: `primary` (ink), `secondary` (surface w/ border), `ghost`. All `h-9`, `rounded-lg`, `shadow-xs`.
- `Card` — restyled `SectionCard`: white surface, hairline border, `shadow-sm`, `p-6 sm:p-7`. Eyebrow color shifts from mono-gray to a slightly darker slate for contrast on light bg.
- `Pill` (Health / Verdict): white bg, hairline border, `shadow-xs`, colored dot + colored text.
- `Divider` — hairline, 1px, muted.
- Retire the accent bar on the left of `SectionCard` — replace with a subtle top-right verdict pill only. Calmer.

## Landing (`/`) restyle

- Off-white bg, remove the radial purple glow.
- Header: wordmark left, single `Open dashboard` ghost link right.
- Hero: eyebrow → serif H1 ("Know if your business is healthy. In one glance.") with the word *healthy* in ink italic serif, not colored — → body copy → single primary CTA + one-line reassurance.
- Add a quiet "as seen in" strip? **No** — leave whitespace instead (calmer, more Stripe-ish).
- Below the fold: three-up "how it works" strip with icon + one sentence each (What happened / Why / What to do). Same four-question spine surfaces as brand promise.

## Dashboard restyle

Same structure, new skin:

- Page bg `--background` (warm off-white). Cards `--surface` (white) with hairline + soft shadow.
- Header: sticky, translucent (`backdrop-blur`), hairline bottom. Left: wordmark. Right: date + `Refresh` ghost button + avatar placeholder circle.
- AI Summary card: white, no gradient. Small ink `Sparkles` icon in a subtle rounded square. Recommendation rows lose their outlined nested box → become plain rows separated by hairlines with the CTA button right-aligned.
- Health / Growth / Performance / Priorities / Tasks / Upcoming: same components, restyled through tokens. Pills adopt the new soft-shadow look. Verdict dots use the muted semantic colors.
- Advanced disclosures animate open (150ms opacity + height).
- Checkbox: rounded-md, hairline border in default; filled with `--foreground` (ink) when checked — not the accent — so the dashboard reads as calm even when half-checked.

## Files to touch

- `src/styles.css` — full token rewrite (light-first, new shadows, new radius, motion vars, `@theme` mapping incl. shadow tokens)
- `src/routes/__root.tsx` — swap Geist for Inter + Instrument Serif + JetBrains Mono `<link>`
- `src/routes/index.tsx` — landing restyle
- `src/routes/dashboard.tsx` — remove dark bg override; header/layout tweaks
- `src/components/dashboard/*` — restyle only (no API changes): `SectionCard`, `AISummary`, `HealthScore`, `GrowthCallout`, `PerformanceSummary`, `Checklist`, `UpcomingList`, `DashboardHeader`, `StatusPill`
- New: `src/components/brand/Wordmark.tsx` (mark + wordmark, reused in landing + dashboard header)

## Explicitly out of scope

- Dark-mode toggle (tokens stay defined for later)
- New pages (`/product`, `/pricing`, `/about`) from the earlier marketing-site plan — not requested in this pass
- Auth screens — still deferred
- Any change to the dashboard's information architecture, copy, or the four-question card contract

## Verification

After the restyle I'll load `/` and `/dashboard` in Playwright at desktop (1280) and mobile (390), screenshot, and check: no raw hex leaked, contrast passes for body/muted text on the new background, shadows visible but subtle, no jumpy motion on hover, and every existing card still shows *what / why / what to do / help me do it*.
