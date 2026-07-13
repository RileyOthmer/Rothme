import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Toaster, toast } from "sonner";

import { Wordmark } from "@/components/brand/Wordmark";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { updateProfile } from "@/lib/profile.functions";
import {
  trackOnboardingEvent,
  upsertOnboardingResponse,
} from "@/lib/onboarding-analytics.functions";
import {
  getAnonId,
  getCountryFromLocale,
  getDeviceType,
  getReferralSource,
  getTimezone,
} from "@/lib/anon-analytics";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "Welcome to Velora" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OnboardingPage,
});

// ---------- Data ----------

type StepId =
  | "welcome"
  | "describe"
  | "goals"
  | "platforms"
  | "cadence"
  | "frustrations"
  | "ai"
  | "connect"
  | "loading"
  | "done";

const STEPS: StepId[] = [
  "welcome",
  "describe",
  "goals",
  "platforms",
  "cadence",
  "frustrations",
  "ai",
  "connect",
  "loading",
  "done",
];

const DESCRIBE_OPTIONS = [
  "Personal","Creator","Business","Startup","E-commerce","Agency",
  "Freelancer","Enterprise","Education","Nonprofit","Artist / Musician","Other",
];

const GOAL_OPTIONS = [
  "Grow my audience","Schedule posts","Create AI content","Manage multiple accounts",
  "Track analytics","Increase engagement","Generate leads","Increase sales",
  "Reply to messages","Collaborate with a team","Run advertising campaigns",
  "Save time through automation","Everything",
];

type Platform = {
  id: string;
  name: string;
  initials: string;
  gradient: string;
};

const PLATFORMS: Platform[] = [
  { id: "instagram", name: "Instagram", initials: "IG", gradient: "from-[#f58529] via-[#dd2a7b] to-[#8134af]" },
  { id: "facebook", name: "Facebook", initials: "FB", gradient: "from-[#1877f2] to-[#0a4bc0]" },
  { id: "threads", name: "Threads", initials: "TH", gradient: "from-[#111] to-[#333]" },
  { id: "x", name: "X", initials: "X", gradient: "from-[#0f0f0f] to-[#2a2a2a]" },
  { id: "linkedin", name: "LinkedIn", initials: "IN", gradient: "from-[#0a66c2] to-[#004182]" },
  { id: "tiktok", name: "TikTok", initials: "TT", gradient: "from-[#25f4ee] via-[#111] to-[#fe2c55]" },
  { id: "youtube", name: "YouTube", initials: "YT", gradient: "from-[#ff0000] to-[#b30000]" },
  { id: "pinterest", name: "Pinterest", initials: "PI", gradient: "from-[#e60023] to-[#ad0018]" },
  { id: "snapchat", name: "Snapchat", initials: "SC", gradient: "from-[#fffc00] to-[#e0dc00]" },
  { id: "bluesky", name: "Bluesky", initials: "BS", gradient: "from-[#1da1f2] to-[#0084d1]" },
  { id: "reddit", name: "Reddit", initials: "RD", gradient: "from-[#ff4500] to-[#cc3700]" },
  { id: "discord", name: "Discord", initials: "DC", gradient: "from-[#5865f2] to-[#3c47c4]" },
  { id: "telegram", name: "Telegram", initials: "TG", gradient: "from-[#2aabee] to-[#229ed9]" },
];

const CADENCE_OPTIONS = [
  "Daily","Several times a week","Weekly","Monthly","Occasionally","Just getting started",
];

const FRUSTRATION_OPTIONS = [
  "Managing multiple apps","Scheduling content","Creating content","Finding ideas",
  "Analytics","Engagement","Growing followers","Reporting","Team collaboration",
  "Automation","Nothing",
];

const AI_OPTIONS = [
  "Caption generation","Image generation","Video generation","Content calendar",
  "Auto replies","Hashtag suggestions","Trend discovery","Performance insights",
  "Campaign planning","Workflow automation","Everything",
];

const LOADING_MESSAGES = [
  "Importing accounts…",
  "Analyzing your goals…",
  "Building your dashboard…",
  "Almost ready…",
];

// ---------- State ----------

type Answers = {
  describe: string[];
  goals: string[];
  platforms: string[];
  cadence: string | null;
  frustrations: string[];
  ai: string[];
  connected: string[];
  stepIndex: number;
};

const STORAGE_KEY = "velora.onboarding.v1";

