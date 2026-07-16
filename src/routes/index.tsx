import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Calendar,
  Check,
  MessageSquare,
  Sparkles,
  Users,
  Wrench,
  Workflow,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Wordmark } from "@/components/brand/Wordmark";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ROTHME — Marketing made simpler" },
      {
        name: "description",
        content:
          "ROTHME brings AI, marketing, social, analytics, automation, and reporting into one workspace — so you can focus on growing your business.",
      },
      { property: "og:title", content: "ROTHME — Marketing made simpler" },
      { property: "og:description", content: "One workspace. One AI strategist. Everything you need to grow." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://rothme.app/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

const CAPABILITIES = [
  { id: "ai", icon: Bot, name: "AI Assistant", tag: "Ask anything, in plain English",
    body: "A strategist that reads your marketing every morning and tells you — in one paragraph — what happened, why, and what to do today." },
  { id: "analytics", icon: BarChart3, name: "Analytics", tag: "One dashboard, every platform",
    body: "Unified metrics across every account you connect. Explanations, not just charts." },
  { id: "publishing", icon: Calendar, name: "Publishing", tag: "Write once, post everywhere",
    body: "Compose, schedule, and approve posts across every platform from a single calendar." },
  { id: "automation", icon: Workflow, name: "Automation", tag: "Rules that run themselves",
    body: "Alerts, follow-ups, and done-for-you actions that turn insights into progress." },
  { id: "reports", icon: Sparkles, name: "Reports", tag: "Auto-generated, plain English",
    body: "Weekly briefs and custom reports written by your AI strategist. Shareable in one click." },
  { id: "crm", icon: MessageSquare, name: "CRM", tag: "Customer memory, across channels",
    body: "Every conversation, comment, and interaction — stitched into one profile per customer." },
  { id: "team", icon: Users, name: "Team collaboration", tag: "Everyone on the same page",
    body: "Roles, approvals, comments, and shared workspaces built for real marketing teams." },
  { id: "dev", icon: Wrench, name: "Developer Center", tag: "Extend, integrate, ship",
    body: "Connect any platform, map custom metrics, and build private integrations." },
];

const STEPS = [
  { n: "1", title: "Tell us about your business", body: "A short wizard learns your industry, goals, and tools." },
  { n: "2", title: "We build your workspace", body: "Personalized dashboard, integrations, and AI strategist — ready in minutes." },
  { n: "3", title: "Connect your platforms", body: "Official one-click connections for every major channel." },
  { n: "4", title: "Grow, guided by AI", body: "Plain-English briefings, done-for-you actions, and reports that write themselves." },
];

const TESTIMONIALS = [
  { quote: "I finally know if my ads are working — in one sentence, every morning.", name: "Maya R.", role: "Owner, neighbourhood café", rating: 5 },
  { quote: "It replaced three tools and half a meeting a week.", name: "Daniel K.", role: "Founder, online store", rating: 5 },
  { quote: "Feels like having a marketing person on the team, minus the meetings.", name: "Priya S.", role: "Owner, dental clinic", rating: 5 },
  { quote: "The Monday brief is the only marketing thing I actually read.", name: "Jonas M.", role: "Head of growth, SaaS", rating: 5 },
];

const STATS = [
  { value: "12,000+", label: "Businesses served" },
  { value: "4.2M", label: "Posts published" },
  { value: "180,000", label: "Hours saved" },
  { value: "38,000", label: "Campaigns managed" },
];

const LOGOS = ["Northwind", "Meridian", "Kestrel", "Fable & Co.", "Halcyon", "Rivet"];

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Hero />
      <TrustedBy />
      <Capabilities />
      <HowItWorks />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/"><Wordmark /></Link>
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <a href="#capabilities" className="hover:text-foreground">Product</a>
          <a href="#how" className="hover:text-foreground">How it works</a>
          <Link to="/why" className="hover:text-foreground">Why ROTHME</Link>
          <Link to="/pricing" className="hover:text-foreground">Pricing</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/auth" className="hidden h-8 items-center rounded-md px-3 text-xs font-medium text-muted-foreground hover:text-foreground sm:inline-flex">
            Sign in
          </Link>
          <Link to="/get-started" className="inline-flex h-8 items-center gap-1 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-all hover:opacity-90">
            Start free <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <BackgroundGlow />
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-20 text-center sm:px-6 sm:pt-32">
        <span className="eyebrow">One workspace for all of it</span>
        <h1 className="mt-6 text-[44px] font-medium leading-[1.02] tracking-tight text-foreground sm:text-[68px]">
          Marketing made simpler.
          <br />
          <span className="font-serif italic font-normal">Growth made smarter.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-muted-foreground">
          ROTHME brings AI, marketing, social, analytics, automation, reporting, and collaboration into one platform — so you can focus on growing your business.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/get-started" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:opacity-90">
            Start free <ArrowRight className="h-4 w-4" />
          </Link>
          <a href="#capabilities" className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-surface px-4 text-sm font-medium text-foreground/80 shadow-xs transition-all hover:bg-surface-2">
            Book a demo
          </a>
          <a href="#how" className="inline-flex h-11 items-center justify-center px-2 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground">
            Watch demo →
          </a>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">No credit card. Cancel anytime.</p>
      </div>

      <div className="mx-auto max-w-3xl px-4 pb-24 sm:px-6">
        <DashboardPreview />
      </div>
    </section>
  );
}

