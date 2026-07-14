import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { getOnboardingSession, saveOnboardingStep } from "@/lib/onboarding/session.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/onboarding/ai-training")({
  head: () => ({ meta: [{ title: "Train the AI — ROTHME" }, { name: "robots", content: "noindex" }] }),
  component: AiTrainingStep,
});

const TONES = ["Warm","Playful","Confident","Expert","Casual","Bold"];
const STYLES = ["Short + punchy","Story-driven","Data-driven","Question-led","Conversational"];

function AiTrainingStep() {
  const navigate = useNavigate();
  const getSession = useServerFn(getOnboardingSession);
  const save = useServerFn(saveOnboardingStep);
  const { data: session } = useQuery({ queryKey: ["onboarding-session"], queryFn: () => getSession() });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [t, setT] = useState<Record<string, any>>({});
  useEffect(() => { if (session?.ai_training) setT((p) => ({ ...session.ai_training, ...p })); }, [session?.ai_training]);

  const set = (k: string, v: unknown) => {
    setT((p) => ({ ...p, [k]: v }));
    save({ data: { ai_training: { [k]: v } } }).catch(() => {});
  };

  const next = async () => {
    await save({ data: { step: "marketing-plan" } }).catch(() => {});
    navigate({ to: "/onboarding/marketing-plan" });
  };

  return (
    <OnboardingShell currentStepId="ai-training" session={session ?? null}>
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Teach ROTHME your voice.</h1>
        <p className="mt-3 text-muted-foreground">Everything the AI writes from here on will sound like you.</p>

        <div className="mt-8 space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium">Preferred tone</label>
            <div className="flex flex-wrap gap-2">
              {TONES.map((opt) => {
                const on = t.tone === opt;
                return (
                  <button key={opt} onClick={() => set("tone", opt)} className={cn("rounded-full border px-3 py-1.5 text-sm transition-all", on ? "border-primary bg-primary/10" : "border-border/60 text-muted-foreground hover:border-border")}>
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Writing style</label>
            <div className="flex flex-wrap gap-2">
              {STYLES.map((opt) => {
                const arr: string[] = Array.isArray(t.styles) ? t.styles : [];
                const on = arr.includes(opt);
                return (
                  <button key={opt} onClick={() => set("styles", on ? arr.filter((x) => x !== opt) : [...arr, opt])} className={cn("flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all", on ? "border-primary bg-primary/10" : "border-border/60 text-muted-foreground hover:border-border")}>
                    {on && <Check className="h-3 w-3 text-primary" />} {opt}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Keywords you want to own</label>
            <Textarea rows={2} value={t.keywords ?? ""} onChange={(e) => set("keywords", e.target.value)} placeholder="e.g. sustainable coffee, small batch, ethically sourced" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Anything ROTHME should never say?</label>
            <Textarea rows={2} value={t.avoid ?? ""} onChange={(e) => set("avoid", e.target.value)} placeholder="Phrases, claims, or topics to steer clear of." />
          </div>
        </div>

        <div className="mt-10 flex justify-end">
          <Button size="lg" onClick={next} className="gap-2">Generate my plan<ArrowRight className="h-4 w-4" /></Button>
        </div>
      </div>
    </OnboardingShell>
  );
}