const emptyAnswers: Answers = {
  describe: [],
  goals: [],
  platforms: [],
  cadence: null,
  frustrations: [],
  ai: [],
  connected: [],
  stepIndex: 0,
};

function loadAnswers(): Answers {
  if (typeof window === "undefined") return emptyAnswers;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyAnswers;
    return { ...emptyAnswers, ...JSON.parse(raw) };
  } catch {
    return emptyAnswers;
  }
}

// ---------- Component ----------

function OnboardingPage() {
  const navigate = useNavigate();
  const saveProfile = useServerFn(updateProfile);

  const [answers, setAnswers] = useState<Answers>(emptyAnswers);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setAnswers(loadAnswers());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    } catch {
      /* ignore */
    }
  }, [answers, hydrated]);

  const stepId = STEPS[answers.stepIndex] ?? "welcome";
  const isQuestion = ["describe","goals","platforms","cadence","frustrations","ai","connect"].includes(stepId);
  const totalQuestionSteps = 7; // for the progress indicator
  const currentQuestionNumber = useMemo(() => {
    const idx = ["describe","goals","platforms","cadence","frustrations","ai","connect"].indexOf(stepId);
    return idx >= 0 ? idx + 1 : 0;
  }, [stepId]);

  const goNext = useCallback(() => {
    setAnswers((a) => ({ ...a, stepIndex: Math.min(a.stepIndex + 1, STEPS.length - 1) }));
  }, []);
  const goBack = useCallback(() => {
    setAnswers((a) => ({ ...a, stepIndex: Math.max(a.stepIndex - 1, 0) }));
  }, []);

  const toggle = useCallback((key: keyof Answers, value: string) => {
    setAnswers((a) => {
      const arr = a[key] as string[];
      const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
      return { ...a, [key]: next };
    });
  }, []);

  const finish = useMutation({
    mutationFn: () => saveProfile({ data: { mark_onboarded: true } }),
    onSuccess: () => {
      try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
      navigate({ to: "/dashboard", replace: true });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not finish."),
  });

  // Loading step: auto-advance
  useEffect(() => {
    if (stepId !== "loading") return;
    const t = setTimeout(() => goNext(), 3800);
    return () => clearTimeout(t);
  }, [stepId, goNext]);

  // Keyboard: Enter to continue on question steps when valid; Esc back
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && answers.stepIndex > 0 && stepId !== "loading") {
        e.preventDefault();
        goBack();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [answers.stepIndex, stepId, goBack]);

  const canContinue = useMemo(() => {
    switch (stepId) {
      case "describe": return answers.describe.length > 0;
      case "goals": return answers.goals.length > 0;
      case "platforms": return answers.platforms.length > 0;
      case "cadence": return answers.cadence !== null;
      case "frustrations": return answers.frustrations.length > 0;
      case "ai": return answers.ai.length > 0;
      default: return true;
    }
  }, [stepId, answers]);

  const isOptional = stepId === "frustrations" || stepId === "ai" || stepId === "connect";

  return (
    <div className="relative min-h-dvh overflow-hidden bg-background text-foreground">
      {/* Ambient background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/3 h-[520px] w-[520px] rounded-full bg-primary/20 blur-[140px]" />
        <div className="absolute bottom-[-200px] right-[-120px] h-[560px] w-[560px] rounded-full bg-fuchsia-500/15 blur-[160px]" />
        <div className="absolute top-1/2 left-[-160px] h-[420px] w-[420px] rounded-full bg-sky-400/15 blur-[160px]" />
      </div>

      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 pt-6 sm:px-8 sm:pt-8">
        <Wordmark />
        {isQuestion ? (
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-muted-foreground tabular-nums">
              {currentQuestionNumber} / {totalQuestionSteps}
            </span>
            <div className="hidden h-1.5 w-40 overflow-hidden rounded-full bg-foreground/10 sm:block">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary to-fuchsia-500"
                initial={false}
                animate={{ width: `${(currentQuestionNumber / totalQuestionSteps) * 100}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
              />
            </div>
          </div>
        ) : (
          <div className="h-6" />
        )}
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-col px-5 pb-16 pt-10 sm:px-8 sm:pt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={stepId}
            initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <GlassCard>
              {stepId === "welcome" && <StepWelcome onNext={goNext} />}
              {stepId === "describe" && (
                <StepMulti
                  title="What best describes you?"
                  subtitle="Pick everything that applies. This tailors your workspace."
                  options={DESCRIBE_OPTIONS}
                  selected={answers.describe}
                  onToggle={(v) => toggle("describe", v)}
                />
              )}
              {stepId === "goals" && (
                <StepMulti
                  title="What are you hoping to accomplish?"
                  subtitle="Choose as many goals as you like."
                  options={GOAL_OPTIONS}
                  selected={answers.goals}
                  onToggle={(v) => toggle("goals", v)}
                />
              )}
              {stepId === "platforms" && (
                <StepPlatforms
                  selected={answers.platforms}
                  onToggle={(v) => toggle("platforms", v)}
                />
              )}
              {stepId === "cadence" && (
                <StepSingle
                  title="How often do you publish?"
                  subtitle="An honest answer helps us pace suggestions."
                  options={CADENCE_OPTIONS}
                  selected={answers.cadence}
                  onSelect={(v) => setAnswers((a) => ({ ...a, cadence: v }))}
                />
              )}
              {stepId === "frustrations" && (
                <StepMulti
                  title="What frustrates you the most?"
                  subtitle="We'll prioritize fixing these first."
                  options={FRUSTRATION_OPTIONS}
                  selected={answers.frustrations}
                  onToggle={(v) => toggle("frustrations", v)}
                />
              )}
              {stepId === "ai" && (
                <StepMulti
                  title="What AI features would help you most?"
                  subtitle="We'll surface these in your workspace."
                  options={AI_OPTIONS}
                  selected={answers.ai}
                  onToggle={(v) => toggle("ai", v)}
                />
              )}
              {stepId === "connect" && (
                <StepConnect
                  connected={answers.connected}
                  onToggle={(v) => toggle("connected", v)}
                />
              )}
              {stepId === "loading" && <StepLoading />}
              {stepId === "done" && (
                <StepDone
                  onFinish={() => finish.mutate()}
                  isPending={finish.isPending}
                />
              )}
            </GlassCard>
          </motion.div>
        </AnimatePresence>

        {/* Nav controls */}
        {stepId !== "welcome" && stepId !== "loading" && stepId !== "done" && (
          <div className="mt-6 flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={goBack}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <div className="flex items-center gap-3">
              {isOptional && (
                <button
                  type="button"
                  onClick={goNext}
                  className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  Skip
                </button>
              )}
              <Button
                type="button"
                onClick={goNext}
                disabled={!canContinue}
                className="gap-2"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </main>

      <Toaster position="bottom-right" />
    </div>
  );
}

// ---------- Shared pieces ----------

function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/70 p-7 shadow-[0_10px_60px_-15px_rgba(0,0,0,0.25)] backdrop-blur-2xl sm:p-10 dark:border-white/10 dark:bg-white/[0.04]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/20"
      />
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "group relative rounded-full border px-4 py-2.5 text-sm font-medium transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        active
          ? "border-primary/60 bg-primary text-primary-foreground shadow-[0_4px_20px_-6px_hsl(var(--primary)/0.6)]"
          : "border-foreground/15 bg-background/60 text-foreground hover:border-foreground/30 hover:bg-foreground/5",
      )}
    >
      <span className="inline-flex items-center gap-1.5">
        {active && <Check className="h-3.5 w-3.5" />}
        {children}
      </span>
    </button>
  );
}

