import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { Wordmark } from "@/components/brand/Wordmark";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Northstar — Understand your marketing, not your dashboards" },
      {
        name: "description",
        content:
          "Connect your marketing accounts. Our AI explains everything in plain English — what happened, why, and what to do today.",
      },
      {
        property: "og:title",
        content: "Northstar — Understand your marketing, not your dashboards",
      },
      {
        property: "og:description",
        content:
          "Connect your marketing accounts. Our AI explains everything in plain English.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

const features = [
  {
    title: "One sentence, every morning",
    body: "Open the app and read one plain-English line about how your marketing did yesterday. That's it.",
  },
  {
    title: "The 'why' behind the number",
    body: "When something moves, we tell you why in a sentence a friend would use. No charts to interpret.",
  },
  {
    title: "Three things to do today",
    body: "A short, specific to-do list. Each one is optional — and each one we can do for you.",
  },
];

const steps = [
  {
    n: "1",
    title: "Connect your accounts",
    body: "Google, Meta, your email tool, your store. Takes about two minutes.",
  },
  {
    n: "2",
    title: "We read them for you",
    body: "Every morning, we check what happened and figure out what matters.",
  },
  {
    n: "3",
    title: "You get a plain-English summary",
    body: "A short briefing and a to-do list. No jargon. No dashboards to learn.",
  },
];

const testimonials = [
  {
    quote:
      "I finally know if my ads are working. It just tells me, in one line, and what to do next.",
    name: "Maya R.",
    role: "Owner, neighbourhood café",
  },
  {
    quote:
      "I used to open three dashboards and close them confused. Now I read one paragraph and get on with my day.",
    name: "Daniel K.",
    role: "Founder, online store",
  },
  {
    quote:
      "It feels like having a marketing person on the team, minus the meetings.",
    name: "Priya S.",
    role: "Owner, dental clinic",
  },
];

const pricing = [
  {
    name: "Starter",
    price: "$0",
    cadence: "free, forever",
    tagline: "For trying it out on one account.",
    features: [
      "1 connected account",
      "Daily plain-English summary",
      "3 recommended tasks a day",
    ],
    cta: "Start free",
    highlighted: false,
  },
  {
    name: "Growth",
    price: "$29",
    cadence: "per month",
    tagline: "For running your whole marketing from one place.",
    features: [
      "Unlimited connected accounts",
      "Weekly deep review",
      "Done-for-you actions",
      "Priority support",
    ],
    cta: "Start 14-day trial",
    highlighted: true,
  },
];

const faqs = [
  {
    q: "Do I need to know anything about marketing?",
    a: "No. Northstar is written for business owners, not marketers. If you can read an email, you can use it.",
  },
  {
    q: "Which accounts can I connect?",
    a: "Google Ads, Meta (Facebook & Instagram), Google Analytics, most email tools, and popular stores like Shopify. More every month.",
  },
  {
    q: "Is my data safe?",
    a: "Yes. We only read what we need, we never sell your data, and you can disconnect any account with one click.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. One click, no phone call, no email chain. If you cancel mid-month, you keep access until the end of the period.",
  },
  {
    q: "What if I already have an agency?",
    a: "Great — keep them. Most customers use Northstar to understand what their agency is doing and to catch things earlier.",
  },
];

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <FAQ />
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Wordmark />
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#how" className="hover:text-foreground">How it works</a>
          <a href="#pricing" className="hover:text-foreground">Pricing</a>
          <a href="#faq" className="hover:text-foreground">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/dashboard"
            className="hidden h-8 items-center rounded-md px-3 text-xs font-medium text-muted-foreground transition-colors duration-150 hover:text-foreground sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex h-8 items-center gap-1 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground shadow-xs transition-all duration-150 hover:opacity-90"
          >
            Start free
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-20 text-center sm:px-6 sm:pt-28">
        <span className="eyebrow">For business owners, not marketers</span>
        <h1 className="mt-6 text-[44px] font-medium leading-[1.05] tracking-tight text-foreground sm:text-[64px]">
          Understand your marketing.
          <br />
          <span className="font-serif italic font-normal">
            Not your dashboards.
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-muted-foreground">
          Connect your marketing accounts. Our AI explains everything in plain
          English — what happened, why, and what to do today.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/dashboard"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-150 hover:opacity-90"
          >
            Start free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-lg px-4 text-sm font-medium text-foreground/80 transition-colors duration-150 hover:text-foreground"
          >
            See a live example →
          </Link>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          No credit card. Works with the tools you already use.
        </p>
      </div>

      <div className="mx-auto max-w-2xl px-4 pb-24 sm:px-6">
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
          <div className="mb-4 flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-border bg-surface-2 text-foreground/70">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <span className="eyebrow">This morning</span>
          </div>
          <p className="font-serif text-[22px] leading-snug text-foreground sm:text-[26px]">
            Your marketing is doing well.
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
            You got 12 more customers than last week, mostly from your Instagram
            ads. One thing to do today: reply to the 4 comments waiting on your
            latest post.
          </p>
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="border-t border-border/70">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="max-w-2xl">
          <span className="eyebrow">What you get</span>
          <h2 className="mt-4 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            No charts.{" "}
            <span className="font-serif italic font-normal">Just answers.</span>
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
            Every screen answers the same four questions: what happened, why,
            what to do, and can we help you do it.
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-border bg-surface p-6 shadow-sm transition-all duration-150 hover:-translate-y-[1px] hover:shadow-md"
            >
              <h3 className="text-[15px] font-semibold tracking-tight text-foreground">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how" className="border-t border-border/70 bg-surface-2/40">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="max-w-2xl">
          <span className="eyebrow">How it works</span>
          <h2 className="mt-4 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Set it up once. Read it every morning.
          </h2>
        </div>
        <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="bg-surface p-6 sm:p-8">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-surface-2 font-mono text-xs text-foreground/80">
                {s.n}
              </span>
              <h3 className="mt-4 text-[15px] font-semibold tracking-tight text-foreground">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="border-t border-border/70">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="max-w-2xl">
          <span className="eyebrow">Owners like you</span>
          <h2 className="mt-4 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            The people who used to hate dashboards.
          </h2>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="flex h-full flex-col rounded-xl border border-border bg-surface p-6 shadow-sm"
            >
              <blockquote className="flex-1 font-serif text-[19px] leading-snug text-foreground">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-6 text-sm">
                <div className="font-medium text-foreground">{t.name}</div>
                <div className="text-muted-foreground">{t.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="border-t border-border/70 bg-surface-2/40">
      <div className="mx-auto max-w-5xl px-4 py-24 sm:px-6">
        <div className="max-w-2xl">
          <span className="eyebrow">Pricing</span>
          <h2 className="mt-4 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Simple, like the product.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
            Start free. Upgrade when you're ready. Cancel in one click.
          </p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {pricing.map((p) => (
            <div
              key={p.name}
              className={
                "relative flex flex-col rounded-2xl border bg-surface p-8 shadow-sm " +
                (p.highlighted
                  ? "border-foreground/20 ring-1 ring-foreground/10"
                  : "border-border")
              }
            >
              {p.highlighted ? (
                <span className="absolute -top-2.5 left-8 rounded-full bg-foreground px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-background">
                  Most popular
                </span>
              ) : null}
              <div>
                <div className="text-[13px] font-medium text-foreground">
                  {p.name}
                </div>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="font-serif text-4xl text-foreground">
                    {p.price}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {p.cadence}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{p.tagline}</p>
              </div>
              <ul className="mt-6 flex-1 space-y-2.5">
                {p.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2.5 text-sm text-foreground/90"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-foreground/50" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/dashboard"
                className={
                  "mt-8 inline-flex h-10 items-center justify-center gap-1 rounded-lg px-4 text-sm font-medium shadow-sm transition-all duration-150 " +
                  (p.highlighted
                    ? "bg-primary text-primary-foreground hover:opacity-90"
                    : "border border-border bg-surface text-foreground hover:bg-surface-2")
                }
              >
                {p.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  return (
    <section id="faq" className="border-t border-border/70">
      <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
        <div>
          <span className="eyebrow">FAQ</span>
          <h2 className="mt-4 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Questions people ask.
          </h2>
        </div>
        <div className="mt-10 divide-y divide-border border-y border-border">
          {faqs.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium text-foreground">
                {f.q}
                <span className="text-muted-foreground transition-transform duration-150 group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <Wordmark />
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-muted-foreground">
              Plain-English marketing, for business owners.
            </p>
          </div>
          <FooterCol
            title="Product"
            links={[
              { label: "Features", href: "#features" },
              { label: "How it works", href: "#how" },
              { label: "Pricing", href: "#pricing" },
            ]}
          />
          <FooterCol
            title="Company"
            links={[
              { label: "About", href: "#" },
              { label: "Contact", href: "#" },
            ]}
          />
          <FooterCol
            title="Legal"
            links={[
              { label: "Privacy", href: "#" },
              { label: "Terms", href: "#" },
            ]}
          />
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} Northstar.</span>
          <span>Made for people who'd rather run their business.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <div className="text-xs font-medium text-foreground">{title}</div>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.label}>
            <a
              href={l.href}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
