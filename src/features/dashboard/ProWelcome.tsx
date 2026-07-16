import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { PartyPopper, Sparkles } from "lucide-react";
import { Checklist, type ChecklistItem } from "@/components/dashboard/Checklist";
import { useChecklist } from "@/hooks/use-checklist";
import { cn } from "@/lib/utils";

const WELCOME_KEY = "rothme.pro.welcome.seen";
const CHECKLIST_KEY = "rothme.pro.checklist";

const ITEMS: (ChecklistItem & { href?: string })[] = [
  {
    id: "business_profile",
    title: "Complete your Business Profile",
    why: "The AI uses this to personalize every recommendation.",
    action: "Open profile",
    href: "/business-profile",
  },
  {
    id: "connect_google",
    title: "Connect Google",
    why: "Pulls in Google Business Profile, Search, and Ads data.",
    action: "Connect",
    href: "/onboarding/connections",
  },
  {
    id: "connect_facebook",
    title: "Connect Facebook",
    why: "Unlocks page insights, Instagram, and Meta Ads.",
    action: "Connect",
    href: "/onboarding/connections",
  },
  {
    id: "ai_audit",
    title: "Run your AI Audit",
    why: "A full scan of your marketing — scores and next moves in plain English.",
    action: "Run audit",
    href: "/audit",
  },
  {
    id: "invite_team",
    title: "Invite your team",
    why: "Bring in the people who help you run marketing.",
    action: "Invite",
    href: "/settings",
  },
  {
    id: "first_report",
    title: "Complete your first AI Report",
    why: "A short weekly briefing — what happened, why, what to do.",
    action: "Generate report",
    href: "/insights",
  },
];

export function ProWelcome() {
  const [show, setShow] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(WELCOME_KEY)) {
        setShow(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => dismiss(), 3500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  const dismiss = () => {
    setClosing(true);
    try {
      window.localStorage.setItem(WELCOME_KEY, "1");
    } catch {
      /* ignore */
    }
    setTimeout(() => setShow(false), 300);
  };

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-label="Welcome to ROTHME"
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-xl",
        closing ? "animate-fade-out" : "animate-fade-in",
      )}
      onClick={dismiss}
    >
      <div
        className={cn(
          "relative mx-4 max-w-md rounded-3xl border border-primary/40 bg-gradient-to-br from-primary/15 via-background to-background p-10 text-center shadow-2xl",
          closing ? "animate-scale-out" : "animate-scale-in",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <ConfettiBurst />
        <div className="mx-auto mb-4 text-6xl" aria-hidden>
          🎉
        </div>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs">
          <Sparkles className="h-3 w-3 text-primary" />
          <span className="text-muted-foreground">You're in</span>
        </div>
        <h2 className="text-3xl font-semibold tracking-tight">Welcome to ROTHME</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Your AI Marketing Operating System is unlocked. Let's set up the essentials.
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="mt-6 inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:opacity-90"
        >
          <PartyPopper className="mr-2 h-4 w-4" />
          Let's go
        </button>
      </div>
    </div>
  );
}

export function ProChecklist() {
  const { checked, hydrated } = useChecklist(CHECKLIST_KEY);
  const total = ITEMS.length;
  const done = hydrated ? Array.from(checked).filter((id) => ITEMS.some((i) => i.id === id)).length : 0;
  const pct = Math.round((done / total) * 100);

  return (
    <section className="rounded-3xl border border-border/50 bg-card/50 p-6 backdrop-blur-xl">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs">
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="text-muted-foreground">setup</span>
          </div>
          <h2 className="text-xl font-semibold tracking-tight">Finish setting up ROTHME</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Each step makes the AI smarter about your business.
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold tracking-tight tabular-nums">
            {done}/{total}
          </div>
          <div className="text-xs text-muted-foreground">{pct}% complete</div>
        </div>
      </div>

      <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-border/40">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${Math.max(2, pct)}%` }}
        />
      </div>

      <Checklist
        storageKey={CHECKLIST_KEY}
        items={ITEMS}
        onAction={(item) => {
          const it = ITEMS.find((i) => i.id === item.id);
          if (it?.href) window.location.assign(it.href);
        }}
      />
      {/* Also render deep-link items as accessible anchors for keyboard nav */}
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        {ITEMS.map((it) =>
          it.href ? (
            <Link
              key={it.id}
              to={it.href}
              className="rounded-full border border-border/50 px-2.5 py-1 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              {it.title}
            </Link>
          ) : null,
        )}
      </div>
    </section>
  );
}

function ConfettiBurst() {
  const pieces = Array.from({ length: 24 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl" aria-hidden>
      {pieces.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 400;
        const duration = 1400 + Math.random() * 900;
        const size = 4 + Math.random() * 4;
        const colors = ["#f43f5e", "#f59e0b", "#10b981", "#3b82f6", "#a855f7", "#ec4899"];
        const bg = colors[i % colors.length];
        return (
          <span
            key={i}
            className="absolute top-0 block rounded-sm"
            style={{
              left: `${left}%`,
              width: `${size}px`,
              height: `${size * 1.6}px`,
              backgroundColor: bg,
              animation: `confetti-fall ${duration}ms cubic-bezier(0.2, 0.7, 0.2, 1) ${delay}ms forwards`,
              opacity: 0,
            }}
          />
        );
      })}
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(360px) rotate(540deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