function BackgroundGlow() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute left-1/2 top-0 h-[480px] w-[820px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(ellipse at center, oklch(0.85 0.05 255 / 40%) 0%, transparent 60%)" }} />
    </div>
  );
}

function DashboardPreview() {
  return (
    <div className="relative rounded-2xl border border-border bg-surface p-2 shadow-lg">
      <div className="rounded-xl border border-border bg-surface-2/60 p-5 sm:p-7">
        <div className="mb-4 flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-border bg-surface text-foreground/70">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <span className="eyebrow">This morning</span>
          <span className="ml-auto rounded-full border border-border bg-surface px-2 py-0.5 text-[10px] text-muted-foreground">high confidence</span>
        </div>
        <p className="font-serif text-[22px] leading-snug text-foreground sm:text-[26px]">
          Your ads are quietly having their best week of the quarter.
        </p>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
          Instagram brought in 42 new customers — up 31% on last week — mostly from the reel you posted Tuesday.
          One thing to do today: reply to the 4 comments waiting on that post.
        </p>
        <div className="mt-6 grid grid-cols-3 gap-2 text-center">
          <MiniStat label="New customers" value="42" delta="+31%" positive />
          <MiniStat label="Ad spend" value="$318" delta="−12%" positive />
          <MiniStat label="Reach" value="18.4k" delta="+9%" positive />
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, delta, positive }: { label: string; value: string; delta: string; positive?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 font-serif text-xl text-foreground">{value}</div>
      <div className={"mt-0.5 text-[11px] font-medium " + (positive ? "text-[color:var(--success)]" : "text-muted-foreground")}>{delta}</div>
    </div>
  );
}

