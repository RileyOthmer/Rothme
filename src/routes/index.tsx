import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpen,
  Bot,
  Building2,
  Calendar,
  Check,
  ChevronDown,
  Eye,
  FileText,
  Gauge,
  LayoutDashboard,
  Lightbulb,
  Link2,
  Lock,
  LogOut,
  MessageSquare,
  Play,
  Plug,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
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
      { title: "Rothme — Stop Guessing. Start Understanding Your Marketing." },
      {
        name: "description",
        content:
          "Rothme connects your marketing platforms, monitors lead health, and explains every metric from one trusted dashboard — built for businesses that want confidence, not complexity.",
      },
      { property: "og:title", content: "Rothme — Stop Guessing. Start Understanding Your Marketing." },
      { property: "og:description", content: "One trusted dashboard for every marketing platform. Clear insights, no jargon." },
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
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Header />
      <main>
        <Hero />
        <MarketingProblem />
        <RothmeSolution />
        <TrustedBy />


        <Problem />
        <Solution />
        <DashboardSection />
        <LeadAudit />
        <HealthScore />
        <CheatSheet />
        <IntegrationsSection />
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
  { href: "#features", label: "Features" },
  { href: "#integrations", label: "Integrations" },
  { href: "#pricing", label: "Pricing" },
  { href: "#resources", label: "Resources" },
  { href: "#faq", label: "FAQ" },
];

function Header() {
  const [user, setUser] = useState<null | object>(null);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      listener.subscription.unsubscribe();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  };

  return (
    <header
      className={
        "sticky top-0 z-40 transition-all duration-300 " +
        (scrolled
          ? "border-b border-border/60 bg-background/80 shadow-sm backdrop-blur-md"
          : "border-b border-transparent bg-background/0")
      }
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <span className="font-serif text-[15px] leading-none">R</span>
          </span>
          <Wordmark />
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-muted-foreground lg:flex">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="transition-colors hover:text-foreground">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {mounted && user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1.5">
                <LogOut className="h-3.5 w-3.5" /> Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button size="sm" asChild className="gap-1 shadow-sm">
                <Link to="/get-started">
                  Start Free Trial <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface lg:hidden"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <X className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-border bg-background/95 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-md px-3 py-2 text-sm text-foreground/80 hover:bg-surface-2"
              >
                {l.label}
              </a>
            ))}
            <div className="mt-2 flex gap-2 border-t border-border pt-3">
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button size="sm" className="flex-1" asChild>
                <Link to="/get-started">Start Free Trial</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

/* ─────────────────────────────── Hero ─────────────────────────────── */

const TRUST = [
  { icon: ShieldCheck, label: "Secure Connections" },
  { icon: Building2, label: "Business Focused" },
  { icon: Zap, label: "Simple Setup" },
  { icon: Check, label: "Cancel Anytime" },
];

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <HeroBackground />
      <div className="mx-auto grid max-w-7xl gap-14 px-4 pb-24 pt-16 sm:px-6 sm:pt-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12 lg:px-8 lg:pb-32 lg:pt-28">
        {/* Left */}
        <div className="flex flex-col justify-center">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted-foreground shadow-xs animate-fade-in">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            AI marketing operating system
          </div>

          <h1
            className="mt-6 text-[40px] font-medium leading-[1.02] tracking-tight text-foreground sm:text-[56px] lg:text-[64px] animate-fade-in"
            style={{ animationDelay: "80ms", animationFillMode: "both" }}
          >
            Stop Guessing.
            <br />
            <span className="font-serif italic font-normal">Start Understanding</span>
            <br />
            Your Marketing.
          </h1>

          <p
            className="mt-6 max-w-xl text-[17px] leading-relaxed text-muted-foreground animate-fade-in"
            style={{ animationDelay: "180ms", animationFillMode: "both" }}
          >
            Connect your marketing platforms, monitor your lead health, and understand every metric from one trusted dashboard. No complicated reports. No switching between platforms. Just clear insights built for businesses that want confidence in their marketing.
          </p>

          <div
            className="mt-9 flex flex-col items-start gap-3 sm:flex-row sm:items-center animate-fade-in"
            style={{ animationDelay: "280ms", animationFillMode: "both" }}
          >
            <Link
              to="/get-started"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow-md transition-all hover:shadow-lg hover:-translate-y-px"
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#dashboard"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-5 text-sm font-medium text-foreground shadow-xs transition-all hover:bg-surface-2"
            >
              <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Play className="h-3 w-3 fill-current" />
              </span>
              Watch Demo
            </a>
          </div>

          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
            {TRUST.map((t, i) => {
              const Icon = t.icon;
              return (
                <li
                  key={t.label}
                  className="flex items-center gap-2 text-xs text-muted-foreground animate-fade-in"
                  style={{ animationDelay: `${380 + i * 80}ms`, animationFillMode: "both" }}
                >
                  <span className="grid h-6 w-6 place-items-center rounded-md border border-border bg-surface text-foreground/70">
                    <Icon className="h-3 w-3" />
                  </span>
                  {t.label}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Right */}
        <div
          className="relative animate-slide-in-right"
          style={{ animationDuration: "600ms", animationTimingFunction: "cubic-bezier(0.2, 0.8, 0.2, 1)", animationFillMode: "both" }}
        >
          <HeroDashboard />
        </div>
      </div>
    </section>
  );
}

function HeroBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,oklch(0.85_0.05_255_/_25%)_0%,transparent_45%),radial-gradient(circle_at_85%_20%,oklch(0.9_0.04_180_/_20%)_0%,transparent_50%)]" />
      <div
        className="absolute -left-24 top-24 h-72 w-72 rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(ellipse at center, oklch(0.85 0.06 255 / 45%), transparent 65%)" }}
      />
      <div
        className="absolute right-[-6rem] top-[26rem] h-80 w-80 rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(ellipse at center, oklch(0.85 0.08 320 / 35%), transparent 65%)" }}
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </div>
  );
}

