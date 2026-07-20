import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Calendar,
  Check,
  ChevronDown,
  Eye,
  Gauge,
  Lightbulb,
  Link2,
  Lock,
  LogOut,
  MessageSquare,
  Plug,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Users,
  Workflow,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Wordmark } from "@/components/brand/Wordmark";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rothme — Grow Your Business. Smarter." },
      {
        name: "description",
        content:
          "Rothme is the AI marketing operating system for business owners — one workspace that unifies analytics, publishing, automation, and reports in plain English.",
      },
      { property: "og:title", content: "Rothme — Grow Your Business. Smarter." },
      { property: "og:description", content: "The AI marketing operating system that unifies every platform, explains what happened, and tells you what to do next." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://rothme.app/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Hero />
        <TrustedBy />
        <Problem />
        <Solution />
        <DashboardSection />
        <LeadAudit />
        <HealthScore />
        <CheatSheet />
        <Integrations />
        <HowItWorks />
        <Features />
        <Security />
        <AITransparencySection />
        <Testimonials />
        <PricingSection />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}

/* ─────────────────────────────── Navigation ─────────────────────────────── */

const NAV_LINKS = [
  { href: "#problem", label: "Problem" },
  { href: "#solution", label: "Solution" },
  { href: "#dashboard", label: "Dashboard" },
  { href: "#integrations", label: "Integrations" },
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
];

function Header() {
  const [user, setUser] = useState<null | object>(null);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/"><Wordmark /></Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground lg:flex">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-foreground">{l.label}</a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {mounted && user ? (
            <>
              <Button size="sm" asChild>
                <Link to="/dashboard" className="inline-flex items-center gap-1">
                  Dashboard <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout} className="inline-flex items-center gap-1.5">
                <LogOut className="h-3.5 w-3.5" /> Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link to="/auth">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/get-started" className="inline-flex items-center gap-1">
                  Start free <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

/* ─────────────────────────────── Hero ─────────────────────────────── */

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <BackgroundGlow />
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-20 text-center sm:px-6 sm:pt-32">
        <span className="eyebrow">AI marketing operating system</span>
        <h1 className="mt-6 text-[44px] font-medium leading-[1.02] tracking-tight text-foreground sm:text-[68px]">
          Grow your business.
          <br />
          <span className="font-serif italic font-normal">Smarter.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-muted-foreground">
          Rothme connects every marketing platform, unifies the data, and gives you a personal AI strategist that explains what happened, why, and what to do next — in plain English.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/get-started" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:opacity-90">
            Start free <ArrowRight className="h-4 w-4" />
          </Link>
          <a href="#dashboard" className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-surface px-4 text-sm font-medium text-foreground/80 shadow-xs transition-all hover:bg-surface-2">
            See the dashboard
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
          Instagram brought in 42 new customers — up 31% on last week — mostly from the reel you posted Tuesday. One thing to do today: reply to the 4 comments waiting on that post.
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

/* ─────────────────────────────── Trusted By ─────────────────────────────── */

const LOGOS = ["Northwind", "Meridian", "Kestrel", "Fable & Co.", "Halcyon", "Rivet"];
const STATS = [
  { value: "12,000+", label: "Businesses served" },
  { value: "4.2M", label: "Posts published" },
  { value: "180,000", label: "Hours saved" },
  { value: "38,000", label: "Campaigns managed" },
];

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

/* ─────────────────────────────── Problem ─────────────────────────────── */

const PROBLEMS = [
  { title: "Six tabs, no answers", body: "Meta, Google, Shopify, Mailchimp… you open them all and still can't tell what's actually working." },
  { title: "Dashboards that require a translator", body: "CTR, ROAS, CAC — you shouldn't need a marketing degree to understand your own business." },
  { title: "Advice that never lands", body: "Every tool says do more. None tell you the one thing to do today." },
];

