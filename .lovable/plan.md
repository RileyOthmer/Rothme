## Homepage build

Replace `src/routes/index.tsx` with a full marketing page in the existing calm Stripe/Notion aesthetic (off-white background, white cards, hairline borders, soft shadows, Inter + Instrument Serif accent, ink-blue primary). Reuse existing tokens and `Wordmark`; no new colors, libs, or business logic.

### Sections

1. **Sticky header** — Wordmark left; anchor links (Features, How it works, Pricing, FAQ) center on `md:`; `Sign in` ghost + `Start free` primary right.

2. **Hero**
   - Eyebrow: "For business owners, not marketers"
   - H1: **Understand your marketing.** *Not your dashboards.* (serif italic on second line)
   - Sub: "Connect your marketing accounts. Our AI explains everything in plain English."
   - CTAs: `Start free` (primary → `/dashboard`) + `See a live example` (ghost → `/dashboard`)
   - Trust line: "No credit card. Works with the tools you already use."
   - Below: a small mock "This morning" card previewing an AI summary sentence + one recommendation (static, styled like the real dashboard card).

3. **Features** (3-up grid, same card style as current)
   - "One sentence, every morning" — what happened today, in plain English.
   - "The 'why' behind the number" — no charts to interpret.
   - "Three things to do today" — small, specific, done for you if you want.

4. **How it works** (3 numbered steps, hairline-divided row on `md:`)
   1. Connect your accounts (Google, Meta, email, etc.)
   2. We read them for you every morning.
   3. You get a plain-English summary and a short to-do list.

5. **Testimonials** (3 quote cards, first-person, no company logos)
   - Café owner, e-commerce founder, clinic owner. Short quotes about understanding their marketing without learning it.

6. **Pricing** (2 tiers, white cards, one marked "Most popular" with a subtle ring)
   - **Starter — $0** — 1 connected account, daily summary, 3 daily tasks.
   - **Growth — $29/mo** — unlimited accounts, weekly deep review, done-for-you actions.
   - CTA on each → `/dashboard` (`Start free` / `Start 14-day trial`).

7. **FAQ** (native `<details>`, hairline-divided list, 5 Qs)
   - Do I need to know marketing? Which accounts can I connect? Is my data safe? Can I cancel anytime? What if I already have an agency?

8. **Footer** — Wordmark + tagline left; small link columns (Product, Company, Legal) right; copyright row below hairline.

### Metadata

Update `head()` on `/`:
- title: "Northstar — Understand your marketing, not your dashboards"
- description: "Connect your marketing accounts. Our AI explains everything in plain English — what happened, why, and what to do today."
- matching `og:title`, `og:description`, `og:type=website`, `twitter:card=summary_large_image`. No `og:image` (no meaningful hero image yet).

### Out of scope

- No signup form / auth (CTAs link to `/dashboard`).
- No new components extracted — everything inline in `index.tsx` (page is one-off marketing).
- No changes to `/dashboard`, tokens, or fonts.
- No new dependencies.
