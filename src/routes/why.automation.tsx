import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Sparkles, Zap, Check } from "lucide-react";
import { Wordmark } from "@/components/brand/Wordmark";

export const Route = createFileRoute("/why/automation")({
  head: () => ({
    meta: [
      { title: "AI Marketing Automation for Small Businesses — ROTHME" },
      {
        name: "description",
        content:
          "A plain-English guide to AI marketing automation for small business owners — what it is, what to automate first, and how ROTHME turns marketing insights into progress without adding to your workload.",
      },
      { property: "og:title", content: "AI Marketing Automation for Small Businesses — ROTHME" },
      {
        property: "og:description",
        content:
          "What AI marketing automation actually means for a small business — and how to get started without hiring an agency or learning another dashboard.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://rothme.app/why/automation" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://rothme.app/why/automation" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "AI Marketing Automation for Small Businesses",
          description:
            "A plain-English guide to AI marketing automation for small business owners — what it is, what to automate first, and how ROTHME turns marketing insights into progress.",
          author: { "@type": "Organization", name: "ROTHME" },
          publisher: { "@type": "Organization", name: "ROTHME" },
          mainEntityOfPage: "https://rothme.app/why/automation",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "What is AI marketing automation?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "AI marketing automation is software that reads your marketing data, decides what matters, and either does the work for you or tells you — in plain English — exactly what to do next. Traditional automation follows rules you set. AI automation figures the rules out for you.",
              },
            },
            {
              "@type": "Question",
              name: "Is AI marketing automation worth it for a small business?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes — small businesses benefit the most. You don't have a marketing team, so every hour spent copy-pasting reports is an hour not spent serving customers. AI automation gives you an always-on strategist without the agency retainer.",
              },
            },
            {
              "@type": "Question",
              name: "What should I automate first?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Start with reporting. Weekly performance summaries, alerts when something changes, and plain-English explanations of why. Once reporting runs itself, automate scheduling and follow-ups. Save creative decisions for last.",
              },
            },
            {
              "@type": "Question",
              name: "How is ROTHME different from Zapier or HubSpot automations?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Zapier and HubSpot move data between apps when you tell them to. ROTHME reads the data itself, decides what deserves your attention, and explains it in plain English — no rules, no triggers, no glossary.",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: AutomationGuide,
});

const AUTOMATE_FIRST = [
  {
    icon: Clock,
    title: "Weekly reporting",
    body: "The AI reads every platform you're connected to and writes your weekly summary. What happened, why, what to do — one page, plain English.",
  },
  {
    icon: Sparkles,
    title: "Alerts that matter",
    body: "Instead of dashboards you have to check, ROTHME tells you the moment something moves — a campaign spiking, a channel falling, a keyword climbing.",
  },
  {
    icon: Zap,
    title: "Next-best action",
    body: "Every insight ends with a recommendation and a confidence level. You approve, ROTHME does the work, or hands you a one-click draft.",
  },
];

const STEPS = [
  {
    n: "1",
    title: "Connect once",
    body: "Google Analytics, Meta, Google Ads, Shopify, Mailchimp — one-click, official connections. No spreadsheets, no CSVs.",
  },
  {
    n: "2",
    title: "The AI reads for you",
    body: "Every night the AI strategist reviews the numbers, spots the signals, explains the why, and drafts the recommendations.",
  },
  {
    n: "3",
    title: "You decide, ROTHME does",
    body: "Approve a recommendation and it becomes an action — a paused campaign, a rescheduled post, a report sent to your team.",
  },
];

function AutomationGuide() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/70">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/"><Wordmark /></Link>
          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/why" className="hover:text-foreground">Why ROTHME</Link>
            <Link to="/pricing" className="hover:text-foreground">Pricing</Link>
            <Link to="/get-started" className="inline-flex h-8 items-center gap-1 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground">Start free <ArrowRight className="h-3 w-3" /></Link>
          </nav>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-4 pt-16 pb-24 sm:px-6 sm:pt-24">
        <span className="eyebrow">Guide · 6 min read</span>
        <h1 className="mt-6 font-serif text-4xl leading-tight text-foreground sm:text-5xl">
          AI marketing automation for small businesses
        </h1>
        <p className="mt-6 text-[17px] leading-relaxed text-muted-foreground">
          You didn't start your business to become a marketing analyst. But somehow every week ends the same way: five tabs open, three dashboards to reconcile, and a nagging feeling you missed something. AI marketing automation is the fix — done right, it hands the busywork to software so you can spend the hour on customers, not spreadsheets.
        </p>

        <section className="mt-14 space-y-4">
          <h2 className="font-serif text-2xl text-foreground sm:text-3xl">What AI marketing automation actually is</h2>
          <p className="text-[16px] leading-relaxed text-muted-foreground">
            Traditional automation follows rules <em>you</em> set. If X happens, do Y. It saves clicks, but you still have to decide what X and Y are. AI marketing automation figures those rules out for you — it reads your marketing data, decides what matters, explains why, and either does the work or tells you exactly what to do next.
          </p>
          <p className="text-[16px] leading-relaxed text-muted-foreground">
            The difference matters most for small businesses. You don't have a marketing team to write those rules. You need the software to be the strategist.
          </p>
        </section>

        <section className="mt-14 space-y-6">
          <h2 className="font-serif text-2xl text-foreground sm:text-3xl">What to automate first</h2>
          <p className="text-[16px] leading-relaxed text-muted-foreground">
            Start where you're losing the most time — reporting and monitoring — before you touch anything creative.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {AUTOMATE_FIRST.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-2xl border border-border bg-surface p-6">
                <Icon className="h-5 w-5 text-foreground" />
                <h3 className="mt-4 text-[15px] font-medium text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14 space-y-6">
          <h2 className="font-serif text-2xl text-foreground sm:text-3xl">How it works in ROTHME</h2>
          <ol className="space-y-4">
            {STEPS.map((s) => (
              <li key={s.n} className="flex gap-4 rounded-2xl border border-border bg-surface p-6">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-medium text-background">{s.n}</div>
                <div>
                  <h3 className="text-[15px] font-medium text-foreground">{s.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-14 space-y-4">
          <h2 className="font-serif text-2xl text-foreground sm:text-3xl">What you get back</h2>
          <ul className="space-y-3">
            {[
              "Hours a week you weren't spending on customers",
              "Decisions grounded in evidence, not gut feel",
              "Fewer surprises — you hear about problems the day they start",
              "One workspace instead of ten browser tabs",
              "A strategist that never sleeps, never forgets, never overspends",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-[15px] leading-relaxed text-foreground">
                <Check className="mt-1 h-4 w-4 shrink-0 text-foreground" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14 space-y-6">
          <h2 className="font-serif text-2xl text-foreground sm:text-3xl">Common questions</h2>
          {[
            {
              q: "Do I need to know marketing to use it?",
              a: "No. Everything ROTHME shows you is in plain English — no jargon, no CTR/ROAS acronyms unless you turn on Advanced Mode.",
            },
            {
              q: "Will the AI make changes without asking me?",
              a: "Never for anything that spends money or ships to customers. You approve; ROTHME executes. Reports and internal summaries run automatically.",
            },
            {
              q: "Is my data safe?",
              a: "Yes. Every connection is a first-party OAuth. Your data stays yours, and ROTHME uses read-only scopes wherever the platform offers them.",
            },
            {
              q: "How is this different from Zapier or HubSpot?",
              a: "Zapier and HubSpot move data when you tell them to. ROTHME reads the data itself, decides what deserves attention, and explains it — no rules to build, no triggers to maintain.",
            },
          ].map(({ q, a }) => (
            <div key={q} className="rounded-2xl border border-border bg-surface p-6">
              <h3 className="text-[15px] font-medium text-foreground">{q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a}</p>
            </div>
          ))}
        </section>

        <div className="mt-16 rounded-2xl border border-foreground/20 bg-surface p-8 text-center shadow-md ring-1 ring-foreground/5">
          <h2 className="font-serif text-2xl text-foreground sm:text-3xl">Try it on your own business</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            Answer twelve short questions and ROTHME will build a personalized workspace — with your AI strategist ready to read your marketing from day one.
          </p>
          <Link
            to="/get-started"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:opacity-90"
          >
            Get my personalized plan <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-3 text-xs text-muted-foreground">Two minutes. No credit card.</p>
        </div>
      </article>
    </div>
  );
}
