import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { ArrowRight, Clock, Sparkles, Zap } from "lucide-react";
import { loadDiscovery } from "@/lib/onboarding/discovery-state";
import { generatePersonalizedSolution, type PersonalizedSolution } from "@/lib/onboarding/discovery.functions";

export const Route = createFileRoute("/get-started/solution")({
  component: Solution,
});

const CONFIDENCE_COPY: Record<PersonalizedSolution["confidence"], string> = {
  high: "Confidence: high — your answers are specific enough for us to be sure.",
  medium: "Confidence: medium — we'll sharpen this once you connect an account.",
  low: "Confidence: low — a few more details would help us tailor this better.",
};

function Solution() {
  const navigate = useNavigate();
  const generate = useServerFn(generatePersonalizedSolution);

  const mutation = useMutation<PersonalizedSolution>({
    mutationFn: async () => {
      const answers = loadDiscovery();
      return generate({ data: answers });
    },
  });

  useEffect(() => {
    // Kick off once on mount.
    if (!mutation.isPending && !mutation.data && !mutation.error) {
      mutation.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const answers = typeof window !== "undefined" ? loadDiscovery() : {};
  if (typeof window !== "undefined" && !answers.industry && !answers.businessName) {
    // No wizard data → send them back.
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="text-sm text-muted-foreground">Let's start with a few quick questions.</p>
        <Link
          to="/get-started"
          className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground"
        >
          Start <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
      {mutation.isPending || (!mutation.data && !mutation.error) ? (
        <LoadingState />
      ) : mutation.error ? (
        <ErrorState onRetry={() => mutation.mutate()} />
      ) : mutation.data ? (
        <ResultView data={mutation.data} onContinue={() => navigate({ to: "/pricing" })} />
      ) : null}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-border bg-surface-2">
          <Sparkles className="h-3.5 w-3.5 animate-pulse text-foreground/70" />
        </span>
        <span className="eyebrow">Building your plan</span>
      </div>
      <h1 className="mt-6 font-serif text-4xl leading-tight text-foreground sm:text-5xl">
        Reading your answers…
      </h1>
      <p className="mt-4 text-[15px] text-muted-foreground">
        Our strategist is matching your business to the right Velora setup. This takes about ten seconds.
      </p>
      <div className="mt-10 space-y-3">
        {[0, 1, 2].map((k) => (
          <div key={k} className="h-16 animate-pulse rounded-xl border border-border bg-surface" />
        ))}
      </div>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-8 text-center">
      <h2 className="font-serif text-2xl text-foreground">We couldn't build your plan just now.</h2>
      <p className="mt-3 text-sm text-muted-foreground">
        Something on our end. Try again — it usually works on the second try.
      </p>
      <button
        onClick={onRetry}
        className="mt-6 inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground"
      >
        Try again
      </button>
    </div>
  );
}

function ResultView({ data, onContinue }: { data: PersonalizedSolution; onContinue: () => void }) {
  return (
    <div className="animate-fade-in">
      <span className="eyebrow">Your personalized plan</span>
      <h1 className="mt-4 font-serif text-4xl leading-tight text-foreground sm:text-5xl">
        {data.headline}
      </h1>
      <p className="mt-5 text-[17px] leading-relaxed text-muted-foreground">{data.summary}</p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <StatCard icon={<Clock className="h-4 w-4" />} label="Estimated time saved" value={`~${data.estimatedTimeSavedHoursPerWeek} hrs / week`} />
        <StatCard icon={<Zap className="h-4 w-4" />} label="Ready to connect" value={`${data.recommendedIntegrations.length} integrations`} />
      </div>

      <section className="mt-12">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Recommended for you</h2>
        <div className="mt-4 grid gap-3">
          {data.recommendedFeatures.map((f) => (
            <div key={f.name} className="rounded-xl border border-border bg-surface p-5 shadow-xs">
              <div className="text-[15px] font-semibold text-foreground">{f.name}</div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.reason}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">We'll connect</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {data.recommendedIntegrations.map((i) => (
            <span key={i} className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-foreground/80">{i}</span>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-border bg-surface-2/40 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Your first three moves</h2>
        <ol className="mt-4 space-y-3">
          {data.firstThreeActions.map((a, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-surface font-mono text-xs text-foreground/70">
                {idx + 1}
              </span>
              <span className="text-[15px] leading-relaxed text-foreground">{a}</span>
            </li>
          ))}
        </ol>
      </section>

      <p className="mt-8 text-xs text-muted-foreground">{CONFIDENCE_COPY[data.confidence]}</p>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <button
          onClick={onContinue}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:opacity-90 sm:w-auto"
        >
          See pricing <ArrowRight className="h-4 w-4" />
        </button>
        <Link to="/why" className="text-sm text-muted-foreground hover:text-foreground">
          Why Velora →
        </Link>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface-2 text-foreground/70">{icon}</span>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-[15px] font-semibold text-foreground">{value}</div>
      </div>
    </div>
  );
}
