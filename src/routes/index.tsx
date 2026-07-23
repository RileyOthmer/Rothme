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
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Eye,
  FileText,
  Gauge,
  Globe,
  LayoutDashboard,
  Lightbulb,
  Link2,
  Lock,
  LogOut,
  Mail,
  Megaphone,
  MessageSquare,
  MousePointerClick,
  Play,
  Plug,
  Radio,
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


import { useEffect, useMemo, useRef, useState } from "react";
import { Wordmark } from "@/components/brand/Wordmark";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
        <CustomerStories />
        <PricingSection />
        <FAQ />
        <FinalCTA />
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
    supabase.auth.getUser().then(({ data, error }) => {
      if (error) return;
      setUser(data.user);
    }).catch(() => {});
    let listener: { subscription: { unsubscribe: () => void } } | undefined;
    try {
      const result = supabase.auth.onAuthStateChange((_e, session) => {
        setUser(session?.user ?? null);
      });
      listener = result.data;
    } catch {
      /* Supabase not configured — auth features unavailable */
    }
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      listener?.subscription.unsubscribe();
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
    <section id="marketing-problem" className="border-b border-border/70 bg-card">
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
            className="order-1 relative h-[440px] w-full overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-surface-2/60 via-surface to-surface-2/40 shadow-sm sm:h-[500px]"
            aria-hidden="true"
          >
            <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_1px_1px,theme(colors.slate.200)_1px,transparent_0)] [background-size:22px_22px]" />
            {PLATFORM_CHIPS.map((p) => (
              <div
                key={p.name}
                className="absolute animate-float"
                style={{ top: p.top, left: p.left, animationDelay: p.delay }}
              >
                <div className="flex items-center gap-2.5 rounded-2xl border border-border/80 bg-card/95 px-3.5 py-2.5 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.18)] backdrop-blur">
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
                className="animate-rise rounded-2xl border border-border/70 bg-card p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-20px_rgba(15,23,42,0.15)] transition hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(15,23,42,0.05),0_20px_40px_-20px_rgba(15,23,42,0.2)]"
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
    <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-surface via-surface-2/30 to-surface shadow-sm">
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
            <div className="flex items-center gap-2 rounded-full border border-border/80 bg-card/95 px-3 py-1.5 shadow-[0_8px_20px_-12px_rgba(15,23,42,0.2)] backdrop-blur">
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
          <div className="relative flex flex-col items-center gap-2 rounded-2xl border border-border bg-card px-6 py-5 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.35)]">
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
    <section id="rothme-solution" className="border-b border-border/70 bg-card">
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
                className="animate-rise rounded-2xl border border-border/70 bg-card p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-20px_rgba(15,23,42,0.15)] transition hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(15,23,42,0.05),0_20px_40px_-20px_rgba(15,23,42,0.2)]"
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
          <div className="grid gap-3 rounded-3xl border border-border/70 bg-gradient-to-br from-surface-2/50 via-surface to-surface-2/40 p-4 shadow-sm sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
            {SOLUTION_STATS.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-border/60 bg-card px-6 py-6 text-center"
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
    <section id="dashboard" className="border-b border-border/70 bg-card">
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
    <div className="mx-auto w-[95%] max-w-[1180px] animate-rise overflow-hidden rounded-3xl border border-border bg-card shadow-[0_30px_80px_-30px_rgba(15,23,42,0.28),0_10px_30px_-15px_rgba(15,23,42,0.15)]">
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
                      : "text-foreground/75 hover:bg-surface-2 hover:text-foreground")
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
            <div className="flex items-center gap-3 border-b border-border/70 bg-card px-5 py-3">
              <div className="relative flex-1 max-w-md">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  aria-label="Search dashboard"
                  placeholder="Search metrics, reports, platforms…"
                  className="h-9 w-full rounded-lg border border-border bg-surface-2/40 pl-8 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <button type="button" className="hidden items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-[12px] text-foreground/80 hover:bg-surface-2/60 sm:inline-flex">
                <Calendar className="h-3.5 w-3.5" />
                Last 30 days
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              <button type="button" aria-label="Notifications" className="relative grid h-9 w-9 place-items-center rounded-lg border border-border bg-card text-foreground/70 hover:bg-surface-2/60">
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
                        className="grid h-7 w-7 place-items-center rounded-md border border-border bg-card text-[10px] font-semibold text-foreground/75"
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
                            (range === r ? "bg-primary text-primary-foreground" : "bg-card text-foreground/70 hover:bg-surface-2/60")
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
                      className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3"
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
    <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03),0_10px_25px_-18px_rgba(15,23,42,0.15)] transition hover:shadow-[0_2px_4px_rgba(15,23,42,0.05),0_18px_36px_-20px_rgba(15,23,42,0.2)]">
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
    <div className="group rounded-xl border border-border/70 bg-card p-3 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_10px_24px_-18px_rgba(15,23,42,0.25)]">
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
            className="mt-2 inline-flex w-full items-center justify-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-[11px] font-medium text-foreground/80 transition hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
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
  const categories = [
    { name: "Website", Icon: Globe },
    { name: "Tracking", Icon: BarChart3 },
    { name: "Lead Capture", Icon: MousePointerClick },
    { name: "Email", Icon: Mail },
    { name: "SMS", Icon: MessageSquare },
    { name: "Integrations", Icon: Plug },
    { name: "Advertising", Icon: Megaphone },
    { name: "SEO", Icon: Search },
    { name: "Google Business Profile", Icon: Building2 },
  ];

  const timeline = [
    { time: "11:03 AM", label: "Website Health Check Passed" },
    { time: "11:08 AM", label: "Google Analytics Connected" },
    { time: "11:14 AM", label: "Lead Forms Responding Normally" },
    { time: "11:21 AM", label: "Meta Pixel Active" },
    { time: "11:30 AM", label: "Twilio SMS Service Connected" },
    { time: "11:37 AM", label: "Weekly Marketing Report Generated" },
  ];

  const cards = [
    { title: "Website Monitoring", body: "Continuously checks website availability and connection status.", Icon: Globe },
    { title: "Lead Capture Monitoring", body: "Monitor contact forms, booking links, and connected lead capture systems.", Icon: MousePointerClick },
    { title: "Tracking Monitoring", body: "Monitor connected analytics and advertising tracking systems.", Icon: BarChart3 },
    { title: "Email Monitoring", body: "Monitor connected email platforms and communication status.", Icon: Mail },
    { title: "SMS Monitoring", body: "Monitor connected SMS providers and delivery services.", Icon: Radio },
    { title: "Integration Monitoring", body: "Monitor all connected marketing platforms and alert users when an integration requires attention.", Icon: Plug },
    { title: "Marketing Health", body: "Every completed audit contributes to your overall Marketing Health Score.", Icon: Gauge },
  ];

  const { ref: timelineRef, inView: timelineIn } = useInView<HTMLOListElement>();
  const { ref: cardsRef, inView: cardsIn } = useInView<HTMLDivElement>();

  return (
    <Section id="lead-audit" tint>
      <div className="mx-auto max-w-3xl text-center">
        <span className="eyebrow">Lead Audit</span>
        <h2 className="mt-4 text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
          Protect Every <span className="font-serif italic font-normal">Lead.</span>
        </h2>
        <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground sm:text-base">
          Marketing issues often go unnoticed until they begin affecting your business. Lead Audit
          continuously monitors your connected marketing ecosystem so you always know when
          something needs attention.
        </p>
      </div>

      <div className="mt-16 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:items-start">
        {/* LEFT — Dashboard */}
        <div className="relative">
          <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/10 via-transparent to-emerald-400/10 blur-2xl" />
          <div className="rounded-3xl border border-border/70 bg-surface/90 p-6 shadow-xl backdrop-blur sm:p-8">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-6 border-b border-border/60 pb-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  Lead Audit Score
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-6xl font-medium tracking-tight text-foreground">
                    <CountUp end={96} duration={1600} />
                  </span>
                  <span className="text-lg text-muted-foreground">/ 100</span>
                </div>
                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  Status: Healthy
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-right sm:text-left">
                <div className="rounded-xl border border-border/60 bg-background/60 px-4 py-3">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Last Scan</div>
                  <div className="mt-1 text-sm font-medium text-foreground">2 min ago</div>
                </div>
                <div className="rounded-xl border border-border/60 bg-background/60 px-4 py-3">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Next Scan</div>
                  <div className="mt-1 text-sm font-medium text-foreground">58 min</div>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="mt-6">
              <div className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                System Categories
              </div>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {categories.map(({ name, Icon }, i) => (
                  <li
                    key={name}
                    className="flex items-center justify-between rounded-xl border border-border/60 bg-background/50 px-3.5 py-2.5 transition-colors hover:bg-background"
                    style={{ animation: `rise-in 0.6s ease-out both`, animationDelay: `${i * 60}ms` }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="truncate text-sm font-medium text-foreground">{name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      </span>
                      Healthy
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Timeline */}
            <div className="mt-8 rounded-2xl border border-border/60 bg-background/40 p-5">
              <div className="mb-4 flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Active Monitoring
                </div>
              </div>
              <ol ref={timelineRef} className="relative space-y-4 border-l border-border/70 pl-5">
                {timeline.map((t, i) => (
                  <li
                    key={t.time}
                    className="relative"
                    style={
                      timelineIn
                        ? { animation: `rise-in 0.5s ease-out both`, animationDelay: `${i * 90}ms` }
                        : { opacity: 0 }
                    }
                  >
                    <span className="absolute -left-[27px] top-1 grid h-4 w-4 place-items-center rounded-full border border-emerald-300/70 bg-emerald-50 dark:border-emerald-500/40 dark:bg-emerald-500/15">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                    </span>
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="text-sm text-foreground">{t.label}</span>
                      <span className="shrink-0 font-mono text-xs text-muted-foreground">{t.time}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {/* RIGHT — Feature cards */}
        <div ref={cardsRef} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {cards.map((c, i) => (
            <div
              key={c.title}
              className="group rounded-2xl border border-border/70 bg-surface p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-border hover:shadow-md"
              style={
                cardsIn
                  ? { animation: `rise-in 0.55s ease-out both`, animationDelay: `${i * 70}ms` }
                  : { opacity: 0 }
              }
            >
              <div className="flex items-start gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                  <c.Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[15px] font-semibold text-foreground">{c.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Callout */}
      <div className="mx-auto mt-20 max-w-4xl text-center">
        <p className="text-3xl font-medium leading-tight tracking-tight text-foreground sm:text-4xl">
          Know when something changes{" "}
          <span className="font-serif italic font-normal text-muted-foreground">
            before it becomes a bigger problem.
          </span>
        </p>
      </div>

      {/* Transparency */}
      <div className="mx-auto mt-12 max-w-3xl">
        <div className="rounded-2xl border border-border/70 bg-surface/80 p-6 shadow-xs backdrop-blur sm:p-7">
          <div className="flex items-start gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-[15px] font-semibold text-foreground">Transparency</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Lead Audit reports information based on connected services, successful system
                checks, and available platform data.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Lead Audit helps identify potential issues but does not guarantee business outcomes
                or marketing performance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ─────────────────────────────── Health Score ─────────────────────────────── */

function HealthScore() {
  const categories = [
    { name: "Website", Icon: Globe, last: "2 min ago" },
    { name: "Analytics", Icon: BarChart3, last: "3 min ago" },
    { name: "Advertising", Icon: Megaphone, last: "4 min ago" },
    { name: "Lead Capture", Icon: MousePointerClick, last: "2 min ago" },
    { name: "Email", Icon: Mail, last: "5 min ago" },
    { name: "SMS", Icon: Radio, last: "6 min ago" },
    { name: "CRM", Icon: Users, last: "7 min ago" },
    { name: "SEO", Icon: Search, last: "9 min ago" },
    { name: "Google Business Profile", Icon: Building2, last: "3 min ago" },
  ];

  const { ref: cardsRef, inView: cardsIn } = useInView<HTMLDivElement>();
  const { ref: ringRef, inView: ringIn } = useInView<HTMLDivElement>();

  const score = 94;
  const size = 240;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = ringIn ? circumference * (1 - score / 100) : circumference;

  return (
    <Section id="health-score">
      <div className="mx-auto max-w-3xl text-center">
        <span className="eyebrow">Marketing Health Score</span>
        <h2 className="mt-4 text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
          Know the Health of Your{" "}
          <span className="font-serif italic font-normal">Marketing.</span>
        </h2>
        <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground sm:text-base">
          Instead of checking dozens of dashboards, see the overall health of your connected
          marketing ecosystem in seconds. The Marketing Health Score is designed to help
          businesses understand the operational health of their connected marketing systems.
        </p>
      </div>

      <div className="mt-16 grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-start">
        {/* LEFT — Score */}
        <div className="relative">
          <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-emerald-400/10 via-transparent to-primary/10 blur-2xl" />
          <div className="rounded-3xl border border-border/70 bg-surface/90 p-8 shadow-xl backdrop-blur">
            <div
              ref={ringRef}
              className="mx-auto flex flex-col items-center"
              role="img"
              aria-label={`Marketing Health Score: ${score} out of 100, Excellent`}
            >
              <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="-rotate-90">
                  <defs>
                    <linearGradient id="healthGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="oklch(0.72 0.17 155)" />
                      <stop offset="100%" stopColor="oklch(0.62 0.19 175)" />
                    </linearGradient>
                  </defs>
                  <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={stroke}
                    className="stroke-border/60"
                    fill="none"
                  />
                  <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={stroke}
                    stroke="url(#healthGrad)"
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    style={{ transition: "stroke-dashoffset 1.8s cubic-bezier(.2,.8,.2,1)" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Health Score
                  </span>
                  <span className="mt-1 text-6xl font-medium tracking-tight text-foreground">
                    <CountUp end={score} duration={1800} />
                  </span>
                  <span className="mt-0.5 text-xs text-muted-foreground">out of 100</span>
                </div>
              </div>

              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50 px-3.5 py-1.5 text-xs font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Status: Excellent
              </div>
              <div className="mt-2 text-xs text-muted-foreground">Last updated · Just now</div>
            </div>

            <dl className="mt-8 grid grid-cols-2 gap-3 border-t border-border/60 pt-6">
              {[
                { k: "Healthy systems", v: "14 of 14" },
                { k: "Connected integrations", v: "14" },
                { k: "Active monitoring", v: "Enabled" },
                { k: "Last audit", v: "2 minutes ago" },
              ].map((row) => (
                <div
                  key={row.k}
                  className="rounded-xl border border-border/60 bg-background/60 px-4 py-3"
                >
                  <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {row.k}
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-foreground">{row.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* RIGHT — Health category cards */}
        <div>
          <div
            ref={cardsRef}
            className="grid gap-3 sm:grid-cols-2"
            role="list"
            aria-label="Marketing system health categories"
          >
            {categories.map((c, i) => (
              <div
                key={c.name}
                role="listitem"
                className="group rounded-2xl border border-border/70 bg-surface p-4 shadow-xs transition-all hover:-translate-y-0.5 hover:border-border hover:shadow-md"
                style={
                  cardsIn
                    ? { animation: `rise-in 0.5s ease-out both`, animationDelay: `${i * 70}ms` }
                    : { opacity: 0 }
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                      <c.Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-[14px] font-semibold text-foreground">
                        {c.name}
                      </h3>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Last checked · {c.last}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-200/70 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    </span>
                    Healthy
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Information card */}
          <div className="mt-6 rounded-2xl border border-border/70 bg-surface/80 p-6 shadow-xs backdrop-blur">
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <Gauge className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-[15px] font-semibold text-foreground">
                  How Your Marketing Health Score Works
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  The Marketing Health Score summarizes the operational health of your connected
                  marketing ecosystem. It considers information such as:
                </p>
                <ul className="mt-3 grid grid-cols-1 gap-1.5 text-sm text-muted-foreground sm:grid-cols-2">
                  {[
                    "Connected integrations",
                    "Monitoring results",
                    "Website availability",
                    "Tracking systems",
                    "Lead capture systems",
                    "Communication services",
                    "Marketing platform connection status",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  The score is intended to help users quickly understand the health of connected
                  systems. It is not a measurement of business success, advertising effectiveness,
                  revenue, profitability, or future marketing performance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom callout */}
      <div className="mx-auto mt-20 max-w-4xl text-center">
        <p className="text-3xl font-medium leading-tight tracking-tight text-foreground sm:text-4xl">
          One score.{" "}
          <span className="font-serif italic font-normal text-muted-foreground">
            Complete visibility.
          </span>
        </p>
      </div>
    </Section>
  );
}

/* ─────────────────────────────── Cheat Sheet ─────────────────────────────── */

type CheatMetric = {
  key: string;
  name: string;
  short?: string;
  value: string;
  category: string;
  definition: string;
  formula: string;
  why: string;
  related: string[];
  faqs: { q: string; a: string }[];
};

const CHEAT_METRICS: CheatMetric[] = [
  {
    key: "ctr",
    name: "Click-Through Rate",
    short: "CTR",
    value: "3.42%",
    category: "Advertising",
    definition:
      "The percentage of people who clicked after seeing your content or advertisement.",
    formula: "(Clicks ÷ Impressions) × 100",
    why: "CTR helps measure how often viewers interact with your content after seeing it.",
    related: ["Impressions", "Reach", "Website Clicks", "Conversions"],
    faqs: [
      { q: "What is considered a good CTR?", a: "It varies by platform and industry. Rothme shows your CTR alongside the benchmark reported by each connected platform." },
      { q: "Why is CTR different between platforms?", a: "Each platform defines an impression and a click slightly differently, so the same content can produce different CTRs on Meta, Google, and TikTok." },
      { q: "Can CTR decrease naturally?", a: "Yes. CTR commonly drops as an audience sees the same creative more often. This is known as creative fatigue." },
    ],
  },
  { key: "imp", name: "Impressions", value: "482,193", category: "Advertising", definition: "The total number of times your content was shown, whether or not it was clicked.", formula: "Sum of times content was rendered on a screen", why: "Impressions describe how often your content appeared in front of viewers.", related: ["Reach", "CTR", "Frequency"], faqs: [{ q: "Is one impression one person?", a: "No. The same person can generate multiple impressions." }, { q: "Do impressions include bots?", a: "Most platforms filter invalid traffic before reporting impressions to Rothme." }] },
  { key: "reach", name: "Reach", value: "127,410", category: "Social Media", definition: "The number of unique people who saw your content at least once.", formula: "Unique viewers of your content", why: "Reach describes how many distinct people encountered your content.", related: ["Impressions", "Frequency", "Followers"], faqs: [{ q: "How is reach different from impressions?", a: "Reach counts unique people. Impressions count total views." }] },
  { key: "cpc", name: "Cost Per Click", short: "CPC", value: "$0.87", category: "Advertising", definition: "The average amount paid each time someone clicks your advertisement.", formula: "Total Spend ÷ Total Clicks", why: "CPC describes what each click currently costs on your connected ad platforms.", related: ["CTR", "CPM", "Conversions"], faqs: [{ q: "Why did my CPC change?", a: "Auction dynamics, audience size, and creative performance all influence CPC." }] },
  { key: "cpm", name: "Cost Per 1,000 Impressions", short: "CPM", value: "$14.20", category: "Advertising", definition: "The cost to show your advertisement to one thousand viewers.", formula: "(Total Spend ÷ Impressions) × 1,000", why: "CPM describes how expensive it currently is to reach an audience on a given platform.", related: ["Impressions", "Reach", "CPC"], faqs: [{ q: "Is a lower CPM always better?", a: "Not necessarily. A very low CPM can indicate a low-quality audience." }] },
  { key: "conv", name: "Conversions", value: "1,284", category: "Analytics", definition: "The number of tracked actions completed, such as purchases, sign-ups, or form submissions.", formula: "Sum of tracked conversion events", why: "Conversions describe how many desired actions were recorded through your connected tracking systems.", related: ["CTR", "Cost Per Lead", "Lead Form Submissions"], faqs: [{ q: "Where do conversions come from?", a: "From the tracking pixels and analytics platforms you have connected to Rothme." }] },
  { key: "cpl", name: "Cost Per Lead", short: "CPL", value: "$18.44", category: "Lead Generation", definition: "The average cost of acquiring a single lead through your advertising.", formula: "Total Spend ÷ Total Leads", why: "CPL describes how much each lead costs based on connected advertising and lead capture data.", related: ["Conversions", "Lead Form Submissions", "CPC"], faqs: [{ q: "What counts as a lead?", a: "Any tracked lead capture event reported by a connected platform." }] },
  { key: "eng", name: "Engagement Rate", value: "6.1%", category: "Social Media", definition: "The percentage of viewers who interacted with your content through likes, comments, shares, or saves.", formula: "(Engagements ÷ Reach) × 100", why: "Engagement rate describes how often viewers respond to your content.", related: ["Reach", "Followers", "Impressions"], faqs: [{ q: "Which interactions count?", a: "It depends on the platform. Rothme uses the definition each platform reports." }] },
  { key: "fol", name: "Followers", value: "24,802", category: "Social Media", definition: "The total number of accounts currently following your connected social profiles.", formula: "Current follower count reported by each platform", why: "Followers describe the audience size on your connected social platforms.", related: ["Reach", "Engagement Rate"], faqs: [{ q: "Do lost followers get subtracted?", a: "Yes. The number reflects the current follower count reported by each platform." }] },
  { key: "vv", name: "Video Views", value: "38,915", category: "Social Media", definition: "The number of times your videos were viewed on connected platforms.", formula: "Sum of platform-reported video views", why: "Video views describe how often your video content was watched.", related: ["Impressions", "Reach", "Engagement Rate"], faqs: [{ q: "How long counts as a view?", a: "Each platform defines its own minimum watch time." }] },
  { key: "wc", name: "Website Clicks", value: "9,214", category: "Website Metrics", definition: "The number of clicks that sent viewers to your website from connected platforms.", formula: "Sum of outbound clicks to your website", why: "Website clicks describe how often viewers navigated from your marketing to your site.", related: ["CTR", "Conversions", "Impressions"], faqs: [{ q: "Are website clicks the same as sessions?", a: "No. Sessions are counted by your analytics platform after the click lands on your site." }] },
  { key: "lfs", name: "Lead Form Submissions", value: "412", category: "Lead Generation", definition: "The number of completed lead forms submitted through your connected lead capture systems.", formula: "Sum of successful lead form submissions", why: "Lead form submissions describe how many completed lead forms were captured.", related: ["Conversions", "Cost Per Lead", "Website Clicks"], faqs: [{ q: "Where do form submissions come from?", a: "From your connected lead capture platforms and website forms." }] },
];

const CHEAT_CATEGORIES = [
  "Advertising",
  "Social Media",
  "Analytics",
  "SEO",
  "Email Marketing",
  "SMS Marketing",
  "Lead Generation",
  "Website Metrics",
  "Google Business Profile",
  "CRM",
  "Reporting",
];

function CheatSheet() {
  const [activeKey, setActiveKey] = useState<string>("ctr");
  const [query, setQuery] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CHEAT_METRICS;
    return CHEAT_METRICS.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.short?.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        m.definition.toLowerCase().includes(q),
    );
  }, [query]);

  const active =
    filtered.find((m) => m.key === activeKey) ?? filtered[0] ?? CHEAT_METRICS[0];

  const { ref: statsRef, inView: statsIn } = useInView<HTMLDivElement>();

  return (
    <Section id="cheat-sheet" tint>
      <div className="mx-auto max-w-3xl text-center">
        <span className="eyebrow">Marketing Cheat Sheet</span>
        <h2 className="mt-4 text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
          Understand Every <span className="font-serif italic font-normal">Metric.</span>
        </h2>
        <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground sm:text-base">
          Marketing reports shouldn't require a marketing degree. Click any metric in Rothme to
          learn what it means, how it's calculated, and why it matters.
        </p>
      </div>

      {/* Search + categories */}
      <div className="mx-auto mt-10 max-w-4xl">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <label htmlFor="cheat-search" className="sr-only">
            Search marketing terms
          </label>
          <input
            id="cheat-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search marketing terms..."
            className="w-full rounded-full border border-border/70 bg-surface/90 py-3.5 pl-11 pr-4 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/10"
          />
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {CHEAT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setQuery(cat)}
              className="rounded-full border border-border/70 bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/[0.04] hover:text-foreground"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Dashboard + Panel */}
      <div className="mt-12 grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:items-start">
        {/* LEFT — dashboard */}
        <div className="relative">
          <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/10 via-transparent to-emerald-400/10 blur-2xl" />
          <div className="rounded-3xl border border-border/70 bg-surface/90 p-6 shadow-xl backdrop-blur sm:p-7">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Live Metrics
              </div>
              <div className="text-[11px] text-muted-foreground">
                Click any metric to learn more
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="grid place-items-center rounded-2xl border border-dashed border-border/70 bg-background/40 py-16 text-sm text-muted-foreground">
                No results for "{query}"
              </div>
            ) : (
              <div
                className="grid grid-cols-2 gap-3 sm:grid-cols-3"
                role="listbox"
                aria-label="Marketing metrics"
              >
                {filtered.map((m) => {
                  const isActive = m.key === active.key;
                  return (
                    <button
                      key={m.key}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      onClick={() => setActiveKey(m.key)}
                      className={
                        "group relative rounded-2xl border p-4 text-left transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 " +
                        (isActive
                          ? "border-primary/60 bg-primary/[0.04] shadow-md"
                          : "border-border/60 bg-background/60 hover:-translate-y-0.5 hover:border-border hover:shadow-md")
                      }
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                          {m.short ?? m.category}
                        </span>
                        <span
                          className={
                            "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium transition-colors " +
                            (isActive
                              ? "bg-primary/15 text-primary"
                              : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary")
                          }
                        >
                          <BookOpen className="h-2.5 w-2.5" />
                          Learn
                        </span>
                      </div>
                      <div className="mt-2 text-lg font-medium tracking-tight text-foreground">
                        {m.value}
                      </div>
                      <div className="mt-0.5 truncate text-xs text-muted-foreground">
                        {m.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — educational panel */}
        <div
          key={active.key}
          className="rounded-3xl border border-border/70 bg-surface/90 p-6 shadow-xl backdrop-blur sm:p-8 animate-rise"
          aria-live="polite"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {active.category}
              </div>
              <h3 className="mt-1 text-2xl font-medium tracking-tight text-foreground">
                {active.name}
                {active.short ? (
                  <span className="text-muted-foreground"> ({active.short})</span>
                ) : null}
              </h3>
            </div>
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>

          <dl className="mt-6 space-y-5 text-sm">
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Definition
              </dt>
              <dd className="mt-1.5 leading-relaxed text-foreground">{active.definition}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Formula
              </dt>
              <dd className="mt-1.5 rounded-lg border border-border/60 bg-background/60 px-3 py-2 font-mono text-[13px] text-foreground">
                {active.formula}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Why it matters
              </dt>
              <dd className="mt-1.5 leading-relaxed text-muted-foreground">{active.why}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                How Rothme calculates it
              </dt>
              <dd className="mt-1.5 leading-relaxed text-muted-foreground">
                This value is calculated using information from your connected marketing platforms.
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Related metrics
              </dt>
              <dd className="mt-2 flex flex-wrap gap-1.5">
                {active.related.map((r) => (
                  <span
                    key={r}
                    className="rounded-full border border-border/60 bg-background/60 px-2.5 py-0.5 text-[11px] text-muted-foreground"
                  >
                    {r}
                  </span>
                ))}
              </dd>
            </div>
          </dl>

          <div className="mt-7 border-t border-border/60 pt-5">
            <div className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Frequently asked questions
            </div>
            <div className="divide-y divide-border/60 rounded-xl border border-border/60 bg-background/40">
              {active.faqs.map((f, i) => {
                const open = openFaq === i;
                return (
                  <div key={f.q}>
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => setOpenFaq(open ? null : i)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm text-foreground transition-colors hover:bg-background/70 focus:outline-none focus-visible:bg-background/70"
                    >
                      <span>{f.q}</span>
                      <ChevronDown
                        className={
                          "h-4 w-4 shrink-0 text-muted-foreground transition-transform " +
                          (open ? "rotate-180" : "")
                        }
                        aria-hidden
                      />
                    </button>
                    {open ? (
                      <div className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground animate-rise">
                        {f.a}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div
        ref={statsRef}
        className="mt-16 grid gap-4 rounded-3xl border border-border/70 bg-surface/80 p-6 shadow-xs backdrop-blur sm:grid-cols-2 sm:p-8 lg:grid-cols-4"
      >
        {[
          { label: "Educational Topics", value: 500, suffix: "+" },
          { label: "Marketing Terms", value: 1000, suffix: "+" },
          { label: "Frequently Asked Questions", value: 2000, suffix: "+" },
          { label: "Platform-Specific Definitions", text: "Growing Library" },
        ].map((s) => (
          <div key={s.label} className="text-center sm:text-left">
            <div className="text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
              {"text" in s && s.text ? (
                <span>{s.text}</span>
              ) : statsIn ? (
                <>
                  <CountUp end={s.value as number} duration={1600} />
                  {s.suffix}
                </>
              ) : (
                <span>0</span>
              )}
            </div>
            <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Callout */}
      <div className="mx-auto mt-20 max-w-4xl text-center">
        <p className="text-3xl font-medium leading-tight tracking-tight text-foreground sm:text-4xl">
          Knowledge builds confidence.{" "}
          <span className="font-serif italic font-normal text-muted-foreground">
            Understanding builds better decisions.
          </span>
        </p>
      </div>

      {/* Notice */}
      <div className="mx-auto mt-10 max-w-3xl">
        <div className="rounded-2xl border border-border/70 bg-surface/80 p-6 shadow-xs backdrop-blur sm:p-7">
          <div className="flex items-start gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <BookOpen className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-[15px] font-semibold text-foreground">Educational Content</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Marketing Cheat Sheet is designed to explain marketing concepts using connected
                platform data.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Educational content is provided for informational purposes and is not intended to
                recommend business strategies or marketing decisions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ─────────────────────────────── Integrations ─────────────────────────────── */

type IntegrationStatus = "connected" | "syncing" | "available" | "coming";

type Integration = {
  mark: string;
  name: string;
  color: string;
  status: IntegrationStatus;
  sync: string;
};

const INTEGRATION_CATEGORIES: {
  label: string;
  icon: typeof Users;
  items: Integration[];
}[] = [
  {
    label: "Social Media",
    icon: Users,
    items: [
      { mark: "Ig", name: "Instagram", color: "#E4405F", status: "connected", sync: "2m ago" },
      { mark: "Fb", name: "Facebook", color: "#1877F2", status: "connected", sync: "4m ago" },
      { mark: "Tt", name: "TikTok", color: "#111111", status: "syncing", sync: "syncing…" },
      { mark: "Yt", name: "YouTube", color: "#FF0000", status: "available", sync: "—" },
      { mark: "Li", name: "LinkedIn", color: "#0A66C2", status: "connected", sync: "9m ago" },
      { mark: "Th", name: "Threads", color: "#111111", status: "coming", sync: "Soon" },
    ],
  },
  {
    label: "Analytics",
    icon: BarChart3,
    items: [
      { mark: "Ga", name: "Google Analytics", color: "#E37400", status: "connected", sync: "1m ago" },
      { mark: "Sc", name: "Search Console", color: "#4285F4", status: "syncing", sync: "syncing…" },
      { mark: "Tm", name: "Tag Manager", color: "#246FDB", status: "available", sync: "—" },
    ],
  },
  {
    label: "Advertising",
    icon: Megaphone,
    items: [
      { mark: "Ga", name: "Google Ads", color: "#4285F4", status: "connected", sync: "6m ago" },
      { mark: "Ma", name: "Meta Ads", color: "#1877F2", status: "connected", sync: "8m ago" },
      { mark: "Ta", name: "TikTok Ads", color: "#111111", status: "available", sync: "—" },
      { mark: "La", name: "LinkedIn Ads", color: "#0A66C2", status: "available", sync: "—" },
    ],
  },
  {
    label: "Business",
    icon: Building2,
    items: [
      { mark: "Gb", name: "Google Business", color: "#34A853", status: "connected", sync: "12m ago" },
    ],
  },
  {
    label: "Communication",
    icon: Mail,
    items: [
      { mark: "Gm", name: "Gmail", color: "#EA4335", status: "connected", sync: "3m ago" },
      { mark: "Ol", name: "Outlook", color: "#0078D4", status: "available", sync: "—" },
      { mark: "Mc", name: "Mailchimp", color: "#FFB800", status: "syncing", sync: "syncing…" },
      { mark: "Kv", name: "Klaviyo", color: "#000000", status: "available", sync: "—" },
      { mark: "Tw", name: "Twilio", color: "#F22F46", status: "available", sync: "—" },
    ],
  },
  {
    label: "CRM",
    icon: Users,
    items: [
      { mark: "Hs", name: "HubSpot", color: "#FF7A59", status: "connected", sync: "15m ago" },
      { mark: "Sf", name: "Salesforce", color: "#00A1E0", status: "available", sync: "—" },
    ],
  },
  {
    label: "Commerce",
    icon: Plug,
    items: [
      { mark: "Sh", name: "Shopify", color: "#96BF48", status: "connected", sync: "5m ago" },
      { mark: "Wc", name: "WooCommerce", color: "#7F54B3", status: "available", sync: "—" },
    ],
  },
];

const STATUS_META: Record<IntegrationStatus, { label: string; dot: string; text: string; ring: string }> = {
  connected: { label: "Connected", dot: "bg-emerald-500", text: "text-emerald-700", ring: "ring-emerald-500/20" },
  syncing: { label: "Syncing", dot: "bg-blue-500 animate-pulse", text: "text-blue-700", ring: "ring-blue-500/20" },
  available: { label: "Available", dot: "bg-foreground/40", text: "text-muted-foreground", ring: "ring-border" },
  coming: { label: "Coming Soon", dot: "bg-amber-500", text: "text-amber-700", ring: "ring-amber-500/20" },
};

const INTEGRATION_FEATURES = [
  { icon: ShieldCheck, title: "Secure Connections", body: "Connect using official APIs whenever available." },
  { icon: LayoutDashboard, title: "Unified Dashboard", body: "View connected marketing data in one place." },
  { icon: Activity, title: "Automatic Syncing", body: "Keep information up to date through scheduled synchronization." },
  { icon: Zap, title: "Simple Setup", body: "Connect your marketing platforms in just a few steps." },
  { icon: Sparkles, title: "Growing Platform Library", body: "New integrations are continuously added through platform updates." },
];

const ORBIT_PLATFORMS: { mark: string; name: string; color: string; status: IntegrationStatus }[] = [
  { mark: "Ig", name: "Instagram", color: "#E4405F", status: "connected" },
  { mark: "Fb", name: "Facebook", color: "#1877F2", status: "connected" },
  { mark: "Ga", name: "Google Ads", color: "#4285F4", status: "connected" },
  { mark: "Sh", name: "Shopify", color: "#96BF48", status: "connected" },
  { mark: "Ma", name: "Meta Ads", color: "#1877F2", status: "syncing" },
  { mark: "Ga", name: "Analytics", color: "#E37400", status: "connected" },
  { mark: "Hs", name: "HubSpot", color: "#FF7A59", status: "syncing" },
  { mark: "Li", name: "LinkedIn", color: "#0A66C2", status: "available" },
  { mark: "Yt", name: "YouTube", color: "#FF0000", status: "available" },
  { mark: "Tt", name: "TikTok", color: "#111111", status: "coming" },
];

function IntegrationOrbit() {
  const size = 460;
  const c = size / 2;
  const rings = [110, 175];
  const nodes = ORBIT_PLATFORMS.map((p, i) => {
    const ring = i < 5 ? 0 : 1;
    const perRing = ring === 0 ? 5 : 5;
    const idx = ring === 0 ? i : i - 5;
    const angle = (idx / perRing) * Math.PI * 2 - Math.PI / 2;
    const r = rings[ring];
    return { ...p, x: c + Math.cos(angle) * r, y: c + Math.sin(angle) * r };
  });

  return (
    <div className="relative mx-auto w-full max-w-[500px]">
      <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-primary/5 via-transparent to-transparent blur-2xl" />
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-auto" role="img" aria-label="Rothme integration ecosystem">
        {rings.map((r, i) => (
          <circle key={i} cx={c} cy={c} r={r} fill="none" stroke="currentColor" className="text-border" strokeDasharray="3 6" />
        ))}
        {nodes.map((n, i) => {
          const active = n.status === "connected" || n.status === "syncing";
          return (
            <line
              key={i}
              x1={c}
              y1={c}
              x2={n.x}
              y2={n.y}
              stroke="currentColor"
              className={active ? "text-primary/40" : "text-border"}
              strokeWidth={active ? 1.25 : 1}
              strokeDasharray={n.status === "syncing" ? "4 4" : undefined}
            >
              {n.status === "syncing" && (
                <animate attributeName="stroke-dashoffset" values="0;-16" dur="1.2s" repeatCount="indefinite" />
              )}
            </line>
          );
        })}
        <circle cx={c} cy={c} r={44} className="fill-background" stroke="currentColor" strokeOpacity="0.15" />
        <circle cx={c} cy={c} r={44} fill="none" stroke="currentColor" className="text-primary/30" strokeWidth="1">
          <animate attributeName="r" values="44;54;44" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0;0.5" dur="3s" repeatCount="indefinite" />
        </circle>
        <text x={c} y={c + 5} textAnchor="middle" className="fill-foreground font-serif" fontSize="20" fontStyle="italic">
          rothme
        </text>
      </svg>

      {nodes.map((n, i) => {
        const meta = STATUS_META[n.status];
        return (
          <div
            key={i}
            className="absolute -translate-x-1/2 -translate-y-1/2 animate-[float_6s_ease-in-out_infinite]"
            style={{
              left: `${(n.x / size) * 100}%`,
              top: `${(n.y / size) * 100}%`,
              animationDelay: `${i * 0.25}s`,
            }}
          >
            <div className={`group flex items-center gap-2 rounded-full border border-border bg-surface/95 pl-1 pr-2.5 py-1 shadow-sm ring-1 ${meta.ring} backdrop-blur-sm transition-transform hover:scale-105`}>
              <span className="grid h-6 w-6 place-items-center rounded-full text-[10px] font-semibold text-white" style={{ background: n.color }}>
                {n.mark}
              </span>
              <span className="text-[11px] font-medium text-foreground">{n.name}</span>
              <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PlatformCard({ item }: { item: Integration }) {
  const meta = STATUS_META[item.status];
  return (
    <div className="group flex items-center gap-2.5 rounded-xl border border-border bg-surface p-2.5 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[10px] font-semibold text-white" style={{ background: item.color }}>
        {item.mark}
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-medium text-foreground">{item.name}</div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
          <span className={meta.text}>{meta.label}</span>
          <span className="text-border">·</span>
          <span className="truncate">{item.sync}</span>
        </div>
      </div>
    </div>
  );
}

function IntegrationsSection() {
  const allPlatforms = INTEGRATION_CATEGORIES.flatMap((c) => c.items);
  const connected = allPlatforms.filter((p) => p.status === "connected" || p.status === "syncing");
  const available = allPlatforms.filter((p) => p.status === "available");
  const coming = allPlatforms.filter((p) => p.status === "coming");

  return (
    <Section id="integrations">
      <SectionHead
        eyebrow="Integrations"
        title="Connect once."
        italic="See everything."
        sub="Bring your marketing tools together in one secure platform. Connect your accounts once and view your marketing data through a single dashboard."
      />

      <div className="mt-14 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start">
        {/* LEFT — Ecosystem */}
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-xs sm:p-10">
          <IntegrationOrbit />
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-muted-foreground">
            {(Object.keys(STATUS_META) as IntegrationStatus[]).map((s) => (
              <span key={s} className="inline-flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${STATUS_META[s].dot}`} />
                {STATUS_META[s].label}
              </span>
            ))}
          </div>
        </div>

        {/* RIGHT — Features */}
        <div className="grid gap-3 sm:grid-cols-2">
          {INTEGRATION_FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="rounded-2xl border border-border bg-surface p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <h3 className="mt-4 text-[14px] font-semibold tracking-tight text-foreground">{f.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{f.body}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Categories */}
      <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {INTEGRATION_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <div key={cat.label} className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
              <div className="mb-4 flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <h3 className="text-[13px] font-semibold tracking-tight text-foreground">{cat.label}</h3>
                <span className="ml-auto text-[10px] text-muted-foreground">{cat.items.length}</span>
              </div>
              <div className="grid gap-2">
                {cat.items.map((item) => (
                  <PlatformCard key={item.name} item={item} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Callout */}
      <div className="mt-20 text-center">
        <h3 className="mx-auto max-w-3xl font-serif text-3xl leading-tight text-foreground sm:text-4xl md:text-5xl">
          The more you connect,
          <br />
          <em className="italic text-foreground/70">the more complete your marketing picture becomes.</em>
        </h3>
      </div>

      {/* Bottom showcase — carousel */}
      <div className="mt-16 space-y-6">
        {[
          { label: "Connected", status: "connected" as IntegrationStatus, items: connected },
          { label: "Available", status: "available" as IntegrationStatus, items: available },
          { label: "Coming Soon", status: "coming" as IntegrationStatus, items: coming },
        ].map((row) => (
          <div key={row.label}>
            <div className="mb-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              <span className={`h-1.5 w-1.5 rounded-full ${STATUS_META[row.status].dot}`} />
              {row.label}
              <span className="text-border">·</span>
              <span className="text-muted-foreground/70">{row.items.length}</span>
            </div>
            <div className="group relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
              <div className="flex w-max gap-3 animate-[marquee_40s_linear_infinite] group-hover:[animation-play-state:paused]">
                {[...row.items, ...row.items, ...row.items].map((item, idx) => (
                  <div
                    key={`${item.name}-${idx}`}
                    className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 shadow-xs transition-transform hover:-translate-y-0.5"
                  >
                    <span className="grid h-5 w-5 place-items-center rounded-full text-[9px] font-semibold text-white" style={{ background: item.color }}>
                      {item.mark}
                    </span>
                    <span className="text-xs font-medium text-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Security card */}
      <div className="mt-16 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-surface to-surface-2 p-8 shadow-xs sm:p-10">
        <div className="grid gap-6 md:grid-cols-[auto_1fr] md:items-start md:gap-8">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">Your connections stay secure.</h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Rothme connects to supported platforms using secure authentication methods and industry-standard encryption. You control which platforms you connect and can disconnect them at any time.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["OAuth 2.0", "AES-GCM at rest", "TLS 1.3 in transit", "Revoke anytime"].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] text-muted-foreground">
                  <ShieldCheck className="h-3 w-3 text-primary" /> {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ─────────────────────────────── How It Works ─────────────────────────────── */

const HIW_STEPS = [
  {
    n: "01",
    title: "Connect Your Platforms",
    body: "Securely connect the marketing platforms you already use. Rothme supports popular tools across social media, analytics, advertising, communication, CRM, and commerce.",
    footer: "Usually takes just a few minutes.",
    icon: Plug,
  },
  {
    n: "02",
    title: "Rothme Organizes Everything",
    body: "Once connected, Rothme securely syncs your marketing data into a single, easy-to-understand dashboard while monitoring your connected ecosystem.",
    footer: "Automatic syncing keeps your dashboard up to date.",
    icon: Workflow,
  },
  {
    n: "03",
    title: "Understand Your Marketing",
    body: "View reports, monitor Lead Audit, check your Marketing Health Score, and learn every metric through the built-in Marketing Cheat Sheet.",
    footer: "Built for clarity, not complexity.",
    icon: Lightbulb,
  },
];

const HIW_BENEFITS = [
  { icon: Zap, title: "Fast Setup", body: "Connect supported platforms in minutes." },
  { icon: ShieldCheck, title: "Secure", body: "Industry-standard authentication and encryption." },
  { icon: Activity, title: "Automatic", body: "Data stays synchronized through scheduled updates." },
  { icon: BookOpen, title: "Educational", body: "Understand your marketing without leaving the dashboard." },
];

const HIW_PLATFORM_CHIPS = [
  { mark: "Ig", color: "#E4405F" },
  { mark: "Fb", color: "#1877F2" },
  { mark: "Ga", color: "#4285F4" },
  { mark: "Sh", color: "#96BF48" },
  { mark: "Hs", color: "#FF7A59" },
];

function HiwStepIllustration({ step }: { step: number }) {
  if (step === 0) {
    return (
      <div className="relative h-32 overflow-hidden rounded-xl border border-border bg-gradient-to-br from-surface-2 to-surface">
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        {HIW_PLATFORM_CHIPS.map((p, i) => (
          <div
            key={i}
            className="absolute -translate-y-1/2 animate-[float-y_4s_ease-in-out_infinite]"
            style={{
              left: `${8 + i * 14}%`,
              top: `${30 + (i % 2) * 40}%`,
              animationDelay: `${i * 0.3}s`,
            }}
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg text-[10px] font-semibold text-white shadow-sm" style={{ background: p.color }}>
              {p.mark}
            </span>
          </div>
        ))}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="grid h-11 w-11 place-items-center rounded-xl border border-primary/30 bg-surface shadow-sm">
            <span className="font-serif text-[13px] italic text-foreground">r</span>
          </div>
        </div>
      </div>
    );
  }
  if (step === 1) {
    return (
      <div className="relative h-32 overflow-hidden rounded-xl border border-border bg-gradient-to-br from-surface-2 to-surface p-3">
        <div className="grid h-full grid-cols-3 gap-1.5">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="rounded bg-primary/10"
              style={{
                animation: `float-y 3s ease-in-out ${i * 0.15}s infinite`,
                opacity: 0.4 + ((i % 3) * 0.2),
              }}
            />
          ))}
        </div>
        <div className="absolute inset-x-3 bottom-3 flex items-center gap-2 rounded-lg border border-border bg-surface/95 px-2.5 py-1.5 shadow-sm backdrop-blur">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          <span className="text-[10px] font-medium text-foreground">Syncing 7 platforms</span>
        </div>
      </div>
    );
  }
  return (
    <div className="relative h-32 overflow-hidden rounded-xl border border-border bg-gradient-to-br from-surface-2 to-surface p-3">
      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
          <div className="h-full w-[86%] rounded-full bg-gradient-to-r from-primary to-emerald-500" />
        </div>
        <span className="text-[10px] font-mono text-foreground">86</span>
      </div>
      <div className="mt-2.5 grid grid-cols-3 gap-1.5">
        {["Reach", "Leads", "ROAS"].map((m) => (
          <div key={m} className="rounded-md border border-border bg-surface p-1.5">
            <div className="text-[9px] text-muted-foreground">{m}</div>
            <div className="mt-0.5 flex items-end gap-0.5">
              {[3, 5, 4, 6, 7].map((h, i) => (
                <div key={i} className="w-1 rounded-sm bg-primary/60" style={{ height: `${h * 2}px` }} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-start gap-1.5 rounded-md border border-primary/20 bg-primary/5 px-2 py-1">
        <Sparkles className="mt-0.5 h-2.5 w-2.5 shrink-0 text-primary" />
        <span className="text-[9px] leading-tight text-foreground">Meta Ads are outperforming Google by 34%.</span>
      </div>
    </div>
  );
}

function HowItWorks() {
  return (
    <Section tint>
      <SectionHead
        eyebrow="How Rothme Works"
        title="Three steps to better"
        italic="marketing visibility."
        sub="Connect your marketing tools, let Rothme organize your data, and start understanding your marketing from one place."
      />

      {/* Steps */}
      <div className="relative mt-14">
        {/* Desktop connecting line with traveling indicator */}
        <div className="pointer-events-none absolute left-[16%] right-[16%] top-[92px] hidden lg:block" aria-hidden="true">
          <div className="relative h-px bg-gradient-to-r from-transparent via-border to-transparent">
            <div className="absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_12px_2px_hsl(var(--primary)/0.6)] animate-[hiw-travel_5s_ease-in-out_infinite]" />
          </div>
        </div>

        <ol className="relative grid gap-6 lg:grid-cols-3">
          {HIW_STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <li
                key={s.n}
                className="group relative rounded-2xl border border-border bg-surface p-6 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md animate-[rise-in_0.7s_ease-out_both] sm:p-7"
                style={{ animationDelay: `${i * 0.12}s` }}
              >
                <div className="flex items-center gap-3">
                  <span className="relative z-10 grid h-11 w-11 place-items-center rounded-xl border border-border bg-surface font-mono text-sm font-semibold text-foreground shadow-xs">
                    {s.n}
                  </span>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                </div>

                <h3 className="mt-5 text-lg font-semibold tracking-tight text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>

                <div className="mt-5">
                  <HiwStepIllustration step={i} />
                </div>

                <div className="mt-4 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  {s.footer}
                </div>

                {/* Tablet arrow between cards */}
                {i < HIW_STEPS.length - 1 && (
                  <div className="pointer-events-none absolute -bottom-4 left-1/2 hidden -translate-x-1/2 md:block lg:hidden" aria-hidden="true">
                    <ChevronDown className="h-5 w-5 text-border" />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {/* Benefit row */}
      <div className="mt-16 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {HIW_BENEFITS.map((b, i) => {
          const Icon = b.icon;
          return (
            <div
              key={b.title}
              className="rounded-2xl border border-border bg-surface p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md animate-[rise-in_0.7s_ease-out_both]"
              style={{ animationDelay: `${0.4 + i * 0.08}s` }}
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </span>
              <h3 className="mt-4 text-[14px] font-semibold tracking-tight text-foreground">{b.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{b.body}</p>
            </div>
          );
        })}
      </div>

      {/* Callout */}
      <div className="mt-20 text-center">
        <h3 className="mx-auto max-w-3xl font-serif text-3xl leading-tight text-foreground sm:text-4xl md:text-5xl">
          Less time switching between tools.
          <br />
          <em className="italic text-foreground/70">More time understanding your business.</em>
        </h3>
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

const SECURITY_CARDS = [
  { icon: Lock, title: "Secure Authentication", body: "Connect supported platforms using secure authentication methods such as OAuth whenever available." },
  { icon: ShieldCheck, title: "Encrypted Connections", body: "Data is transmitted using industry-standard encryption while in transit." },
  { icon: Users, title: "You Control Your Data", body: "Choose which platforms to connect, disconnect, or reconnect at any time." },
  { icon: Eye, title: "Transparent Permissions", body: "Only request the permissions required to provide supported platform functionality." },
  { icon: FileText, title: "Privacy First", body: "Rothme is designed to respect customer privacy and provide visibility into connected marketing data." },
  { icon: Activity, title: "Growing Security Practices", body: "Security practices continue to evolve as the platform grows and new features are introduced." },
];

const SECURITY_ORBIT = [
  { mark: "Ga", name: "Analytics", color: "#E37400" },
  { mark: "Ga", name: "Google Ads", color: "#4285F4" },
  { mark: "Me", name: "Meta", color: "#1877F2" },
  { mark: "Tt", name: "TikTok", color: "#111111" },
  { mark: "Hs", name: "HubSpot", color: "#FF7A59" },
  { mark: "Gm", name: "Gmail", color: "#EA4335" },
  { mark: "Ol", name: "Outlook", color: "#0078D4" },
  { mark: "Sh", name: "Shopify", color: "#96BF48" },
  { mark: "Tw", name: "Twilio", color: "#F22F46" },
];

const BEST_PRACTICES = [
  { icon: Lock, title: "Strong passwords", body: "Use unique passwords for every platform." },
  { icon: ShieldCheck, title: "Multi-factor auth", body: "Add a second verification step to every account." },
  { icon: Link2, title: "Official connections", body: "Connect only through each platform's official flow." },
  { icon: Eye, title: "Regular reviews", body: "Audit connected apps and permissions periodically." },
  { icon: CheckCircle2, title: "Secure authentication", body: "Prefer providers that support modern auth." },
];

function SecurityOrbit() {
  const size = 420;
  const c = size / 2;
  const r = 160;
  const nodes = SECURITY_ORBIT.map((p, i) => {
    const angle = (i / SECURITY_ORBIT.length) * Math.PI * 2 - Math.PI / 2;
    return { ...p, x: c + Math.cos(angle) * r, y: c + Math.sin(angle) * r };
  });

  return (
    <div className="relative mx-auto w-full max-w-[460px]">
      <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-primary/10 via-transparent to-transparent blur-3xl" />
      <svg viewBox={`0 0 ${size} ${size}`} className="h-auto w-full" role="img" aria-label="Rothme secures connected marketing platforms">
        <circle cx={c} cy={c} r={r} fill="none" stroke="currentColor" className="text-border" strokeDasharray="3 6" />
        {nodes.map((n, i) => (
          <g key={i}>
            <line x1={c} y1={c} x2={n.x} y2={n.y} stroke="currentColor" className="text-primary/30" strokeWidth="1" strokeDasharray="5 5">
              <animate attributeName="stroke-dashoffset" values="0;-20" dur={`${2 + (i % 3) * 0.4}s`} repeatCount="indefinite" />
            </line>
          </g>
        ))}
        {/* Shield core */}
        <circle cx={c} cy={c} r={54} className="fill-background" stroke="currentColor" strokeOpacity="0.15" />
        <circle cx={c} cy={c} r={54} fill="none" className="text-primary/40" stroke="currentColor" strokeWidth="1">
          <animate attributeName="r" values="54;66;54" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;0;0.6" dur="3s" repeatCount="indefinite" />
        </circle>
        <g transform={`translate(${c - 18}, ${c - 20})`}>
          <path d="M18 2 L34 8 V18 C34 27 26 34 18 36 C10 34 2 27 2 18 V8 Z" className="fill-primary/10 stroke-primary" strokeWidth="1.5" />
          <path d="M12 18 L16 22 L24 14" className="fill-none stroke-primary" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>

      {nodes.map((n, i) => (
        <div
          key={i}
          className="absolute -translate-x-1/2 -translate-y-1/2 animate-[float_6s_ease-in-out_infinite]"
          style={{ left: `${(n.x / size) * 100}%`, top: `${(n.y / size) * 100}%`, animationDelay: `${i * 0.2}s` }}
        >
          <div className="flex items-center gap-1.5 rounded-full border border-border bg-surface/95 pl-1 pr-2.5 py-1 shadow-sm backdrop-blur-sm">
            <span className="grid h-6 w-6 place-items-center rounded-full text-[10px] font-semibold text-white" style={{ background: n.color }}>
              {n.mark}
            </span>
            <span className="text-[11px] font-medium text-foreground">{n.name}</span>
            <Lock className="h-2.5 w-2.5 text-emerald-600" />
          </div>
        </div>
      ))}
    </div>
  );
}

function Security() {
  return (
    <Section id="security" tint>
      <SectionHead
        eyebrow="Security & Privacy"
        title="Built with security"
        italic="in mind."
        sub="When you connect your marketing platforms, trust matters. Rothme is designed to protect your data, respect your privacy, and give you control over every connected account."
      />

      {/* Visualization + cards */}
      <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-start">
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-xs sm:p-10">
          <SecurityOrbit />
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Lock className="h-3 w-3 text-emerald-600" /> Encrypted in transit</span>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3 w-3 text-primary" /> Official OAuth</span>
            <span className="inline-flex items-center gap-1.5"><Eye className="h-3 w-3 text-foreground/70" /> You stay in control</span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {SECURITY_CARDS.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="rounded-2xl border border-border bg-surface p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <h3 className="mt-4 text-[14px] font-semibold tracking-tight text-foreground">{s.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transparency + Best Practices */}
      <div className="mt-14 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs sm:p-8">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Eye className="h-4 w-4" />
            </span>
            <h3 className="text-lg font-semibold tracking-tight text-foreground">Transparency Matters</h3>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            We believe you should always understand what's happening with your connected accounts. Rothme makes each of these visible in plain language.
          </p>
          <ul className="mt-4 space-y-2.5">
            {[
              "What information is connected.",
              "Why each permission is requested.",
              "Which features use connected data.",
              "How to disconnect an account whenever you choose.",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2 text-sm text-foreground">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs sm:p-8">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <h3 className="text-lg font-semibold tracking-tight text-foreground">Best Practices</h3>
            <span className="ml-auto rounded-full border border-border bg-surface-2 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              Recommended
            </span>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {BEST_PRACTICES.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.title} className="flex items-start gap-2.5 rounded-xl border border-border bg-surface-2 p-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-[12px] font-semibold text-foreground">{b.title}</div>
                    <div className="text-[11px] leading-snug text-muted-foreground">{b.body}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Callout */}
      <div className="mt-20 text-center">
        <h3 className="mx-auto max-w-3xl font-serif text-3xl leading-tight text-foreground sm:text-4xl md:text-5xl">
          Your marketing data belongs to you.
          <br />
          <em className="italic text-foreground/70">Rothme simply helps you understand it.</em>
        </h3>
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

/* ─────────────────────────────── Customer Stories ─────────────────────────────── */

type CustomerStory = {
  quote: string;
  name: string;
  role: string;
  company: string;
  rating?: number;
  photoUrl?: string;
  logoUrl?: string;
  caseStudyHref?: string;
};

// Authentic stories only. Leave empty until real, approved testimonials exist.
const CUSTOMER_STORIES: CustomerStory[] = [];

type CaseStudy = {
  business: string;
  industry: string;
  challenge: string;
  solution: string;
  results: string;
  href?: string;
};

// Only published case studies. Empty by default.
const CASE_STUDIES: CaseStudy[] = [];

type ReviewHighlight = {
  source: "Google" | "G2" | "Capterra" | "Trustpilot";
  quote: string;
  author: string;
  rating?: number;
  href?: string;
};

// Only verified, approved reviews.
const REVIEW_HIGHLIGHTS: ReviewHighlight[] = [];

function CustomerStories() {
  const hasStories = CUSTOMER_STORIES.length > 0;
  const hasCases = CASE_STUDIES.length > 0;
  const hasReviews = REVIEW_HIGHLIGHTS.length > 0;
  const preLaunch = !hasStories && !hasCases && !hasReviews;

  return (
    <Section tint>
      <SectionHead
        eyebrow="Customer stories"
        title="Built for businesses that want"
        italic="clarity."
      />
      <p className="mx-auto mt-5 max-w-2xl text-center text-[15px] leading-relaxed text-muted-foreground">
        Rothme is designed to help businesses understand their marketing with confidence.
        As our community grows, this section will showcase real customer experiences and measurable outcomes.
      </p>

      {preLaunch ? (
        <div className="mt-14 grid gap-6 lg:grid-cols-[1.15fr_1fr]">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-surface p-10 shadow-xs animate-fade-in sm:p-12">
            <div className="pointer-events-none absolute inset-0 opacity-[0.35]" aria-hidden>
              <div className="absolute -top-24 -right-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
              <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-foreground/[0.04] blur-3xl" />
            </div>
            <div className="relative">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                <Sparkles className="h-3 w-3" /> Early access
              </span>
              <h3 className="mt-5 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
                Be one of our{" "}
                <span className="font-serif italic font-normal">first success stories.</span>
              </h3>
              <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
                We're building Rothme with feedback from early users. Join today and help shape
                the future of marketing visibility.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/get-started"
                  className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow-md transition-all hover:-translate-y-px hover:shadow-lg"
                >
                  Start Free Trial <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#community"
                  className="inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-surface px-6 text-sm font-medium text-foreground transition-all hover:-translate-y-px hover:bg-surface-2"
                >
                  <Users className="h-4 w-4" /> Join the Community
                </a>
              </div>
            </div>
          </div>

          <div
            id="community"
            className="relative flex flex-col justify-between rounded-3xl border border-border bg-surface p-10 shadow-xs animate-fade-in"
          >
            <div>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <MessageSquare className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-2xl font-medium tracking-tight text-foreground">
                Help build Rothme
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                Your feedback helps shape new features, integrations, and improvements.
                Every story we publish here will come from a real customer.
              </p>
            </div>
            <a
              href="mailto:hello@rothme.app?subject=Rothme%20Feedback"
              className="mt-8 inline-flex h-11 w-fit items-center gap-2 rounded-lg border border-border bg-surface-2 px-5 text-sm font-medium text-foreground transition-all hover:-translate-y-px hover:bg-surface"
            >
              Share Feedback <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      ) : (
        <div className="mt-14 space-y-16">
          {hasStories && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {CUSTOMER_STORIES.map((s) => (
                <figure
                  key={`${s.name}-${s.company}`}
                  className="flex h-full flex-col rounded-3xl border border-border bg-surface p-7 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md animate-fade-in"
                >
                  {typeof s.rating === "number" && (
                    <div className="mb-3 flex gap-0.5" aria-label={`${s.rating} out of 5`}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${i < s.rating! ? "fill-foreground/80 text-foreground/80" : "text-border"}`}
                        />
                      ))}
                    </div>
                  )}
                  <blockquote className="flex-1 font-serif text-[17px] leading-snug text-foreground">
                    "{s.quote}"
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-3 text-sm">
                    {s.photoUrl ? (
                      <img src={s.photoUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
                    ) : (
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-surface-2 text-xs font-medium text-muted-foreground">
                        {s.name.slice(0, 1)}
                      </span>
                    )}
                    <div>
                      <div className="font-medium text-foreground">{s.name}</div>
                      <div className="text-muted-foreground">
                        {s.role} · {s.company}
                      </div>
                    </div>
                    {s.logoUrl && (
                      <img src={s.logoUrl} alt={`${s.company} logo`} className="ml-auto h-5 opacity-70" />
                    )}
                  </figcaption>
                  {s.caseStudyHref && (
                    <a
                      href={s.caseStudyHref}
                      className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      Read case study <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  )}
                </figure>
              ))}
            </div>
          )}

          {hasCases && (
            <div>
              <h3 className="text-center text-xl font-medium text-foreground">Featured case studies</h3>
              <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {CASE_STUDIES.map((c) => (
                  <article
                    key={c.business}
                    className="group flex h-full flex-col rounded-3xl border border-border bg-surface p-7 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md animate-fade-in"
                  >
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">{c.industry}</div>
                    <h4 className="mt-2 text-lg font-medium text-foreground">{c.business}</h4>
                    <dl className="mt-4 space-y-3 text-sm">
                      <div>
                        <dt className="font-medium text-foreground">Challenge</dt>
                        <dd className="text-muted-foreground">{c.challenge}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-foreground">Solution</dt>
                        <dd className="text-muted-foreground">{c.solution}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-foreground">Results</dt>
                        <dd className="text-muted-foreground">{c.results}</dd>
                      </div>
                    </dl>
                    {c.href && (
                      <a
                        href={c.href}
                        className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:underline"
                      >
                        Read more <ArrowRight className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </article>
                ))}
              </div>
            </div>
          )}

          {hasReviews && (
            <div>
              <h3 className="text-center text-xl font-medium text-foreground">Review highlights</h3>
              <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {REVIEW_HIGHLIGHTS.map((r, i) => (
                  <a
                    key={i}
                    href={r.href ?? "#"}
                    className="flex h-full flex-col rounded-2xl border border-border bg-surface p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">{r.source}</span>
                      {typeof r.rating === "number" && (
                        <div className="flex gap-0.5" aria-label={`${r.rating} out of 5`}>
                          {Array.from({ length: 5 }).map((_, k) => (
                            <Star
                              key={k}
                              className={`h-3 w-3 ${k < r.rating! ? "fill-foreground/80 text-foreground/80" : "text-border"}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="mt-3 flex-1 text-sm leading-snug text-foreground">"{r.quote}"</p>
                    <div className="mt-4 text-xs text-muted-foreground">— {r.author}</div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
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
  {
    q: "What is Rothme?",
    a: "Rothme is a marketing intelligence platform that helps businesses connect their marketing tools, monitor the health of their marketing ecosystem, and understand marketing data from one centralized dashboard.",
  },
  {
    q: "Who is Rothme for?",
    a: "Rothme is designed for small businesses, growing companies, marketing teams, agencies, and business owners who want a clearer understanding of their marketing without switching between multiple platforms.",
  },
  {
    q: "Which platforms can I connect?",
    a: "Rothme supports a growing list of marketing platforms including social media, analytics, advertising, CRM, communication, and commerce tools. Additional integrations are added regularly.",
  },
  {
    q: "How long does setup take?",
    a: "Most businesses can connect their first platforms in just a few minutes.",
  },
  {
    q: "What is Lead Audit?",
    a: "Lead Audit continuously monitors your connected marketing ecosystem and helps identify potential issues with website availability, tracking, integrations, lead capture systems, and other connected services.",
  },
  {
    q: "What is the Marketing Health Score?",
    a: "The Marketing Health Score provides a simple overview of the operational health of your connected marketing systems based on available platform data and monitoring results.",
  },
  {
    q: "Does Rothme use AI?",
    a: "Rothme uses AI to help explain marketing concepts and metrics in clear language. Rothme does not make marketing decisions or automatically change your campaigns.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. There are no long-term contracts. You can upgrade, downgrade, or cancel your subscription at any time.",
  },
  {
    q: "What happens after my 30-day Pro trial?",
    a: "At the end of your free trial, you can continue with Rothme Pro at $200/month or cancel at any time.",
  },
  {
    q: "Is my data secure?",
    a: "Rothme uses secure authentication methods where supported and industry-standard encryption to help protect connected account information. You remain in control of your connected accounts.",
  },
];

function FAQ() {
  return (
    <section id="faq" className="bg-surface">
      <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="eyebrow">FAQ</span>
          <h2 className="mt-4 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
            Everything you need to know before getting started with Rothme.
          </p>
        </div>

        <Accordion type="single" collapsible className="mt-12 space-y-4">
          {FAQS.map((item, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="rounded-2xl border border-border bg-background px-5 shadow-sm transition-shadow duration-300 hover:shadow-md data-[state=open]:shadow-md"
            >
              <AccordionTrigger className="py-5 text-[15px] font-medium text-foreground hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

/* ─────────────────────────────── Final CTA ─────────────────────────────── */

function FinalCTA() {
  return (
    <section id="cta" className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary/10 via-background to-primary/5 px-6 py-24 sm:px-12 lg:px-16">
          {/* Soft floating shapes */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-medium tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Start Understanding Your Marketing Today.
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Connect your marketing platforms, monitor your marketing ecosystem, and understand your business from one simple dashboard.
            </p>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              No complicated reports.
              <br />
              No switching between platforms.
              <br />
              Just clarity.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-full px-8 text-base font-medium shadow-lg shadow-primary/20 transition-transform duration-300 hover:-translate-y-0.5"
              >
                <Link to="/get-started">Start Free 30-Day Pro Trial</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 rounded-full px-8 text-base font-medium transition-transform duration-300 hover:-translate-y-0.5"
              >
                <Link to="/pricing">View Pricing</Link>
              </Button>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
              {TRUST_INDICATORS.map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const TRUST_INDICATORS = [
  "Secure Connections",
  "Cancel Anytime",
  "30-Day Free Trial",
  "Upgrade or Downgrade Anytime",
];

/* ─────────────────────────────── Footer ─────────────────────────────── */

const FOOTER_LINKS = {
  product: [
    { label: "Features", to: "#features" },
    { label: "Lead Audit", to: "#lead-audit" },
    { label: "Marketing Health Score", to: "#health-score" },
    { label: "Marketing Cheat Sheet", to: "#cheat-sheet" },
    { label: "Integrations", to: "#integrations" },
    { label: "Pricing", to: "/pricing" },
  ],
  resources: [
    { label: "Help Center", href: "#" },
    { label: "Documentation", href: "#" },
    { label: "API", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Product Roadmap", href: "#" },
    { label: "System Status", href: "#" },
    { label: "Trust Center", href: "#" },
  ],
  company: [
    { label: "About", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
    { label: "Press", href: "#" },
    { label: "Affiliate Program", href: "#" },
    { label: "Partners", href: "#" },
  ],
  legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
    { label: "Security", href: "#" },
    { label: "Data Processing", href: "#" },
  ],
  social: [
    { label: "LinkedIn", href: "#" },
    { label: "YouTube", href: "#" },
    { label: "Facebook", href: "#" },
    { label: "Instagram", href: "#" },
    { label: "X", href: "#" },
    { label: "TikTok", href: "#" },
  ],
};

const BOTTOM_LINKS = [
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
  { label: "Cookies", href: "#" },
  { label: "Accessibility", href: "#" },
  { label: "Status", href: "#" },
];

function Footer() {
  return (
    <footer className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Link to="/" className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                <span className="font-serif text-[15px] leading-none">R</span>
              </span>
              <Wordmark />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Helping businesses understand their marketing through connected data, continuous monitoring, and educational insights.
            </p>
          </div>

          {/* Link groups */}
          <div className="grid gap-10 sm:grid-cols-3 lg:col-span-5 lg:grid-cols-3">
            <FooterCol title="Product" links={FOOTER_LINKS.product} />
            <FooterCol title="Resources" links={FOOTER_LINKS.resources} />
            <FooterCol title="Company" links={FOOTER_LINKS.company} />
          </div>

          {/* Legal + Social */}
          <div className="grid gap-10 sm:grid-cols-2 lg:col-span-3 lg:grid-cols-1">
            <FooterCol title="Legal" links={FOOTER_LINKS.legal} />
            <FooterCol title="Social" links={FOOTER_LINKS.social} />
          </div>
        </div>

        {/* Divider */}
        <div className="mt-16 border-t border-border" />

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <span className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Rothme. All rights reserved.
            </span>
            <nav className="flex flex-wrap items-center gap-4 text-sm">
              {BOTTOM_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
          <p className="text-sm text-muted-foreground">
            Made with <span className="text-red-500">♥</span> for businesses that want marketing clarity.
          </p>
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
  links: Array<{ label: string; href?: string; to?: string }>;
}) {
  const isExternal = (href?: string) => href?.startsWith("http");

  return (
    <div>
      <h3 className="text-[13px] font-medium tracking-tight text-foreground">{title}</h3>
      <ul className="mt-4 space-y-3">
        {links.map((l) => {
          const className =
            "group inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground";
          return (
            <li key={l.label}>
              {l.to ? (
                <Link to={l.to} className={className}>
                  {l.label}
                  {isExternal(l.to) && <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />}
                </Link>
              ) : (
                <a href={l.href} className={className}>
                  {l.label}
                  {isExternal(l.href) && <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />}
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
