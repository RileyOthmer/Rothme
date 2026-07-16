import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import {
  BUDGETS,
  BUSINESS_SIZES,
  EXPERIENCE,
  GOALS,
  INDUSTRIES,
  PAIN_POINTS,
  PLATFORMS,
  TOOLS,
  loadDiscovery,
  saveDiscovery,
  type DiscoveryAnswers,
} from "@/lib/onboarding/discovery-state";

export const Route = createFileRoute("/get-started/")({
  component: Wizard,
});

type StepKind = "text" | "single" | "multi";
type Step = {
  key: keyof DiscoveryAnswers;
  kind: StepKind;
  title: string;
  hint?: string;
  options?: readonly string[];
  placeholder?: string;
  optional?: boolean;
};

const STEPS: Step[] = [
  { key: "businessName", kind: "text", title: "What's your business called?", placeholder: "e.g. Rosie's Coffee", hint: "We'll use this to personalize everything." },
  { key: "industry", kind: "single", title: "What industry are you in?", options: INDUSTRIES },
  { key: "businessSize", kind: "single", title: "How big is your business?", options: BUSINESS_SIZES },
  { key: "country", kind: "text", title: "Where are you based?", placeholder: "Country" },
  { key: "timezone", kind: "text", title: "What timezone do you work in?", placeholder: "e.g. Pacific Time (PT)", optional: true },
  { key: "experience", kind: "single", title: "How comfortable are you with marketing?", hint: "There's no wrong answer — ROTHME adapts.", options: EXPERIENCE },
  { key: "primaryGoals", kind: "multi", title: "What matters most right now?", hint: "Pick everything that fits.", options: GOALS },
  { key: "teamSize", kind: "single", title: "How many people help with marketing?", options: ["Just me", "2–3", "4–10", "11+"] as const },
  { key: "currentTools", kind: "multi", title: "What are you using today?", hint: "So we know what to connect.", options: TOOLS },
  { key: "budget", kind: "single", title: "Roughly, what's your monthly marketing budget?", options: BUDGETS },
  { key: "painPoints", kind: "multi", title: "What's frustrating you the most?", options: PAIN_POINTS },
  { key: "preferredPlatforms", kind: "multi", title: "Which platforms do you care about?", options: PLATFORMS },
];

function Wizard() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<DiscoveryAnswers>({});
  const [i, setI] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setAnswers(loadDiscovery());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveDiscovery(answers);
  }, [answers, hydrated]);

  const step = STEPS[i];
  const progress = ((i + 1) / STEPS.length) * 100;
  const value = answers[step.key];
  const canNext =
    step.optional ||
    (step.kind === "multi"
      ? Array.isArray(value) && value.length > 0
      : typeof value === "string" && value.trim().length > 0);

  function set<K extends keyof DiscoveryAnswers>(k: K, v: DiscoveryAnswers[K]) {
    setAnswers((a) => ({ ...a, [k]: v }));
  }

  function next() {
    if (i < STEPS.length - 1) setI(i + 1);
    else navigate({ to: "/get-started/solution" });
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-2xl flex-col px-4 py-8 sm:px-6 sm:py-14">
      {/* Progress */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Step {i + 1} of {STEPS.length}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full bg-foreground transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step */}
      <div key={i} className="mt-12 flex-1 animate-fade-in">
        <h1 className="font-serif text-3xl leading-tight text-foreground sm:text-4xl">
          {step.title}
        </h1>
        {step.hint ? (
          <p className="mt-3 text-[15px] text-muted-foreground">{step.hint}</p>
        ) : null}

        <div className="mt-8">
          {step.kind === "text" ? (
            <input
              autoFocus
              value={(value as string) ?? ""}
              onChange={(e) => set(step.key, e.target.value as DiscoveryAnswers[typeof step.key])}
              onKeyDown={(e) => { if (e.key === "Enter" && canNext) next(); }}
              placeholder={step.placeholder}
              className="w-full rounded-lg border border-input bg-surface px-4 py-3 text-lg text-foreground shadow-xs outline-none transition-all focus:border-foreground/30 focus:ring-2 focus:ring-ring"
            />
          ) : step.kind === "single" ? (
            <div className="grid gap-2">
              {step.options!.map((opt) => {
                const active = value === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => { set(step.key, opt as DiscoveryAnswers[typeof step.key]); setTimeout(next, 150); }}
                    className={
                      "group flex items-center justify-between rounded-lg border bg-surface px-4 py-3 text-left text-[15px] transition-all " +
                      (active
                        ? "border-foreground/40 ring-2 ring-ring"
                        : "border-border hover:border-foreground/20 hover:bg-surface-2")
                    }
                  >
                    <span className="text-foreground">{opt}</span>
                    {active ? <Check className="h-4 w-4 text-foreground" /> : null}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {step.options!.map((opt) => {
                const list = (value as string[]) ?? [];
                const active = list.includes(opt);
                return (
                  <button
                    key={opt}
                    onClick={() => {
                      const next = active ? list.filter((x) => x !== opt) : [...list, opt];
                      set(step.key, next as DiscoveryAnswers[typeof step.key]);
                    }}
                    className={
                      "flex items-center justify-between rounded-lg border bg-surface px-4 py-3 text-left text-[14px] transition-all " +
                      (active
                        ? "border-foreground/40 ring-1 ring-ring"
                        : "border-border hover:border-foreground/20 hover:bg-surface-2")
                    }
                  >
                    <span className="text-foreground">{opt}</span>
                    {active ? <Check className="h-4 w-4 text-foreground" /> : <span className="h-4 w-4 rounded border border-border" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <div className="mt-10 flex items-center justify-between">
        <button
          onClick={() => setI(Math.max(0, i - 1))}
          disabled={i === 0}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="flex items-center gap-3">
          {step.optional ? (
            <button
              onClick={next}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Skip
            </button>
          ) : null}
          <button
            onClick={next}
            disabled={!canNext}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {i === STEPS.length - 1 ? "See my plan" : "Continue"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