function TrustedBy() {
  return (
    <section className="border-y border-border/70 bg-surface-2/40">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <p className="text-center text-xs uppercase tracking-[0.16em] text-muted-foreground">
          Trusted by businesses everywhere
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-70">
          {LOGOS.map((l) => (
            <span key={l} className="font-serif text-lg tracking-tight text-foreground/60">{l}</span>
          ))}
        </div>
        <div className="mt-10 grid grid-cols-2 gap-6 border-t border-border pt-8 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-serif text-3xl text-foreground">{s.value}</div>
              <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Capabilities() {
  const [open, setOpen] = useState<null | typeof CAPABILITIES[number]>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(null); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <section id="capabilities" className="border-b border-border/70">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="max-w-2xl">
          <span className="eyebrow">Everything in one place</span>
          <h2 className="mt-4 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            One workspace.{" "}
            <span className="font-serif italic font-normal">Everything you need.</span>
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
            Click any card to see how it works. Every feature answers the same four questions: what happened, why, what to do, and can we help.
          </p>
        </div>
        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CAPABILITIES.map((c) => {
            const Icon = c.icon;
            return (
              <button
                key={c.id}
                onClick={() => setOpen(c)}
                className="group flex h-full flex-col items-start rounded-xl border border-border bg-surface p-5 text-left shadow-xs transition-all hover:-translate-y-[1px] hover:border-foreground/20 hover:shadow-md"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface-2 text-foreground/70 transition-colors group-hover:text-foreground">
                  <Icon className="h-4 w-4" />
                </span>
                <h3 className="mt-4 text-[15px] font-semibold tracking-tight text-foreground">{c.name}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{c.tag}</p>
                <span className="mt-4 text-xs text-muted-foreground group-hover:text-foreground">Learn more →</span>
              </button>
            );
          })}
        </div>
      </div>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 animate-fade-in"
          onClick={() => setOpen(null)}
        >
          <div
            className="relative w-full max-w-lg rounded-2xl border border-border bg-surface p-8 shadow-lg animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(null)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface-2 text-foreground/70">
              <open.icon className="h-4 w-4" />
            </span>
            <h3 className="mt-4 font-serif text-2xl text-foreground">{open.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{open.tag}</p>
            <p className="mt-5 text-[15px] leading-relaxed text-foreground/80">{open.body}</p>
            <Link
              to="/get-started"
              className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
            >
              Try it free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how" className="border-b border-border/70 bg-surface-2/40">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="max-w-2xl">
          <span className="eyebrow">How ROTHME works</span>
          <h2 className="mt-4 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Set it up in minutes. Grow every day.
          </h2>
        </div>
        <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.n} className="bg-surface p-6 sm:p-7">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-surface-2 font-mono text-xs text-foreground/80">
                {s.n}
              </span>
              <h3 className="mt-4 text-[15px] font-semibold tracking-tight text-foreground">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="border-b border-border/70">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="max-w-2xl">
          <span className="eyebrow">What owners say</span>
          <h2 className="mt-4 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            The people who stopped opening dashboards.
          </h2>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="flex h-full flex-col rounded-xl border border-border bg-surface p-6 shadow-xs">
              <div className="mb-3 flex gap-0.5" aria-label={`${t.rating} out of 5`}>
                {Array.from({ length: t.rating }).map((_, i) => (
                  <span key={i} className="text-foreground/80">★</span>
                ))}
              </div>
              <blockquote className="flex-1 font-serif text-[17px] leading-snug text-foreground">"{t.quote}"</blockquote>
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

function CTA() {
  return (
    <section className="border-b border-border/70">
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <h2 className="font-serif text-4xl leading-tight text-foreground sm:text-5xl">
          Ready to run your marketing on one screen?
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
          Answer twelve quick questions. ROTHME will build a personalized workspace for your business — free.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/get-started" className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:opacity-90">
            Get started <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/pricing" className="inline-flex h-11 items-center px-3 text-sm font-medium text-foreground/70 hover:text-foreground">
            See pricing →
          </Link>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> No credit card</span>
          <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> 30-day money-back</span>
          <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> SOC 2 Type II</span>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <Wordmark />
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-muted-foreground">
              The AI-powered marketing operating system for business owners.
            </p>
          </div>
          <FooterCol title="Product" links={[
            { label: "Features", href: "#capabilities" },
            { label: "How it works", href: "#how" },
            { label: "Pricing", to: "/pricing" as const },
            { label: "Why ROTHME", to: "/why" as const },
          ]} />
          <FooterCol title="Company" links={[
            { label: "About", href: "#" },
            { label: "Contact", href: "#" },
            { label: "Careers", href: "#" },
          ]} />
          <FooterCol title="Legal" links={[
            { label: "Privacy", href: "#" },
            { label: "Terms", href: "#" },
            { label: "Security", href: "#" },
          ]} />
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} ROTHME.</span>
          <span>Made for people who'd rather run their business.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: Array<{ label: string; href?: string; to?: "/pricing" | "/why" }> }) {
  return (
    <div>
      <div className="text-[13px] font-medium text-foreground">{title}</div>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.label}>
            {l.to ? (
              <Link to={l.to} className="text-xs text-muted-foreground hover:text-foreground">{l.label}</Link>
            ) : (
              <a href={l.href} className="text-xs text-muted-foreground hover:text-foreground">{l.label}</a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
