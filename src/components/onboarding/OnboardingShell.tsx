import { Link } from "@tanstack/react-router";
import { Check, Sparkles } from "lucide-react";
import { Wordmark } from "@/components/brand/Wordmark";
import { cn } from "@/lib/utils";
import type { OnboardingSession } from "@/lib/onboarding/session.functions";

export type StepDef = {
  id: string;
  path: string;
  label: string;
  group: string;
};

export const ONBOARDING_STEPS: StepDef[] = [
  { id: "welcome", path: "/onboarding/welcome", label: "Welcome", group: "Start" },
  { id: "discovery", path: "/onboarding/discovery", label: "About your business", group: "Discover" },
  { id: "analysis", path: "/onboarding/analysis", label: "Business analysis", group: "Discover" },
  { id: "workspace-build", path: "/onboarding/workspace-build", label: "Build workspace", group: "Build" },
  { id: "connections", path: "/onboarding/connections", label: "Connect platforms", group: "Build" },
  { id: "subscription", path: "/onboarding/subscription", label: "Choose a plan", group: "Configure" },
  { id: "configuration", path: "/onboarding/configuration", label: "Brand profile", group: "Configure" },
  { id: "ai-training", path: "/onboarding/ai-training", label: "Train the AI", group: "Configure" },
  { id: "marketing-plan", path: "/onboarding/marketing-plan", label: "Your first plan", group: "Launch" },
  { id: "walkthrough", path: "/onboarding/walkthrough", label: "Tour ROTHME", group: "Launch" },
  { id: "first-success", path: "/onboarding/first-success", label: "First win", group: "Launch" },
];

export const CHECKLIST_ITEMS: { id: string; label: string }[] = [
  { id: "workspace_created", label: "Workspace created" },
  { id: "ai_configured", label: "AI configured" },
  { id: "brand_profile_complete", label: "Brand profile complete" },
  { id: "platforms_connected", label: "Platforms connected" },
  { id: "team_invited", label: "Team invited" },
  { id: "analytics_ready", label: "Analytics ready" },
  { id: "first_campaign_generated", label: "First campaign generated" },
  { id: "first_post_scheduled", label: "First post scheduled" },
  { id: "dashboard_complete", label: "Dashboard complete" },
];

export function OnboardingShell({
  currentStepId,
  session,
  children,
  aiPanel,
}: {
  currentStepId: string;
  session: OnboardingSession | null;
  children: React.ReactNode;
  aiPanel?: React.ReactNode;
}) {
  const currentIndex = Math.max(
    0,
    ONBOARDING_STEPS.findIndex((s) => s.id === currentStepId),
  );
  const progressPct = Math.round(((currentIndex + 1) / ONBOARDING_STEPS.length) * 100);
  const checklist = session?.checklist ?? {};
  const doneCount = CHECKLIST_ITEMS.filter((i) => checklist[i.id]).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 text-foreground">
      <header className="sticky top-0 z-20 border-b border-border/50 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <Wordmark />
          </Link>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="hidden sm:inline">Step {currentIndex + 1} of {ONBOARDING_STEPS.length}</span>
            <div className="h-1.5 w-32 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <Link to="/dashboard" className="hover:text-foreground">Save &amp; exit</Link>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1400px] gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)_300px]">
        {/* Left: progress rail */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-6">
            <ProgressRail currentIndex={currentIndex} />
          </div>
        </aside>

        {/* Center */}
        <main className="min-w-0">
          <div className="animate-fade-in">{children}</div>
        </main>

        {/* Right: AI companion + checklist */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            {aiPanel ?? <DefaultAiPanel />}
            <ChecklistCard doneCount={doneCount} total={CHECKLIST_ITEMS.length} checklist={checklist} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function ProgressRail({ currentIndex }: { currentIndex: number }) {
  let lastGroup = "";
  return (
    <nav aria-label="Onboarding progress" className="text-sm">
      <ol className="space-y-1">
        {ONBOARDING_STEPS.map((step, i) => {
          const showGroup = step.group !== lastGroup;
          lastGroup = step.group;
          const state =
            i < currentIndex ? "done" : i === currentIndex ? "current" : "upcoming";
          return (
            <li key={step.id}>
              {showGroup && (
                <div className="mb-1 mt-4 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 first:mt-0">
                  {step.group}
                </div>
              )}
              <div
                className={cn(
                  "flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors",
                  state === "current" && "bg-primary/10 text-foreground",
                  state === "done" && "text-muted-foreground",
                  state === "upcoming" && "text-muted-foreground/60",
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-medium",
                    state === "current" && "border-primary bg-primary text-primary-foreground",
                    state === "done" && "border-primary/60 bg-primary/20 text-primary",
                    state === "upcoming" && "border-border/60",
                  )}
                >
                  {state === "done" ? <Check className="h-3 w-3" /> : i + 1}
                </span>
                <span className="truncate text-xs">{step.label}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function DefaultAiPanel() {
  return (
    <div className="rounded-2xl border border-border/50 bg-card/50 p-4 backdrop-blur-xl">
      <div className="mb-2 flex items-center gap-2 text-xs font-medium">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        ROTHME AI
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">
        I'm learning about your business as you go. Every answer helps me tailor your workspace.
      </p>
    </div>
  );
}

function ChecklistCard({
  doneCount,
  total,
  checklist,
}: {
  doneCount: number;
  total: number;
  checklist: Record<string, boolean>;
}) {
  const pct = Math.round((doneCount / total) * 100);
  return (
    <div className="rounded-2xl border border-border/50 bg-card/50 p-4 backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-xs font-medium">Setup checklist</div>
        <div className="text-xs tabular-nums text-muted-foreground">{doneCount}/{total}</div>
      </div>
      <div className="mb-3 h-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-gradient-to-r from-primary to-primary/50 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <ul className="space-y-1.5">
        {CHECKLIST_ITEMS.map((item) => {
          const done = !!checklist[item.id];
          return (
            <li key={item.id} className="flex items-center gap-2 text-xs">
              <span
                className={cn(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                  done ? "border-primary bg-primary/20 text-primary" : "border-border/60 text-transparent",
                )}
              >
                <Check className="h-2.5 w-2.5" />
              </span>
              <span className={cn(done ? "text-muted-foreground line-through" : "text-foreground")}>
                {item.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function AiThinkingPanel({ lines }: { lines: string[] }) {
  return (
    <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-4 backdrop-blur-xl">
      <div className="mb-3 flex items-center gap-2 text-xs font-medium">
        <Sparkles className="h-3.5 w-3.5 animate-pulse text-primary" />
        ROTHME is analyzing…
      </div>
      <ul className="space-y-1.5 text-xs text-muted-foreground">
        {lines.map((l, i) => (
          <li key={i} className="animate-fade-in" style={{ animationDelay: `${i * 300}ms`, animationFillMode: "backwards" }}>
            {l}
          </li>
        ))}
      </ul>
    </div>
  );
}
