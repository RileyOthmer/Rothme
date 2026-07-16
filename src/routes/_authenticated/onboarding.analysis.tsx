import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";
import { ArrowRight, Gauge, Sparkles, TrendingUp, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OnboardingShell, AiThinkingPanel } from "@/components/onboarding/OnboardingShell";
import {
  analyzeBusiness,
  getOnboardingSession,
  saveOnboardingStep,
  type OnboardingAnalysis,
} from "@/lib/onboarding/session.functions";
import { generateBusinessProfile } from "@/lib/onboarding/business-profile.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/onboarding/analysis")({
  head: () => ({ meta: [{ title: "Business analysis — ROTHME" }, { name: "robots", content: "noindex" }] }),
  component: AnalysisStep,
});

function AnalysisStep() {
  const navigate = useNavigate();
  const getSession = useServerFn(getOnboardingSession);
  const analyze = useServerFn(analyzeBusiness);
  const save = useServerFn(saveOnboardingStep);

  const { data: session, refetch } = useQuery({
    queryKey: ["onboarding-session"],
    queryFn: () => getSession(),
  });

  const analyzeMut = useMutation({
    mutationFn: () => analyze(),
    onSuccess: () => refetch(),
  });

  // Auto-run analysis if we don't have one yet.
  useEffect(() => {
    if (session && !session.analysis && analyzeMut.status === "idle") {
      analyzeMut.mutate();
    }
  }, [session, analyzeMut]);

  const analysis = session?.analysis;
  const loading = analyzeMut.isPending || (!analysis && !!session);

  const next = async () => {
    await save({ data: { step: "workspace-build" } }).catch(() => {});
    navigate({ to: "/onboarding/workspace-build" });
  };

  return (
    <OnboardingShell
      currentStepId="analysis"
      session={session ?? null}
      aiPanel={
        loading ? (
          <AiThinkingPanel
            lines={[
              "Reading your answers…",
              "Scoring your marketing setup…",
              "Estimating opportunity…",
              "Matching the right features…",
            ]}
          />
        ) : undefined
      }
    >
      <div className="mx-auto max-w-3xl">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs">
          <Sparkles className="h-3 w-3 text-primary" />
          <span className="text-muted-foreground">Live analysis</span>
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          {loading ? "ROTHME is analyzing your business…" : analysis?.headline}
        </h1>
        {analysis && (
          <p className="mt-3 text-lg text-muted-foreground">{analysis.summary}</p>
        )}

        {loading && !analysis && (
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl border border-border/40 bg-card/40" />
            ))}
          </div>
        )}

        {analysis && (
          <>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <ScoreCard
                icon={<Gauge className="h-4 w-4" />}
                label="Business score"
                value={`${analysis.businessScore}`}
                accent
                sub={maturityLabel(analysis.marketingMaturity)}
              />
              <ScoreCard
                icon={<TrendingUp className="h-4 w-4" />}
                label="Growth opportunity"
                value={opportunityLabel(analysis.growthOpportunity)}
              />
              <ScoreCard
                icon={<Clock className="h-4 w-4" />}
                label="Time saved / month"
                value={`~${analysis.timeSavedHoursPerMonth}h`}
              />
              <ScoreCard
                icon={<DollarSign className="h-4 w-4" />}
                label="Revenue opportunity"
                value={analysis.revenueOpportunityLabel}
                small
              />
            </div>

            <div className="mt-10">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Recommended for you
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {analysis.recommendedFeatures.map((f) => (
                  <div
                    key={f.name}
                    className="group rounded-2xl border border-border/50 bg-card/50 p-4 backdrop-blur-xl transition-all hover:border-primary/40 hover:bg-card/70"
                  >
                    <div className="mb-1 font-medium">{f.name}</div>
                    <p className="text-sm leading-relaxed text-muted-foreground">{f.reason}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-border/40 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              Confidence: <span className="font-medium text-foreground">{analysis.confidence}</span>
              {" · "}
              {analysis.confidence === "low"
                ? "Some answers were sparse — you'll refine these as you go."
                : "Based on what you told us so far."}
            </div>

            <div className="mt-10 flex justify-end">
              <Button size="lg" onClick={next} className="gap-2">
                Build my workspace
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </OnboardingShell>
  );
}

function ScoreCard({
  icon,
  label,
  value,
  sub,
  accent,
  small,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
  small?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4 backdrop-blur-xl transition-all",
        accent
          ? "border-primary/40 bg-gradient-to-br from-primary/10 to-transparent"
          : "border-border/50 bg-card/50",
      )}
    >
      <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className={cn("font-semibold tracking-tight", small ? "text-sm leading-snug" : "text-2xl")}>
        {value}
      </div>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

function maturityLabel(m: OnboardingAnalysis["marketingMaturity"]) {
  return {
    beginner: "Just getting started",
    developing: "Finding your groove",
    established: "Established program",
    advanced: "Advanced",
  }[m];
}
function opportunityLabel(o: OnboardingAnalysis["growthOpportunity"]) {
  return { low: "Steady", medium: "Solid", high: "High", exceptional: "Exceptional" }[o];
}
