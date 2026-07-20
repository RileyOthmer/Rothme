import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  BookOpen,
  Bot,
  Building2,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
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
  Settings as SettingsIcon,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingDown,
  TrendingUp,
  Users,
  Workflow,
  X,
  Zap,
} from "lucide-react";


import { useEffect, useRef, useState } from "react";
import { Wordmark } from "@/components/brand/Wordmark";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

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

/* ─────────────────────────── Rothme Solution ─────────────────────────── */

const SOLUTION_PLATFORMS = [
  { name: "Instagram", initial: "IG" },
  { name: "Facebook", initial: "f" },
  { name: "TikTok", initial: "TT" },
  { name: "YouTube", initial: "YT" },
  { name: "LinkedIn", initial: "in" },
  { name: "Google Analytics", initial: "GA" },
  { name: "Google Ads", initial: "Ad" },
  { name: "Business Profile", initial: "GB" },
  { name: "Gmail", initial: "GM" },
  { name: "Outlook", initial: "OL" },
  { name: "HubSpot", initial: "HS" },
  { name: "Mailchimp", initial: "MC" },
  { name: "Klaviyo", initial: "Kl" },
  { name: "Twilio", initial: "Tw" },
];

const SOLUTION_FEATURES = [
  { title: "Unified Dashboard", body: "View your marketing performance across connected platforms from one centralized dashboard.", Icon: LayoutDashboard },
  { title: "Lead Audit", body: "Monitor your marketing ecosystem for issues such as disconnected integrations, tracking problems, and lead capture errors.", Icon: ShieldCheck },
  { title: "Marketing Health Score", body: "Quickly understand the health of your connected marketing systems with a simple overall score.", Icon: Activity },
  { title: "Marketing Cheat Sheet", body: "Click any metric to instantly understand what it means through clear educational explanations.", Icon: BookOpen },
];

const SOLUTION_STATS = [
  { label: "Connected Platforms", value: 14, suffix: "+" },
  { label: "Marketing Metrics", value: 150, suffix: "+" },
  { label: "Health Checks", value: 100, suffix: "+" },
  { label: "Educational Topics", value: 500, suffix: "+" },
];

function useInView<T extends HTMLElement>(options?: IntersectionObserverInit) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node || inView) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.25, ...options },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [inView, options]);
  return { ref, inView };
}

function CountUp({ end, suffix = "", duration = 1400 }: { end: number; suffix?: string; duration?: number }) {
  const { ref, inView } = useInView<HTMLSpanElement>();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(end * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, end, duration]);
  return (
    <span ref={ref}>
      {n.toLocaleString()}
      {suffix}
    </span>
  );
}