function HeroDashboard() {
  return (
    <div className="relative">
      {/* Floating small card - top */}
      <div className="absolute -left-6 top-8 hidden animate-fade-in rounded-xl border border-border bg-surface p-3 shadow-lg sm:block z-10"
        style={{ animationDelay: "700ms", animationFillMode: "both" }}>
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
            <TrendingUp className="h-4 w-4" />
          </span>
          <div>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Growth</div>
            <div className="text-sm font-semibold text-foreground">+31.4% <span className="text-xs font-normal text-muted-foreground">wk</span></div>
          </div>
        </div>
      </div>

      {/* Floating small card - bottom right */}
      <div className="absolute -bottom-4 right-4 hidden animate-fade-in rounded-xl border border-border bg-surface p-3 shadow-lg sm:block z-10"
        style={{ animationDelay: "820ms", animationFillMode: "both" }}>
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">AI Brief</div>
            <div className="text-sm font-semibold text-foreground">Ready</div>
          </div>
        </div>
      </div>

      {/* Main dashboard */}
      <div className="rounded-2xl border border-border bg-surface p-3 shadow-2xl shadow-primary/5 ring-1 ring-black/[0.02]">
        <div className="rounded-xl bg-gradient-to-br from-surface-2/70 to-surface p-5 sm:p-6">
          {/* Top bar */}
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
            </div>
            <div className="text-xs text-muted-foreground">app.rothme.com / dashboard</div>
            <div className="w-12" />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-6">
            <WidgetCard span="sm:col-span-4">
              <div className="flex items-center gap-2">
                <Gauge className="h-3.5 w-3.5 text-primary" />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Marketing Health Score</span>
              </div>
              <div className="mt-3 flex items-end gap-3">
                <span className="font-serif text-5xl leading-none text-foreground">82</span>
                <span className="pb-1 text-xs text-muted-foreground">/ 100 · Strong</span>
              </div>
              <div className="mt-4 grid grid-cols-4 gap-1.5">
                {[88, 74, 91, 68].map((s, i) => (
                  <div key={i} className="h-1 overflow-hidden rounded-full bg-border">
                    <div className="h-full bg-primary" style={{ width: `${s}%` }} />
                  </div>
                ))}
              </div>
            </WidgetCard>

            <WidgetCard span="sm:col-span-2">
              <div className="flex items-center gap-2">
                <Search className="h-3.5 w-3.5 text-primary" />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Lead Audit</span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-sm font-medium text-foreground">Healthy</span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">142 leads tracked</div>
              <div className="mt-3 text-[11px] text-muted-foreground">1 action recommended</div>
            </WidgetCard>

            <WidgetCard span="sm:col-span-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Growth · last 14 days</span>
              </div>
              <MiniChart />
            </WidgetCard>

            <WidgetCard span="sm:col-span-3">
              <div className="flex items-center gap-2">
                <Plug className="h-3.5 w-3.5 text-primary" />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Connected Platforms</span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {[
                  { m: "Ma", c: "#1877F2" }, { m: "Ga", c: "#4285F4" }, { m: "Sh", c: "#96BF48" },
                  { m: "Mc", c: "#FFB800" }, { m: "Ig", c: "#E4405F" }, { m: "Tt", c: "#111" },
                ].map((p, i) => (
                  <span key={i} className="grid h-7 w-7 place-items-center rounded-md text-[10px] font-semibold text-white shadow-xs" style={{ background: p.c }}>{p.m}</span>
                ))}
                <span className="grid h-7 w-7 place-items-center rounded-md border border-dashed border-border text-[10px] text-muted-foreground">+4</span>
              </div>
              <div className="mt-3 text-[11px] text-muted-foreground">All syncing · 2 min ago</div>
            </WidgetCard>

            <WidgetCard span="sm:col-span-3">
              <div className="flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-primary" />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Recent Activity</span>
              </div>
              <ul className="mt-3 space-y-2">
                {[
                  { d: "Reel posted to Instagram", t: "12m" },
                  { d: "42 new leads from Meta Ads", t: "1h" },
                  { d: "Weekly report generated", t: "3h" },
                ].map((a, i) => (
                  <li key={i} className="flex items-start justify-between gap-2 text-[11px]">
                    <span className="truncate text-foreground/85">{a.d}</span>
                    <span className="shrink-0 text-muted-foreground">{a.t}</span>
                  </li>
                ))}
              </ul>
            </WidgetCard>

            <WidgetCard span="sm:col-span-3">
              <div className="flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 text-primary" />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Weekly Report · Preview</span>
              </div>
              <p className="mt-3 font-serif text-[13px] leading-snug text-foreground">
                "Your ads are quietly having their best week of the quarter."
              </p>
              <div className="mt-3 flex items-center gap-1.5">
                <span className="rounded-full border border-border bg-surface-2 px-2 py-0.5 text-[10px] text-muted-foreground">high confidence</span>
                <span className="text-[10px] text-muted-foreground">· ready to share</span>
              </div>
            </WidgetCard>
          </div>
        </div>
      </div>
    </div>
  );
}