// ---------- Steps ----------

function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col items-center text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary to-fuchsia-500 text-primary-foreground shadow-lg"
      >
        <Sparkles className="h-6 w-6" />
      </motion.div>
      <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
        Welcome to Velora
      </p>
      <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
        Everything social.<br className="hidden sm:block" /> One platform.
      </h1>
      <p className="mt-5 max-w-md text-balance text-base text-muted-foreground sm:text-lg">
        Connect your accounts, personalize your workspace, and start managing your entire social presence in minutes.
      </p>
      <Button size="lg" onClick={onNext} className="mt-8 h-12 gap-2 px-8 text-base">
        Get Started <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

function StepHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-7">
      <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
      {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function StepMulti({
  title, subtitle, options, selected, onToggle,
}: {
  title: string; subtitle?: string; options: string[]; selected: string[]; onToggle: (v: string) => void;
}) {
  return (
    <div>
      <StepHeader title={title} subtitle={subtitle} />
      <div className="flex flex-wrap gap-2.5">
        {options.map((opt) => (
          <Chip key={opt} active={selected.includes(opt)} onClick={() => onToggle(opt)}>
            {opt}
          </Chip>
        ))}
      </div>
    </div>
  );
}

function StepSingle({
  title, subtitle, options, selected, onSelect,
}: {
  title: string; subtitle?: string; options: string[]; selected: string | null; onSelect: (v: string) => void;
}) {
  return (
    <div>
      <StepHeader title={title} subtitle={subtitle} />
      <div className="grid gap-2.5 sm:grid-cols-2">
        {options.map((opt) => {
          const active = selected === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onSelect(opt)}
              aria-pressed={active}
              className={cn(
                "group flex items-center justify-between rounded-2xl border px-4 py-3.5 text-left text-sm font-medium transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                active
                  ? "border-primary bg-primary/10 text-foreground shadow-[0_4px_20px_-8px_hsl(var(--primary)/0.5)]"
                  : "border-foreground/10 bg-background/60 hover:border-foreground/25 hover:bg-foreground/5",
              )}
            >
              <span>{opt}</span>
              <span
                className={cn(
                  "grid h-5 w-5 place-items-center rounded-full border transition-colors",
                  active ? "border-primary bg-primary text-primary-foreground" : "border-foreground/25",
                )}
              >
                {active && <Check className="h-3 w-3" />}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepPlatforms({ selected, onToggle }: { selected: string[]; onToggle: (id: string) => void }) {
  return (
    <div>
      <StepHeader
        title="Which social platforms do you use?"
        subtitle="Pick every network you're active on. You can change this later."
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {PLATFORMS.map((p) => {
          const active = selected.includes(p.id);
          return (
            <motion.button
              key={p.id}
              type="button"
              onClick={() => onToggle(p.id)}
              aria-pressed={active}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "group relative flex flex-col items-center gap-2.5 rounded-2xl border p-4 text-center transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                active
                  ? "border-primary bg-primary/5 shadow-[0_6px_24px_-10px_hsl(var(--primary)/0.55)]"
                  : "border-foreground/10 bg-background/60 hover:border-foreground/25",
              )}
            >
              {active && (
                <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-3 w-3" />
                </span>
              )}
              <div
                className={cn(
                  "grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br text-sm font-bold text-white shadow-md",
                  p.gradient,
                )}
              >
                {p.initials}
              </div>
              <span className="text-sm font-medium">{p.name}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function StepConnect({ connected, onToggle }: { connected: string[]; onToggle: (id: string) => void }) {
  return (
    <div>
      <StepHeader
        title="Connect your accounts"
        subtitle="Sign in to the platforms you want Velora to manage. You can skip and connect later."
      />
      <div className="grid gap-2.5 sm:grid-cols-2">
        {PLATFORMS.map((p) => {
          const isConnected = connected.includes(p.id);
          return (
            <div
              key={p.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-foreground/10 bg-background/60 p-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={cn(
                    "grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br text-xs font-bold text-white shadow-sm",
                    p.gradient,
                  )}
                >
                  {p.initials}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {isConnected ? "Connected" : "Not connected"}
                  </div>
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                variant={isConnected ? "outline" : "default"}
                onClick={() => onToggle(p.id)}
                className="shrink-0"
              >
                {isConnected ? (<><Check className="h-3.5 w-3.5" /> Connected</>) : "Connect"}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StepLoading() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => Math.min(v + 1, LOADING_MESSAGES.length - 1)), 900);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex flex-col items-center py-6 text-center">
      <div className="relative mb-8 grid h-20 w-20 place-items-center">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-primary/30 border-t-primary"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        />
        <Sparkles className="h-7 w-7 text-primary" />
      </div>
      <h2 className="text-2xl font-semibold tracking-tight">Personalizing your workspace…</h2>
      <div className="mt-6 h-6">
        <AnimatePresence mode="wait">
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="text-sm text-muted-foreground"
          >
            {LOADING_MESSAGES[i]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

function StepDone({ onFinish, isPending }: { onFinish: () => void; isPending: boolean }) {
  return (
    <div className="flex flex-col items-center py-6 text-center">
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg"
      >
        <Check className="h-8 w-8" strokeWidth={3} />
      </motion.div>
      <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
        Your workspace is ready.
      </h2>
      <p className="mt-3 max-w-md text-muted-foreground">
        Everything's set up the way you like it. Let's dive in.
      </p>
      <Button size="lg" onClick={onFinish} disabled={isPending} className="mt-8 h-12 gap-2 px-8 text-base">
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : (<>Go to Dashboard <ArrowRight className="h-4 w-4" /></>)}
      </Button>
    </div>
  );
}