function Problem() {
  return (
    <section id="problem" className="border-b border-border/70">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="max-w-2xl">
          <span className="eyebrow">The problem</span>
          <h2 className="mt-4 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Marketing tools were built for marketers.
            <br />
            <span className="font-serif italic font-normal">You're a business owner.</span>
          </h2>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {PROBLEMS.map((p) => (
            <div key={p.title} className="rounded-xl border border-border bg-surface p-6">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface-2 text-foreground/70">
                <X className="h-4 w-4" />
              </div>
              <h3 className="mt-4 text-[15px] font-semibold text-foreground">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────── Solution ─────────────────────────────── */

function Solution() {
  const bullets = [
    "Every platform in one place",
    "Plain-English explanations, not charts",
    "A next action every morning",
    "Confidence rating on every insight",
  ];
  return (
    <section id="solution" className="border-b border-border/70 bg-surface-2/40">
      <div className="mx-auto grid max-w-6xl gap-14 px-4 py-24 sm:px-6 md:grid-cols-2 md:items-center">
        <div>
          <span className="eyebrow">The solution</span>
          <h2 className="mt-4 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            One workspace.{" "}
            <span className="font-serif italic font-normal">One clear answer.</span>
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
            Rothme unifies your marketing, then hands it to an AI strategist trained to answer four questions: what happened, why, what should I do, and can we help.
          </p>
          <ul className="mt-6 space-y-3">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-2.5 text-sm text-foreground/85">
                <Check className="mt-0.5 h-4 w-4 text-primary" /> {b}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            <span className="eyebrow">Ask anything</span>
          </div>
          <p className="mt-4 font-serif text-xl leading-snug text-foreground">
            "Why did revenue drop last week?"
          </p>
          <div className="mt-4 rounded-lg border border-border bg-surface-2/60 p-4 text-sm leading-relaxed text-foreground/85">
            Revenue was down 14% because your Meta ads for the summer collection ended Thursday. Repeat customers held steady — the drop is entirely from new customers.
            <div className="mt-3 text-xs text-muted-foreground">Confidence: high · Based on 4 connected sources</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────── Dashboard ─────────────────────────────── */

function DashboardSection() {
  return (
    <section id="dashboard" className="border-b border-border/70">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="max-w-2xl">
          <span className="eyebrow">The Executive Brief</span>
          <h2 className="mt-4 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            The dashboard that{" "}
            <span className="font-serif italic font-normal">reads itself to you.</span>
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
            No 12-widget wall of numbers. One paragraph, one action, one confidence level — every morning.
          </p>
        </div>
        <div className="mt-12">
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────── Lead Audit ─────────────────────────────── */

function LeadAudit() {
  const items = [
    { title: "Where leads come from", body: "Every source, ranked by real revenue — not just clicks." },
    { title: "Where they leak", body: "The exact step of your funnel losing the most people this week." },
    { title: "What to fix first", body: "One prioritized action, sized to your time and budget." },
  ];
  return (
    <section className="border-b border-border/70 bg-surface-2/40">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="grid gap-14 md:grid-cols-[1fr_1.1fr] md:items-center">
          <div>
            <span className="eyebrow">Lead Audit</span>
            <h2 className="mt-4 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
              Know where every customer{" "}
              <span className="font-serif italic font-normal">actually comes from.</span>
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
              Rothme traces every lead back to the ad, post, or channel that started it — then tells you plainly what to double down on and what to cut.
            </p>
          </div>
          <div className="space-y-3">
            {items.map((i) => (
              <div key={i.title} className="rounded-xl border border-border bg-surface p-5">
                <div className="flex items-start gap-3">
                  <div className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface-2 text-primary">
                    <Search className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-foreground">{i.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{i.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────── Marketing Health Score ─────────────────────────────── */

function HealthScore() {
  return (
    <section className="border-b border-border/70">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="grid gap-14 md:grid-cols-2 md:items-center">
          <div className="order-2 md:order-1">
            <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-primary" />
                <span className="eyebrow">Your score</span>
              </div>
              <div className="mt-6 flex items-end gap-3">
                <span className="font-serif text-7xl text-foreground">82</span>
                <span className="pb-2 text-sm text-muted-foreground">/ 100 · Strong</span>
              </div>
              <div className="mt-6 space-y-3">
                {[
                  { label: "Reach & audience", score: 88 },
                  { label: "Conversion", score: 74 },
                  { label: "Retention", score: 91 },
                  { label: "Ad efficiency", score: 68 },
                ].map((r) => (
                  <div key={r.label}>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{r.label}</span><span>{r.score}</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-border">
                      <div className="h-full bg-primary" style={{ width: `${r.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <span className="eyebrow">Marketing Health Score</span>
            <h2 className="mt-4 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
              One number for the health of your{" "}
              <span className="font-serif italic font-normal">entire marketing engine.</span>
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
              Reach, conversion, retention, and ad efficiency — scored, trended, and explained. You'll know instantly whether things are improving or slipping.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────── Marketing Cheat Sheet ─────────────────────────────── */

function CheatSheet() {
  const cards = [
    { title: "This week", tone: "primary", body: "Post twice on Instagram — carousels are outperforming reels 3:1 for your niche." },
    { title: "This month", tone: "default", body: "Retarget your Shopify cart abandoners on Meta. Estimated payback: 8 days." },
    { title: "This quarter", tone: "default", body: "Launch a referral program. Your top 10% of customers already refer without incentive." },
  ];
  return (
    <section className="border-b border-border/70 bg-surface-2/40">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="max-w-2xl">
          <span className="eyebrow">Marketing Cheat Sheet</span>
          <h2 className="mt-4 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            The next best move,{" "}
            <span className="font-serif italic font-normal">already written.</span>
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
            Prioritized recommendations for this week, this month, and this quarter — with evidence and estimated impact.
          </p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {cards.map((c) => (
            <div key={c.title} className={"rounded-xl border p-6 " + (c.tone === "primary" ? "border-primary/40 bg-primary/5" : "border-border bg-surface")}>
              <div className="flex items-center gap-2">
                <Lightbulb className={"h-4 w-4 " + (c.tone === "primary" ? "text-primary" : "text-foreground/60")} />
                <span className="eyebrow">{c.title}</span>
              </div>
              <p className="mt-4 font-serif text-lg leading-snug text-foreground">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────── Integrations ─────────────────────────────── */

const INTEGRATION_MARKS = [
  { mark: "Ma", name: "Meta Ads", color: "#1877F2" },
  { mark: "Ga", name: "Google Ads", color: "#4285F4" },
  { mark: "Ga", name: "Google Analytics", color: "#E37400" },
  { mark: "Sh", name: "Shopify", color: "#96BF48" },
  { mark: "Mc", name: "Mailchimp", color: "#FFE01B" },
  { mark: "Ig", name: "Instagram", color: "#E4405F" },
  { mark: "Fb", name: "Facebook", color: "#1877F2" },
  { mark: "Tt", name: "TikTok", color: "#000000" },
  { mark: "Yt", name: "YouTube", color: "#FF0000" },
  { mark: "Li", name: "LinkedIn", color: "#0A66C2" },
  { mark: "Gb", name: "Google Business", color: "#34A853" },
  { mark: "Rs", name: "Resend", color: "#000000" },
];

function Integrations() {
  return (
    <section id="integrations" className="border-b border-border/70">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="max-w-2xl">
          <span className="eyebrow">Integrations</span>
          <h2 className="mt-4 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Every platform you use,{" "}
            <span className="font-serif italic font-normal">already speaking the same language.</span>
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
            One-click official connections. Rothme normalizes every metric so cross-platform decisions actually make sense.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {INTEGRATION_MARKS.map((i) => (
            <div key={i.name} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-xs font-semibold text-white"
                style={{ background: i.color }}>{i.mark}</span>
              <span className="truncate text-sm text-foreground">{i.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────── How It Works ─────────────────────────────── */

const STEPS = [
  { n: "1", title: "Tell us about your business", body: "A short wizard learns your industry, goals, and current tools." },
  { n: "2", title: "Connect your platforms", body: "One-click official connections for every major marketing channel." },
  { n: "3", title: "We unify your data", body: "Every metric normalized into one source of truth in minutes." },
  { n: "4", title: "Grow, guided by AI", body: "Daily briefings, next actions, and reports that write themselves." },
];

function HowItWorks() {
  return (
    <section className="border-b border-border/70 bg-surface-2/40">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="max-w-2xl">
          <span className="eyebrow">How Rothme works</span>
          <h2 className="mt-4 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Set it up in minutes.{" "}
            <span className="font-serif italic font-normal">Grow every day.</span>
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

/* ─────────────────────────────── Features ─────────────────────────────── */

const FEATURES = [
  { icon: Bot, name: "AI Strategist", tag: "A CMO in your pocket", body: "Reads your marketing every morning and tells you what to do — in plain English." },
  { icon: BarChart3, name: "Unified analytics", tag: "One dashboard, every platform", body: "Every metric normalized. No more tab-hopping to reconcile numbers." },
  { icon: Calendar, name: "Publishing", tag: "Write once, post everywhere", body: "Compose, schedule, and approve posts across every channel from one calendar." },
  { icon: Workflow, name: "Automation", tag: "Rules that run themselves", body: "Alerts, follow-ups, and done-for-you actions that turn insights into progress." },
  { icon: Sparkles, name: "Weekly reports", tag: "Auto-written, plain English", body: "Client-ready briefs generated every Monday. Shareable in one click." },
  { icon: MessageSquare, name: "CRM", tag: "Customer memory across channels", body: "Every conversation, comment, and interaction stitched to one profile." },
  { icon: Users, name: "Team collaboration", tag: "Everyone on the same page", body: "Roles, approvals, comments, and shared workspaces built for real teams." },
  { icon: Plug, name: "Developer Center", tag: "Extend, integrate, ship", body: "Connect any platform, map custom metrics, and build private integrations." },
];

function Features() {
  return (
    <section id="features" className="border-b border-border/70">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="max-w-2xl">
          <span className="eyebrow">Features</span>
          <h2 className="mt-4 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Everything included.{" "}
            <span className="font-serif italic font-normal">One price.</span>
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
            No tiers, no upsells, no locked features. Every business gets the full platform.
          </p>
        </div>
        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.name} className="rounded-xl border border-border bg-surface p-5">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface-2 text-foreground/70">
                  <Icon className="h-4 w-4" />
                </span>
                <h3 className="mt-4 text-[15px] font-semibold tracking-tight text-foreground">{f.name}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.tag}</p>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground/80">{f.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────── Security & Privacy ─────────────────────────────── */

const SECURITY = [
  { icon: ShieldCheck, title: "SOC 2 Type II", body: "Independently audited controls covering security, availability, and confidentiality." },
  { icon: Lock, title: "Encrypted end-to-end", body: "All tokens and business data encrypted at rest with AES-GCM and in transit with TLS 1.3." },
  { icon: Eye, title: "You own your data", body: "Export or delete everything at any time. We never sell, share, or train models on it." },
  { icon: Link2, title: "Official OAuth only", body: "Every connection uses each platform's official OAuth. We never ask for your passwords." },
];

function Security() {
  return (
    <section className="border-b border-border/70 bg-surface-2/40">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="max-w-2xl">
          <span className="eyebrow">Security & Privacy</span>
          <h2 className="mt-4 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Enterprise-grade security.{" "}
            <span className="font-serif italic font-normal">Small-business simple.</span>
          </h2>
        </div>
        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SECURITY.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="rounded-xl border border-border bg-surface p-5">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface-2 text-foreground/70">
                  <Icon className="h-4 w-4" />
                </span>
                <h3 className="mt-4 text-[15px] font-semibold tracking-tight text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────── AI Transparency ─────────────────────────────── */

function AITransparencySection() {
  const points = [
    { title: "Explainable by default", body: "Every insight cites the data it used and gives a confidence rating — high, medium, or low." },
    { title: "Never invents numbers", body: "Rothme's AI only uses metrics from your connected platforms. If data is missing, it says so." },
    { title: "You stay in control", body: "AI suggests, you decide. Nothing publishes or automates without your explicit approval." },
  ];
  return (
    <section className="border-b border-border/70">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="grid gap-14 md:grid-cols-[1fr_1.1fr] md:items-center">
          <div>
            <span className="eyebrow">AI Transparency</span>
            <h2 className="mt-4 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
              AI you can{" "}
              <span className="font-serif italic font-normal">actually trust.</span>
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
              We publish exactly what our AI does, doesn't do, and how it reasons. Read the full transparency report.
            </p>
            <Link to="/ai-transparency" className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-medium text-foreground hover:bg-surface-2">
              Read the transparency report <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {points.map((p) => (
              <div key={p.title} className="rounded-xl border border-border bg-surface p-5">
                <div className="flex items-start gap-3">
                  <div className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface-2 text-primary">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-foreground">{p.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────── Testimonials ─────────────────────────────── */

const TESTIMONIALS = [
  { quote: "I finally know if my ads are working — in one sentence, every morning.", name: "Maya R.", role: "Owner, neighbourhood café" },
  { quote: "It replaced three tools and half a meeting a week.", name: "Daniel K.", role: "Founder, online store" },
  { quote: "Feels like having a marketing person on the team, minus the meetings.", name: "Priya S.", role: "Owner, dental clinic" },
  { quote: "The Monday brief is the only marketing thing I actually read.", name: "Jonas M.", role: "Head of growth, SaaS" },
];

function Testimonials() {
  return (
    <section className="border-b border-border/70 bg-surface-2/40">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="max-w-2xl">
          <span className="eyebrow">What owners say</span>
          <h2 className="mt-4 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            The people who stopped{" "}
            <span className="font-serif italic font-normal">opening dashboards.</span>
          </h2>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="flex h-full flex-col rounded-xl border border-border bg-surface p-6 shadow-xs">
              <div className="mb-3 flex gap-0.5" aria-label="5 out of 5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-foreground/80 text-foreground/80" />
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

/* ─────────────────────────────── Pricing ─────────────────────────────── */

const PRICING_INCLUDES = [
  "Unlimited connected platforms",
  "AI strategist & daily briefings",
  "Publishing & scheduling on every channel",
  "Automation & alerts",
  "Weekly auto-generated reports",
  "CRM & team collaboration",
  "Developer Center & custom integrations",
  "SOC 2, encryption, and priority support",
];

function PricingSection() {
  return (
    <section id="pricing" className="border-b border-border/70">
      <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
        <div className="text-center">
          <span className="eyebrow">Pricing</span>
          <h2 className="mt-4 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            One plan.{" "}
            <span className="font-serif italic font-normal">Everything included.</span>
          </h2>
        </div>
        <div className="mt-12 rounded-2xl border border-border bg-surface p-8 shadow-sm sm:p-10">
          <div className="flex flex-col items-center text-center">
            <span className="rounded-full border border-border bg-surface-2 px-2.5 py-0.5 text-[11px] text-muted-foreground">Rothme</span>
            <div className="mt-5 flex items-baseline gap-1">
              <span className="font-serif text-6xl text-foreground">$200</span>
              <span className="text-sm text-muted-foreground">/ month</span>
            </div>
            <p className="mt-3 max-w-md text-sm text-muted-foreground">
              Everything in Rothme. No add-ons, no seat fees, no upgrade prompts.
            </p>
            <Link to="/get-started" className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90">
              Start free <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-3 text-xs text-muted-foreground">30-day money-back guarantee</p>
          </div>
          <div className="mt-10 grid gap-3 border-t border-border pt-8 sm:grid-cols-2">
            {PRICING_INCLUDES.map((f) => (
              <div key={f} className="flex items-start gap-2 text-sm text-foreground/85">
                <Check className="mt-0.5 h-4 w-4 text-primary" /> {f}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────── FAQ ─────────────────────────────── */

const FAQS = [
  { q: "Do I need to be technical to use Rothme?", a: "No. Rothme is built for business owners, not marketers. Everything is plain English — no jargon, no dashboards to decipher." },
  { q: "Which platforms does Rothme connect to?", a: "Meta Ads, Google Ads, Google Analytics, Shopify, Mailchimp, Instagram, Facebook, TikTok, YouTube, LinkedIn, Google Business Profile, and more — with new integrations added continuously." },
  { q: "How is my data used?", a: "Your data is yours. We never sell it, share it, or train models on it. All tokens are encrypted, and you can export or delete everything at any time." },
  { q: "Can I try it before I pay?", a: "Yes. Start free — no credit card required. We also offer a 30-day money-back guarantee on paid plans." },
  { q: "Does the AI publish or spend money on my behalf?", a: "Never without your explicit approval. Rothme's AI suggests actions, but you always click the button." },
  { q: "Is there a contract or long commitment?", a: "No contracts. Cancel any time with one click — you'll keep access through the end of your billing period." },
];

function FAQ() {
  return (
    <section className="border-b border-border/70 bg-surface-2/40">
      <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
        <div className="text-center">
          <span className="eyebrow">FAQ</span>
          <h2 className="mt-4 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Questions,{" "}
            <span className="font-serif italic font-normal">answered.</span>
          </h2>
        </div>
        <div className="mt-12 divide-y divide-border rounded-xl border border-border bg-surface">
          {FAQS.map((item, i) => <FAQItem key={i} q={item.q} a={item.a} />)}
        </div>
      </div>
    </section>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
        aria-expanded={open}
      >
        <span className="text-[15px] font-medium text-foreground">{q}</span>
        <ChevronDown className={"h-4 w-4 shrink-0 text-muted-foreground transition-transform " + (open ? "rotate-180" : "")} />
      </button>
      {open && (
        <div className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">{a}</div>
      )}
    </div>
  );
}

/* ─────────────────────────────── Footer ─────────────────────────────── */

function Footer() {
  return (
    <footer>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <Wordmark />
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-muted-foreground">
              The AI marketing operating system for business owners.
            </p>
          </div>
          <FooterCol title="Product" links={[
            { label: "Dashboard", href: "#dashboard" },
            { label: "Integrations", href: "#integrations" },
            { label: "Features", href: "#features" },
            { label: "Pricing", href: "#pricing" },
          ]} />
          <FooterCol title="Company" links={[
            { label: "About", href: "#" },
            { label: "Contact", href: "#" },
            { label: "Careers", href: "#" },
            { label: "AI Transparency", to: "/ai-transparency" as const },
          ]} />
          <FooterCol title="Legal" links={[
            { label: "Privacy", href: "#" },
            { label: "Terms", href: "#" },
            { label: "Security", href: "#" },
          ]} />
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} Rothme.</span>
          <span>Grow your business. Smarter.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: Array<{ label: string; href?: string; to?: "/pricing" | "/why" | "/ai-transparency" }> }) {
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

// unused-imports guard
void Target;