function SolutionDiagram() {
  // Distribute platforms around a circle around the central Rothme node.
  const platforms = SOLUTION_PLATFORMS;
  const cx = 50;
  const cy = 50;
  const rOuter = 40;
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-white via-surface-2/30 to-white shadow-sm">
      <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_1px_1px,theme(colors.slate.200)_1px,transparent_0)] [background-size:22px_22px]" />
      <div className="pointer-events-none absolute -inset-24 opacity-40 blur-3xl [background:radial-gradient(circle_at_center,theme(colors.primary/15),transparent_60%)]" />

      {/* Connection lines (SVG) */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="rothme-line" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.05" />
            <stop offset="60%" stopColor="currentColor" stopOpacity="0.35" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.7" />
          </linearGradient>
        </defs>
        {platforms.map((_, i) => {
          const angle = (i / platforms.length) * Math.PI * 2 - Math.PI / 2;
          const x = cx + Math.cos(angle) * rOuter;
          const y = cy + Math.sin(angle) * rOuter;
          return (
            <line
              key={i}
              x1={x}
              y1={y}
              x2={cx}
              y2={cy}
              stroke="url(#rothme-line)"
              strokeWidth="0.4"
              className="text-primary"
              style={{
                strokeDasharray: 2,
                animation: `dash-flow 3.5s linear infinite`,
                animationDelay: `${i * 0.15}s`,
              }}
            />
          );
        })}
      </svg>

      {/* Platform chips positioned around */}
      {platforms.map((p, i) => {
        const angle = (i / platforms.length) * Math.PI * 2 - Math.PI / 2;
        const x = 50 + Math.cos(angle) * rOuter;
        const y = 50 + Math.sin(angle) * rOuter;
        return (
          <div
            key={p.name}
            className="absolute animate-float"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: "translate(-50%, -50%)",
              animationDelay: `${(i % 6) * 0.4}s`,
            }}
          >
            <div className="flex items-center gap-2 rounded-full border border-border/80 bg-white/95 px-3 py-1.5 shadow-[0_8px_20px_-12px_rgba(15,23,42,0.2)] backdrop-blur">
              <div className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-surface-2 text-[10px] font-semibold text-foreground/75">
                {p.initial}
              </div>
              <span className="hidden whitespace-nowrap text-[11px] font-medium text-foreground/80 sm:inline">
                {p.name}
              </span>
            </div>
          </div>
        );
      })}

      {/* Central Rothme node */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative">
          <div className="absolute inset-0 -m-4 rounded-3xl bg-primary/20 blur-2xl" />
          <div className="relative flex flex-col items-center gap-2 rounded-2xl border border-border bg-white px-6 py-5 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.35)]">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="font-serif text-lg leading-none tracking-tight text-foreground">Rothme</div>
            <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              One dashboard
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RothmeSolution() {
  return (
    <section id="rothme-solution" className="border-b border-border/70 bg-white">
      <style>{`
        @keyframes dash-flow { to { stroke-dashoffset: -20; } }
      `}</style>
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-28 md:py-32">
        <div className="mx-auto max-w-3xl text-center animate-rise">
          <span className="eyebrow">The Rothme solution</span>
          <h2 className="mt-4 font-serif text-4xl leading-[1.05] tracking-tight text-foreground sm:text-5xl">
            Everything. <span className="italic text-primary">One place.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Connect your marketing platforms, monitor your business, understand every metric, and protect
            every lead from a single dashboard. No switching between apps. No confusing reports. Just
            complete visibility into your marketing.
          </p>
        </div>

        <div className="mt-16 grid gap-10 md:mt-20 md:grid-cols-2 md:items-center md:gap-14">
          <div className="order-1 animate-rise">
            <SolutionDiagram />
          </div>

          <div className="order-2 grid gap-4 sm:grid-cols-2">
            {SOLUTION_FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="animate-rise rounded-2xl border border-border/70 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-20px_rgba(15,23,42,0.15)] transition hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(15,23,42,0.05),0_20px_40px_-20px_rgba(15,23,42,0.2)]"
                style={{ animationDelay: `${i * 90}ms` }}
              >
                <div className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-surface-2/70 text-primary">
                  <f.Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-[15px] font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Statistics bar */}
        <div className="mt-20">
          <div className="grid gap-3 rounded-3xl border border-border/70 bg-gradient-to-br from-surface-2/50 via-white to-surface-2/40 p-4 shadow-sm sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
            {SOLUTION_STATS.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-border/60 bg-white px-6 py-6 text-center"
              >
                <div className="font-serif text-4xl leading-none tracking-tight text-foreground sm:text-5xl">
                  <CountUp end={s.value} suffix={s.suffix} />
                </div>
                <div className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            More integrations and educational content are continuously added through platform updates.
          </p>
        </div>

        <div className="mx-auto mt-20 max-w-3xl text-center">
          <p className="font-serif text-2xl leading-snug text-foreground sm:text-3xl md:text-4xl">
            Marketing doesn't have to be complicated.
            <br />
            <span className="italic text-primary">Rothme was built to make it understandable.</span>
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

/* ─────────────────────────── Dashboard preview ─────────────────────────── */

const DASH_SIDEBAR = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Analytics", icon: BarChart3 },
  { label: "Lead Audit", icon: ShieldCheck },
  { label: "Marketing Health", icon: Activity },
  { label: "Cheat Sheet", icon: BookOpen },
  { label: "Reports", icon: FileText },
  { label: "Integrations", icon: Plug },
  { label: "Notifications", icon: Bell },
  { label: "Settings", icon: SettingsIcon },
];

const DASH_PLATFORMS = [
  { name: "Instagram", initial: "IG" },
  { name: "Facebook", initial: "f" },
  { name: "TikTok", initial: "TT" },
  { name: "YouTube", initial: "YT" },
  { name: "Google Analytics", initial: "GA" },
  { name: "Google Ads", initial: "Ad" },
  { name: "HubSpot", initial: "HS" },
  { name: "Twilio", initial: "Tw" },
  { name: "Gmail", initial: "GM" },
  { name: "Outlook", initial: "OL" },
];

const DASH_PERFORMANCE = [
  { name: "Instagram", value: 92 },
  { name: "Facebook", value: 74 },
  { name: "TikTok", value: 61 },
  { name: "LinkedIn", value: 48 },
  { name: "YouTube", value: 39 },
];

type DashMetric = {
  label: string;
  value: string;
  delta: string;
  positive: boolean;
  previous: string;
  definition: string;
  why: string;
  formula?: string;
  howCalc: string;
  related: string[];
  faqs: { q: string; a: string }[];
};

const DASH_METRICS: DashMetric[] = [
  {
    label: "Followers", value: "48,204", delta: "+3.2%", positive: true, previous: "46,712",
    definition: "The total number of accounts following your connected profiles across every platform.",
    why: "Followers represent an audience you can reach without paying — the foundation of organic distribution.",
    howCalc: "Rothme sums follower counts across every connected social account, refreshed every 15 minutes.",
    related: ["Reach", "Impressions", "Engagement rate"],
    faqs: [
      { q: "Does this include followers I lost?", a: "Yes — the number is net: new followers minus unfollows." },
      { q: "How often does this update?", a: "Every 15 minutes for connected platforms; hourly for platforms with rate limits." },
    ],
  },
  {
    label: "Reach", value: "182,940", delta: "+11.4%", positive: true, previous: "164,220",
    definition: "The number of unique people who saw any of your content in the selected date range.",
    why: "Reach tells you how far your marketing traveled — how many distinct humans, not just impressions.",
    howCalc: "Rothme deduplicates viewers per platform, then sums across platforms (people on multiple platforms are counted once per platform).",
    related: ["Impressions", "Followers", "CTR"],
    faqs: [{ q: "What's the difference from impressions?", a: "Reach = unique people. Impressions = total views, including repeat views by the same person." }],
  },
  {
    label: "Impressions", value: "412,558", delta: "+8.1%", positive: true, previous: "381,662",
    definition: "The total number of times your content was shown, including repeat views by the same viewer.",
    why: "Impressions measure exposure volume. Paired with Reach, they show how repeatedly your audience sees you.",
    formula: "Impressions ÷ Reach = Frequency",
    howCalc: "Aggregated from each platform's reporting API for the selected date range.",
    related: ["Reach", "CTR", "Followers"],
    faqs: [{ q: "Higher impressions = better?", a: "Not always. Very high impressions with low reach means the same people are seeing your content over and over." }],
  },
  {
    label: "CTR", value: "3.42%", delta: "+0.4pp", positive: true, previous: "3.02%",
    definition: "Click-through rate — the percentage of impressions that resulted in a click.",
    why: "CTR shows how compelling your creative and message are to the audience actually seeing it.",
    formula: "CTR = (Clicks ÷ Impressions) × 100",
    howCalc: "Rothme divides total clicks by total impressions across all connected paid and organic sources for the period.",
    related: ["Impressions", "Website Clicks", "Conversions"],
    faqs: [{ q: "What's a good CTR?", a: "It depends on the channel — social averages 1–3%, search ads 3–6%. Rothme compares you to your own historical baseline." }],
  },
  {
    label: "Website Clicks", value: "12,884", delta: "+6.8%", positive: true, previous: "12,062",
    definition: "The number of clicks that sent someone to your website from any connected marketing channel.",
    why: "This is the top of your website funnel — the raw traffic your marketing is generating.",
    howCalc: "Combined from UTM-tagged link clicks in social, ads, and email connectors.",
    related: ["CTR", "Leads", "Conversions"],
    faqs: [{ q: "Does this match Google Analytics?", a: "Close, but not identical — GA counts sessions with attribution windows, Rothme counts click events." }],
  },
  {
    label: "Leads", value: "1,204", delta: "+14.2%", positive: true, previous: "1,054",
    definition: "New prospective customers captured through forms, sign-ups, or conversion events.",
    why: "Leads are the direct output of your marketing — the people your business can now follow up with.",
    howCalc: "Aggregated from form submissions, lead ads, and conversion events in your connected platforms.",
    related: ["Conversions", "Revenue", "Website Clicks"],
    faqs: [{ q: "Are duplicates counted?", a: "No — Rothme deduplicates by email address across sources." }],
  },
  {
    label: "Conversions", value: "312", delta: "−1.9%", positive: false, previous: "318",
    definition: "The number of leads or visitors who completed a defined goal action (purchase, booking, sign-up).",
    why: "Conversions are the events tied most directly to business outcomes.",
    formula: "Conversion rate = (Conversions ÷ Website Clicks) × 100",
    howCalc: "Pulled from the conversion events you've defined in each connected platform (GA4 goals, Meta pixel events, Shopify orders).",
    related: ["Leads", "Revenue", "CTR"],
    faqs: [{ q: "Why is this lower than leads?", a: "Not every lead completes the goal. The gap between leads and conversions is your conversion funnel." }],
  },
  {
    label: "Revenue", value: "$48,210", delta: "+9.6%", positive: true, previous: "$43,988",
    definition: "Revenue attributed to marketing-driven sessions across your connected commerce platforms.",
    why: "Revenue is the bottom line — the number that decides whether marketing is paying for itself.",
    howCalc: "Rothme reads order totals from your commerce integrations (Shopify, Stripe) and attributes them to the marketing source of the visit.",
    related: ["Conversions", "Leads", "CTR"],
    faqs: [{ q: "Does this include refunds?", a: "Yes — refunds within the period are subtracted from revenue." }],
  },
];

const DASH_ACTIVITY = [
  { text: "Google Analytics synced successfully", when: "2m ago" },
  { text: "Lead Audit completed", when: "18m ago" },
  { text: "Weekly Report generated", when: "1h ago" },
  { text: "Meta Pixel connected", when: "3h ago" },
  { text: "Website health check passed", when: "6h ago" },
  { text: "Email integration connected", when: "Yesterday" },
];

const DASH_UPCOMING = [
  { title: "Weekly Marketing Report", when: "Monday", icon: FileText },
  { title: "Monthly Executive Report", when: "1st of Month", icon: BarChart3 },
  { title: "Lead Audit", when: "Tomorrow", icon: ShieldCheck },
];

function DashboardSection() {
  return (
    <section id="dashboard" className="border-b border-border/70 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-28 md:py-32">
        <div className="mx-auto max-w-3xl text-center animate-rise">
          <span className="eyebrow">The dashboard</span>
          <h2 className="mt-4 font-serif text-4xl leading-[1.05] tracking-tight text-foreground sm:text-5xl">
            Your Marketing.
            <br />
            <span className="italic text-primary">One Dashboard.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            See your marketing performance, monitor your lead health, and understand your business from one simple dashboard.
          </p>
        </div>

        <div className="mt-14 md:mt-20">
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}

function DashboardPreview() {
  const [range, setRange] = useState<"Weekly" | "Monthly" | "Yearly">("Monthly");
  return (
    <div className="mx-auto w-[95%] max-w-[1180px] animate-rise overflow-hidden rounded-3xl border border-border bg-white shadow-[0_30px_80px_-30px_rgba(15,23,42,0.28),0_10px_30px_-15px_rgba(15,23,42,0.15)]">
      <div className="overflow-x-auto">
        <div className="grid min-w-[900px] grid-cols-[220px_1fr]">
          {/* Sidebar */}
          <aside className="border-r border-border/70 bg-surface-2/40 p-4" aria-label="Dashboard navigation">
            <div className="flex items-center gap-2 px-2 py-1">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-serif text-lg leading-none text-foreground">Rothme</span>
            </div>
            <nav className="mt-6 space-y-1">
              {DASH_SIDEBAR.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  aria-current={s.active ? "page" : undefined}
                  className={
                    "group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] transition " +
                    (s.active
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-foreground/75 hover:bg-white hover:text-foreground")
                  }
                >
                  <s.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{s.label}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Main */}
          <div className="min-w-0">
            {/* Top nav */}
            <div className="flex items-center gap-3 border-b border-border/70 bg-white px-5 py-3">
              <div className="relative flex-1 max-w-md">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  aria-label="Search dashboard"
                  placeholder="Search metrics, reports, platforms…"
                  className="h-9 w-full rounded-lg border border-border bg-surface-2/40 pl-8 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <button type="button" className="hidden items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-[12px] text-foreground/80 hover:bg-surface-2/60 sm:inline-flex">
                <Calendar className="h-3.5 w-3.5" />
                Last 30 days
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              <button type="button" aria-label="Notifications" className="relative grid h-9 w-9 place-items-center rounded-lg border border-border bg-white text-foreground/70 hover:bg-surface-2/60">
                <Bell className="h-4 w-4" />
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
              </button>
              <div aria-label="Profile" className="grid h-9 w-9 place-items-center rounded-full border border-border bg-gradient-to-br from-primary/20 to-primary/5 text-[11px] font-semibold text-foreground">
                RM
              </div>
            </div>

            <div className="space-y-5 bg-surface-2/30 p-5">
              {/* Top row */}
              <div className="grid gap-4 lg:grid-cols-3">
                <DashCard>
                  <div className="flex items-center justify-between">
                    <span className="eyebrow">Marketing Health</span>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600">Excellent</span>
                  </div>
                  <div className="mt-3 flex items-baseline gap-1.5">
                    <span className="font-serif text-4xl leading-none text-foreground">94</span>
                    <span className="text-sm text-muted-foreground">/ 100</span>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                    <TrendingUp className="h-3 w-3" /> +4 this month
                  </div>
                </DashCard>

                <DashCard>
                  <div className="flex items-center justify-between">
                    <span className="eyebrow">Lead Audit</span>
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-500/15 text-emerald-600">
                      <Check className="h-3 w-3" />
                    </span>
                  </div>
                  <div className="mt-3 font-serif text-2xl leading-tight text-foreground">Healthy</div>
                  <p className="mt-1 text-[12px] text-muted-foreground">No critical issues detected.</p>
                  <button type="button" className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-primary hover:underline">
                    View Audit <ChevronRight className="h-3 w-3" />
                  </button>
                </DashCard>

                <DashCard>
                  <div className="flex items-center justify-between">
                    <span className="eyebrow">Connected Platforms</span>
                    <span className="text-[11px] font-medium text-foreground/70">14 Connected</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {DASH_PLATFORMS.map((p) => (
                      <span
                        key={p.name}
                        title={p.name}
                        className="grid h-7 w-7 place-items-center rounded-md border border-border bg-white text-[10px] font-semibold text-foreground/75"
                      >
                        {p.initial}
                      </span>
                    ))}
                  </div>
                </DashCard>
              </div>

              {/* Second row */}
              <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
                <DashCard>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="eyebrow">Growth</span>
                      <div className="mt-1 font-serif text-lg text-foreground">Traffic & engagement</div>
                    </div>
                    <div className="inline-flex overflow-hidden rounded-lg border border-border">
                      {(["Weekly", "Monthly", "Yearly"] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRange(r)}
                          className={
                            "px-2.5 py-1 text-[11px] font-medium transition " +
                            (range === r ? "bg-primary text-primary-foreground" : "bg-white text-foreground/70 hover:bg-surface-2/60")
                          }
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4">
                    <GrowthChart key={range} range={range} />
                  </div>
                </DashCard>

                <DashCard>
                  <span className="eyebrow">Platform Performance</span>
                  <div className="mt-4 space-y-3">
                    {DASH_PERFORMANCE.map((p, i) => (
                      <div key={p.name}>
                        <div className="flex items-center justify-between text-[12px]">
                          <span className="text-foreground/80">{p.name}</span>
                          <span className="font-medium text-foreground">{p.value}</span>
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-2">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
                            style={{
                              width: `${p.value}%`,
                              animation: `bar-grow 900ms ease-out ${i * 90}ms both`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </DashCard>
              </div>

              {/* Third row */}
              <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
                <DashCard>
                  <div className="flex items-center justify-between">
                    <span className="eyebrow">Marketing Metrics</span>
                    <span className="text-[11px] text-muted-foreground">vs previous period</span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {DASH_METRICS.map((m) => (
                      <MetricCard key={m.label} metric={m} />
                    ))}
                  </div>
                </DashCard>

                <DashCard>
                  <div className="flex items-center justify-between">
                    <span className="eyebrow">Recent Activity</span>
                    <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <ul className="mt-3 space-y-2.5">
                    {DASH_ACTIVITY.map((a, i) => (
                      <li
                        key={a.text}
                        className="flex items-start gap-2 rounded-lg px-1 py-0.5 animate-rise"
                        style={{ animationDelay: `${i * 60}ms` }}
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[12px] text-foreground/85">{a.text}</div>
                          <div className="text-[10px] text-muted-foreground">{a.when}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </DashCard>
              </div>

              {/* Bottom row — upcoming reports */}
              <DashCard>
                <div className="flex items-center justify-between">
                  <span className="eyebrow">Upcoming Reports</span>
                  <button type="button" className="text-[11px] font-medium text-primary hover:underline">
                    View all
                  </button>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  {DASH_UPCOMING.map((r) => (
                    <div
                      key={r.title}
                      className="flex items-center gap-3 rounded-xl border border-border/70 bg-white p-3"
                    >
                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                        <r.icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-medium text-foreground">{r.title}</div>
                        <div className="text-[11px] text-muted-foreground">{r.when}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </DashCard>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bar-grow { from { width: 0; } }
        @keyframes stroke-in { from { stroke-dashoffset: 1000; } to { stroke-dashoffset: 0; } }
      `}</style>
    </div>
  );
}

function DashCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03),0_10px_25px_-18px_rgba(15,23,42,0.15)] transition hover:shadow-[0_2px_4px_rgba(15,23,42,0.05),0_18px_36px_-20px_rgba(15,23,42,0.2)]">
      {children}
    </div>
  );
}

function GrowthChart({ range }: { range: "Weekly" | "Monthly" | "Yearly" }) {
  const seeds: Record<string, number[]> = {
    Weekly: [22, 30, 28, 42, 38, 55, 60],
    Monthly: [28, 34, 30, 46, 44, 58, 55, 68, 72, 66, 78, 84],
    Yearly: [40, 48, 55, 52, 68, 74, 70, 82, 88, 84, 96, 104],
  };
  const data = seeds[range];
  const w = 640;
  const h = 180;
  const pad = 12;
  const max = Math.max(...data);
  const step = (w - pad * 2) / (data.length - 1);
  const pts = data.map((v, i) => [pad + i * step, h - pad - (v / max) * (h - pad * 2)] as const);
  const path = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" ");
  const area = `${path} L${pts[pts.length - 1][0]},${h - pad} L${pts[0][0]},${h - pad} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-40 w-full" role="img" aria-label={`${range} growth chart`}>
      <defs>
        <linearGradient id="growth-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g className="text-primary">
        <path d={area} fill="url(#growth-fill)" />
        <path
          d={path}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ strokeDasharray: 1000, animation: "stroke-in 1.2s ease-out both" }}
        />
        {pts.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r="2.5" fill="currentColor" opacity={i === pts.length - 1 ? 1 : 0.35} />
        ))}
      </g>
    </svg>
  );
}

function MetricCard({ metric }: { metric: DashMetric }) {
  const Trend = metric.positive ? TrendingUp : TrendingDown;
  return (
    <div className="group rounded-xl border border-border/70 bg-white p-3 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_10px_24px_-18px_rgba(15,23,42,0.25)]">
      <div className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">{metric.label}</div>
      <div className="mt-1 font-serif text-xl leading-none text-foreground">{metric.value}</div>
      <div className="mt-2 flex items-center justify-between">
        <span
          className={
            "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium " +
            (metric.positive ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600")
          }
        >
          <Trend className="h-3 w-3" />
          {metric.delta}
        </span>
        <span className="text-[10px] text-muted-foreground">prev {metric.previous}</span>
      </div>
      <Sheet>
        <SheetTrigger asChild>
          <button
            type="button"
            className="mt-2 inline-flex w-full items-center justify-center gap-1 rounded-md border border-border bg-white px-2 py-1 text-[11px] font-medium text-foreground/80 transition hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
          >
            Learn more <ArrowUpRight className="h-3 w-3" />
          </button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Metric</div>
            <SheetTitle className="font-serif text-2xl leading-tight text-foreground">{metric.label}</SheetTitle>
            <SheetDescription className="text-[13px] leading-relaxed text-muted-foreground">
              {metric.definition}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            <MetricPanelBlock title="Why it matters">
              <p>{metric.why}</p>
            </MetricPanelBlock>
            {metric.formula && (
              <MetricPanelBlock title="Formula">
                <code className="block rounded-md border border-border bg-surface-2/60 px-3 py-2 font-mono text-[12px] text-foreground">
                  {metric.formula}
                </code>
              </MetricPanelBlock>
            )}
            <MetricPanelBlock title="How Rothme calculates it">
              <p>{metric.howCalc}</p>
            </MetricPanelBlock>
            <MetricPanelBlock title="Related metrics">
              <div className="flex flex-wrap gap-1.5">
                {metric.related.map((r) => (
                  <span key={r} className="rounded-full border border-border bg-surface-2/60 px-2.5 py-1 text-[11px] text-foreground/80">
                    {r}
                  </span>
                ))}
              </div>
            </MetricPanelBlock>
            <MetricPanelBlock title="Frequently asked questions">
              <ul className="space-y-3">
                {metric.faqs.map((f) => (
                  <li key={f.q}>
                    <div className="text-[13px] font-medium text-foreground">{f.q}</div>
                    <div className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{f.a}</div>
                  </li>
                ))}
              </ul>
            </MetricPanelBlock>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function MetricPanelBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{title}</h3>
      <div className="mt-2 text-[13px] leading-relaxed text-foreground/85">{children}</div>
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