function WidgetCard({ children, span = "" }: { children: React.ReactNode; span?: string }) {
  return (
    <div className={"rounded-xl border border-border bg-surface p-4 shadow-xs " + span}>{children}</div>
  );
}

function MiniChart() {
  const pts = [22, 28, 26, 34, 30, 38, 42, 40, 48, 54, 60, 58, 66, 74];
  const max = Math.max(...pts);
  const min = Math.min(...pts);
  const w = 200;
  const h = 64;
  const step = w / (pts.length - 1);
  const y = (v: number) => h - ((v - min) / (max - min || 1)) * h;
  const d = pts.map((v, i) => `${i === 0 ? "M" : "L"} ${i * step} ${y(v)}`).join(" ");
  const area = `${d} L ${w} ${h} L 0 ${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-3 h-16 w-full">
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#grad)" className="text-primary" />
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
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

/* ─────────────────────────────── Section shell ─────────────────────────────── */

function Section({
  id, tint, children,
}: { id?: string; tint?: boolean; children: React.ReactNode }) {
  return (
    <section id={id} className={"border-b border-border/70 " + (tint ? "bg-surface-2/40" : "")}>
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}

function SectionHead({ eyebrow, title, italic, sub }: { eyebrow: string; title: string; italic?: string; sub?: string }) {
  return (
    <div className="max-w-2xl">
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="mt-4 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
        {title}
        {italic ? <> <span className="font-serif italic font-normal">{italic}</span></> : null}
      </h2>
      {sub && <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">{sub}</p>}
    </div>
  );
}

/* ─────────────────────────── Marketing Problem ─────────────────────────── */

const PLATFORM_CHIPS = [
  { name: "Instagram", initial: "IG", top: "4%", left: "8%", delay: "0s", tint: "from-pink-500/15 to-orange-400/10" },
  { name: "Facebook", initial: "f", top: "2%", left: "48%", delay: "1.2s", tint: "from-blue-500/15 to-indigo-400/10" },
  { name: "TikTok", initial: "TT", top: "16%", left: "78%", delay: "0.6s", tint: "from-slate-800/10 to-teal-400/10" },
  { name: "YouTube", initial: "YT", top: "24%", left: "22%", delay: "1.8s", tint: "from-red-500/15 to-rose-400/10" },
  { name: "Google Analytics", initial: "GA", top: "36%", left: "58%", delay: "0.3s", tint: "from-amber-500/15 to-orange-400/10" },
  { name: "Google Ads", initial: "Ad", top: "44%", left: "6%", delay: "2.1s", tint: "from-emerald-500/15 to-lime-400/10" },
  { name: "Business Profile", initial: "GB", top: "50%", left: "80%", delay: "0.9s", tint: "from-sky-500/15 to-blue-400/10" },
  { name: "Gmail", initial: "GM", top: "60%", left: "40%", delay: "1.5s", tint: "from-red-400/15 to-yellow-400/10" },
  { name: "Outlook", initial: "OL", top: "68%", left: "10%", delay: "0.4s", tint: "from-blue-600/15 to-cyan-400/10" },
  { name: "HubSpot", initial: "HS", top: "72%", left: "68%", delay: "2.3s", tint: "from-orange-500/15 to-amber-400/10" },
  { name: "Twilio", initial: "Tw", top: "84%", left: "32%", delay: "1.0s", tint: "from-red-500/15 to-pink-400/10" },
  { name: "Mailchimp", initial: "MC", top: "88%", left: "60%", delay: "0.2s", tint: "from-yellow-500/15 to-amber-400/10" },
  { name: "Klaviyo", initial: "Kl", top: "82%", left: "84%", delay: "1.7s", tint: "from-emerald-600/15 to-teal-400/10" },
];

const MARKETING_PAINS = [
  { title: "Too Many Dashboards", body: "Your marketing lives across multiple platforms, making it difficult to see the complete picture." },
  { title: "Hard To Understand", body: "Reports are filled with numbers and charts, but rarely explain what you're looking at." },
  { title: "Problems Go Unnoticed", body: "Broken tracking, disconnected integrations, or lead capture issues can quietly impact your business." },
  { title: "Leads Get Lost", body: "Without visibility into your marketing ecosystem, opportunities can be missed before anyone notices." },
];

function MarketingProblem() {
  return (
    <section id="marketing-problem" className="border-b border-border/70 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-28 md:py-32">
        <div className="mx-auto max-w-3xl text-center animate-rise">
          <span className="eyebrow">The marketing problem</span>
          <h2 className="mt-4 font-serif text-4xl leading-[1.05] tracking-tight text-foreground sm:text-5xl">
            Marketing shouldn't require opening <span className="italic text-primary">ten different platforms.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Every day, businesses switch between multiple dashboards just to understand what is happening.
            Marketing data is scattered everywhere. Time is wasted. Important issues go unnoticed.
            And valuable leads can slip through the cracks.
          </p>
        </div>

        <div className="mt-16 grid gap-10 md:mt-20 md:grid-cols-2 md:gap-12 md:items-center">
          {/* Left: scattered floating platform chips */}
          <div
            className="order-1 relative h-[440px] w-full overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-surface-2/60 via-white to-surface-2/40 shadow-sm sm:h-[500px]"
            aria-hidden="true"
          >
            <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_1px_1px,theme(colors.slate.200)_1px,transparent_0)] [background-size:22px_22px]" />
            {PLATFORM_CHIPS.map((p) => (
              <div
                key={p.name}
                className="absolute animate-float"
                style={{ top: p.top, left: p.left, animationDelay: p.delay }}
              >
                <div className="flex items-center gap-2.5 rounded-2xl border border-border/80 bg-white/95 px-3.5 py-2.5 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.18)] backdrop-blur">
                  <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${p.tint} text-[11px] font-semibold text-foreground/80`}>
                    {p.initial}
                  </div>
                  <span className="whitespace-nowrap text-[13px] font-medium text-foreground/85">{p.name}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Right: pain point cards */}
          <div className="order-2 grid gap-4 sm:grid-cols-2">
            {MARKETING_PAINS.map((p, i) => (
              <div
                key={p.title}
                className="animate-rise rounded-2xl border border-border/70 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-20px_rgba(15,23,42,0.15)] transition hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(15,23,42,0.05),0_20px_40px_-20px_rgba(15,23,42,0.2)]"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-surface-2/70 text-foreground/70">
                  <span className="text-[13px] font-semibold">{i + 1}</span>
                </div>
                <h3 className="mt-4 text-[15px] font-semibold text-foreground">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-20 max-w-3xl text-center">
          <p className="font-serif text-2xl leading-snug text-foreground sm:text-3xl md:text-4xl">
            Every platform tells part of the story.
            <br />
            <span className="italic text-primary">Rothme helps you see the whole picture.</span>
          </p>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────── Problem ─────────────────────────────── */


const PROBLEMS = [
  { title: "Six tabs, no answers", body: "Meta, Google, Shopify, Mailchimp… you open them all and still can't tell what's actually working." },
  { title: "Dashboards that require a translator", body: "CTR, ROAS, CAC — you shouldn't need a marketing degree to understand your own business." },
  { title: "Advice that never lands", body: "Every tool tells you to do more. None tell you the one thing to do today." },
];

function Problem() {
  return (
    <Section id="problem">
      <SectionHead
        eyebrow="The problem"
        title="Marketing tools were built for marketers."
        italic="You're a business owner."
      />
      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {PROBLEMS.map((p) => (
          <div key={p.title} className="rounded-2xl border border-border bg-surface p-6 shadow-xs">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-2 text-foreground/70">
              <X className="h-4 w-4" />
            </div>
            <h3 className="mt-4 text-[15px] font-semibold text-foreground">{p.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
          </div>
        ))}
      </div>
    </Section>
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
    <Section id="solution" tint>
      <div className="grid gap-14 md:grid-cols-2 md:items-center">
        <div>
          <SectionHead
            eyebrow="The solution"
            title="One workspace."
            italic="One clear answer."
            sub="Rothme unifies your marketing, then hands it to an AI strategist trained to answer four questions: what happened, why, what should I do, and can we help."
          />
          <ul className="mt-6 space-y-3">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-2.5 text-sm text-foreground/85">
                <span className="mt-0.5 grid h-5 w-5 place-items-center rounded-full bg-primary/10 text-primary">
                  <Check className="h-3 w-3" />
                </span>
                {b}
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
    </Section>
  );
}

/* ─────────────────────────────── Dashboard section ─────────────────────────────── */

function DashboardSection() {
  return (
    <Section id="dashboard">
      <SectionHead
        eyebrow="The Executive Brief"
        title="The dashboard that"
        italic="reads itself to you."
        sub="No 12-widget wall of numbers. One paragraph, one action, one confidence level — every morning."
      />
      <div className="mt-14 rounded-2xl border border-border bg-surface p-3 shadow-2xl shadow-primary/5">
        <div className="rounded-xl bg-gradient-to-br from-surface-2/60 to-surface p-6 sm:p-10">
          <div className="mb-5 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="eyebrow">This morning</span>
            <span className="ml-auto rounded-full border border-border bg-surface px-2 py-0.5 text-[10px] text-muted-foreground">high confidence</span>
          </div>
          <p className="font-serif text-2xl leading-snug text-foreground sm:text-3xl">
            Your ads are quietly having their best week of the quarter.
          </p>
          <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-muted-foreground">
            Instagram brought in 42 new customers — up 31% on last week — mostly from the reel you posted Tuesday. One thing to do today: reply to the 4 comments waiting on that post.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-3 text-center">
            {[
              { l: "New customers", v: "42", d: "+31%" },
              { l: "Ad spend", v: "$318", d: "−12%" },
              { l: "Reach", v: "18.4k", d: "+9%" },
            ].map((m) => (
              <div key={m.l} className="rounded-xl border border-border bg-surface p-4">
                <div className="text-xs text-muted-foreground">{m.l}</div>
                <div className="mt-1 font-serif text-2xl text-foreground">{m.v}</div>
                <div className="mt-0.5 text-[11px] font-medium text-emerald-600">{m.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
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
    <Section tint>
      <div className="grid gap-14 md:grid-cols-[1fr_1.1fr] md:items-center">
        <div>
          <SectionHead
            eyebrow="Lead Audit"
            title="Know where every customer"
            italic="actually comes from."
            sub="Rothme traces every lead back to the ad, post, or channel that started it — then tells you plainly what to double down on and what to cut."
          />
        </div>
        <div className="space-y-3">
          {items.map((i) => (
            <div key={i.title} className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Search className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[15px] font-semibold text-foreground">{i.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{i.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ─────────────────────────────── Health Score ─────────────────────────────── */

function HealthScore() {
  return (
    <Section>
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
          <SectionHead
            eyebrow="Marketing Health Score"
            title="One number for the health of your"
            italic="entire marketing engine."
            sub="Reach, conversion, retention, and ad efficiency — scored, trended, and explained. You'll know instantly whether things are improving or slipping."
          />
        </div>
      </div>
    </Section>
  );
}

/* ─────────────────────────────── Cheat Sheet ─────────────────────────────── */

function CheatSheet() {
  const cards = [
    { title: "This week", tone: "primary", body: "Post twice on Instagram — carousels are outperforming reels 3:1 for your niche." },
    { title: "This month", tone: "default", body: "Retarget your Shopify cart abandoners on Meta. Estimated payback: 8 days." },
    { title: "This quarter", tone: "default", body: "Launch a referral program. Your top 10% of customers already refer without incentive." },
  ];
  return (
    <Section tint>
      <SectionHead
        eyebrow="Marketing Cheat Sheet"
        title="The next best move,"
        italic="already written."
        sub="Prioritized recommendations for this week, this month, and this quarter — with evidence and estimated impact."
      />
      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {cards.map((c) => (
          <div key={c.title} className={"rounded-2xl border p-6 shadow-xs " + (c.tone === "primary" ? "border-primary/40 bg-primary/[0.04]" : "border-border bg-surface")}>
            <div className="flex items-center gap-2">
              <Lightbulb className={"h-4 w-4 " + (c.tone === "primary" ? "text-primary" : "text-foreground/60")} />
              <span className="eyebrow">{c.title}</span>
            </div>
            <p className="mt-4 font-serif text-lg leading-snug text-foreground">{c.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ─────────────────────────────── Integrations ─────────────────────────────── */

const INTEGRATION_MARKS = [
  { mark: "Ma", name: "Meta Ads", color: "#1877F2" },
  { mark: "Ga", name: "Google Ads", color: "#4285F4" },
  { mark: "Ga", name: "Google Analytics", color: "#E37400" },
  { mark: "Sh", name: "Shopify", color: "#96BF48" },
  { mark: "Mc", name: "Mailchimp", color: "#FFB800" },
  { mark: "Ig", name: "Instagram", color: "#E4405F" },
  { mark: "Fb", name: "Facebook", color: "#1877F2" },
  { mark: "Tt", name: "TikTok", color: "#111111" },
  { mark: "Yt", name: "YouTube", color: "#FF0000" },
  { mark: "Li", name: "LinkedIn", color: "#0A66C2" },
  { mark: "Gb", name: "Google Business", color: "#34A853" },
  { mark: "Rs", name: "Resend", color: "#111111" },
];

function IntegrationsSection() {
  return (
    <Section id="integrations">
      <SectionHead
        eyebrow="Integrations"
        title="Every platform you use,"
        italic="already speaking the same language."
        sub="One-click official connections. Rothme normalizes every metric so cross-platform decisions actually make sense."
      />
      <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {INTEGRATION_MARKS.map((i) => (
          <div key={i.name} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 shadow-xs transition-shadow hover:shadow-md">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-xs font-semibold text-white" style={{ background: i.color }}>{i.mark}</span>
            <span className="truncate text-sm text-foreground">{i.name}</span>
          </div>
        ))}
      </div>
    </Section>
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
    <Section tint>
      <SectionHead
        eyebrow="How Rothme works"
        title="Set it up in minutes."
        italic="Grow every day."
      />
      <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-4">
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
    </Section>
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
    <Section id="features">
      <SectionHead
        eyebrow="Features"
        title="Everything included."
        italic="One price."
        sub="No tiers, no upsells, no locked features. Every business gets the full platform."
      />
      <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.name} className="rounded-2xl border border-border bg-surface p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </span>
              <h3 className="mt-4 text-[15px] font-semibold tracking-tight text-foreground">{f.name}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.tag}</p>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground/80">{f.body}</p>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

/* ─────────────────────────────── Security ─────────────────────────────── */

const SECURITY = [
  { icon: ShieldCheck, title: "SOC 2 Type II", body: "Independently audited controls covering security, availability, and confidentiality." },
  { icon: Lock, title: "Encrypted end-to-end", body: "All tokens and business data encrypted at rest with AES-GCM and in transit with TLS 1.3." },
  { icon: Eye, title: "You own your data", body: "Export or delete everything at any time. We never sell, share, or train models on it." },
  { icon: Link2, title: "Official OAuth only", body: "Every connection uses each platform's official OAuth. We never ask for your passwords." },
];

function Security() {
  return (
    <Section tint>
      <SectionHead
        eyebrow="Security & Privacy"
        title="Enterprise-grade security."
        italic="Small-business simple."
      />
      <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {SECURITY.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.title} className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </span>
              <h3 className="mt-4 text-[15px] font-semibold tracking-tight text-foreground">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </div>
          );
        })}
      </div>
    </Section>
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
    <Section id="resources">
      <div className="grid gap-14 md:grid-cols-[1fr_1.1fr] md:items-center">
        <div>
          <SectionHead
            eyebrow="AI Transparency"
            title="AI you can"
            italic="actually trust."
            sub="We publish exactly what our AI does, doesn't do, and how it reasons. Read the full transparency report."
          />
          <Link to="/ai-transparency" className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-medium text-foreground shadow-xs hover:bg-surface-2">
            Read the transparency report <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="space-y-3">
          {points.map((p) => (
            <div key={p.title} className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Zap className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[15px] font-semibold text-foreground">{p.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
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
    <Section tint>
      <SectionHead
        eyebrow="What owners say"
        title="The people who stopped"
        italic="opening dashboards."
      />
      <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {TESTIMONIALS.map((t) => (
          <figure key={t.name} className="flex h-full flex-col rounded-2xl border border-border bg-surface p-6 shadow-xs">
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
    </Section>
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
      <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="eyebrow">Pricing</span>
          <h2 className="mt-4 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            One plan.{" "}
            <span className="font-serif italic font-normal">Everything included.</span>
          </h2>
        </div>
        <div className="mt-12 rounded-3xl border border-border bg-surface p-8 shadow-lg sm:p-10">
          <div className="flex flex-col items-center text-center">
            <span className="rounded-full border border-border bg-surface-2 px-2.5 py-0.5 text-[11px] text-muted-foreground">Rothme</span>
            <div className="mt-5 flex items-baseline gap-1">
              <span className="font-serif text-6xl text-foreground">$200</span>
              <span className="text-sm text-muted-foreground">/ month</span>
            </div>
            <p className="mt-3 max-w-md text-sm text-muted-foreground">
              Everything in Rothme. No add-ons, no seat fees, no upgrade prompts.
            </p>
            <Link to="/get-started" className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow-md hover:shadow-lg hover:-translate-y-px transition-all">
              Start Free Trial <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-3 text-xs text-muted-foreground">30-day money-back guarantee</p>
          </div>
          <div className="mt-10 grid gap-3 border-t border-border pt-8 sm:grid-cols-2">
            {PRICING_INCLUDES.map((f) => (
              <div key={f} className="flex items-start gap-2 text-sm text-foreground/85">
                <span className="mt-0.5 grid h-5 w-5 place-items-center rounded-full bg-primary/10 text-primary">
                  <Check className="h-3 w-3" />
                </span>
                {f}
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
    <section id="faq" className="border-b border-border/70 bg-surface-2/40">
      <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="eyebrow">FAQ</span>
          <h2 className="mt-4 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Questions,{" "}
            <span className="font-serif italic font-normal">answered.</span>
          </h2>
        </div>
        <div className="mt-12 divide-y divide-border rounded-2xl border border-border bg-surface shadow-xs">
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
        <div className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground animate-fade-in">{a}</div>
      )}
    </div>
  );
}

/* ─────────────────────────────── Footer ─────────────────────────────── */

function Footer() {
  return (
    <footer>
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                <span className="font-serif text-[15px] leading-none">R</span>
              </span>
              <Wordmark />
            </Link>
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-muted-foreground">
              The AI marketing operating system for business owners.
            </p>
          </div>
          <FooterCol title="Product" links={[
            { label: "Features", href: "#features" },
            { label: "Integrations", href: "#integrations" },
            { label: "Pricing", href: "#pricing" },
            { label: "FAQ", href: "#faq" },
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
