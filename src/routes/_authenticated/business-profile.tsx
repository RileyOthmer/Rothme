import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Sparkles, Target, TrendingUp, Users, Wallet, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  generateBusinessProfile,
  getBusinessProfile,
} from "@/lib/onboarding/business-profile.functions";

export const Route = createFileRoute("/_authenticated/business-profile")({
  head: () => ({
    meta: [
      { title: "AI Business Profile — ROTHME" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BusinessProfilePage,
});

function BusinessProfilePage() {
  const getProfile = useServerFn(getBusinessProfile);
  const gen = useServerFn(generateBusinessProfile);

  const { data, refetch, isLoading } = useQuery({
    queryKey: ["business-profile"],
    queryFn: () => getProfile(),
  });

  const regen = useMutation({
    mutationFn: () => gen(),
    onSuccess: () => refetch(),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <Sparkles className="mx-auto mb-4 h-8 w-8 text-primary" />
        <h1 className="text-2xl font-semibold">Your AI Business Profile isn't built yet.</h1>
        <p className="mt-2 text-muted-foreground">
          Finish onboarding, or generate one now from your answers so far.
        </p>
        <Button className="mt-6" onClick={() => regen.mutate()} disabled={regen.isPending}>
          {regen.isPending ? "Generating…" : "Generate profile"}
        </Button>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = data as any;
  const icp = p.ideal_customer_profile ?? {};
  const swot = p.swot ?? {};
  const budget = p.recommended_monthly_budget ?? {};
  const growth = p.growth_potential ?? {};
  const channels: Array<{ channel: string; why: string; priority: string }> =
    p.recommended_channels ?? [];
  const opps: Array<{ title: string; impact: string; effort: string; description: string }> =
    p.top_opportunities ?? [];

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs">
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="text-muted-foreground">AI Business Profile</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Your business, in plain English.</h1>
          <p className="mt-3 max-w-3xl text-muted-foreground">{p.business_summary}</p>
        </div>
        <Button variant="outline" onClick={() => regen.mutate()} disabled={regen.isPending}>
          {regen.isPending ? "Refreshing…" : "Regenerate"}
        </Button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <ScoreCard label="Marketing strength" value={`${p.strength_score}`} tone="good" />
        <ScoreCard label="Weakness / gaps" value={`${p.weakness_score}`} tone="warn" />
        <ScoreCard label="Growth potential" value={labelize(growth.band)} sub={growth.twelveMonthLabel} />
      </div>

      <Section icon={<Users className="h-4 w-4" />} title="Ideal customer profile">
        <p className="text-sm text-muted-foreground">{icp.who}</p>
        <p className="mt-1 text-sm text-muted-foreground">{icp.demographics}</p>
        <TwoCol
          left={{ title: "Pain points", items: icp.painPoints ?? [] }}
          right={{ title: "Buying triggers", items: icp.buyingTriggers ?? [] }}
        />
      </Section>

      <Section icon={<Target className="h-4 w-4" />} title="Recommended marketing channels">
        <div className="grid gap-3 sm:grid-cols-2">
          {channels.map((c) => (
            <div key={c.channel} className="rounded-2xl border border-border/50 bg-card/50 p-4">
              <div className="flex items-center justify-between">
                <div className="font-medium">{c.channel}</div>
                <span className="rounded-full border border-border/50 px-2 py-0.5 text-[10px] uppercase text-muted-foreground">
                  {c.priority}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{c.why}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section icon={<Zap className="h-4 w-4" />} title="Top 10 opportunities">
        <ol className="space-y-2">
          {opps.map((o, i) => (
            <li key={i} className="rounded-xl border border-border/40 bg-card/40 p-3">
              <div className="flex items-center justify-between">
                <div className="font-medium">
                  {i + 1}. {o.title}
                </div>
                <div className="flex gap-1 text-[10px] uppercase text-muted-foreground">
                  <span className="rounded-full border border-border/50 px-2 py-0.5">Impact: {o.impact}</span>
                  <span className="rounded-full border border-border/50 px-2 py-0.5">Effort: {o.effort}</span>
                </div>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{o.description}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section icon={<TrendingUp className="h-4 w-4" />} title="SWOT analysis">
        <div className="grid gap-3 sm:grid-cols-2">
          <SwotBox title="Strengths" items={swot.strengths ?? []} />
          <SwotBox title="Weaknesses" items={swot.weaknesses ?? []} />
          <SwotBox title="Opportunities" items={swot.opportunities ?? []} />
          <SwotBox title="Threats" items={swot.threats ?? []} />
        </div>
      </Section>

      <Section icon={<Wallet className="h-4 w-4" />} title="Recommended monthly budget">
        <div className="text-2xl font-semibold">
          {budget.currency ?? "USD"} {formatMoney(budget.low)} – {formatMoney(budget.high)} / mo
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{budget.rationale}</p>
      </Section>

      <div className="mt-10 rounded-xl border border-border/40 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
        Confidence: <span className="font-medium text-foreground">{p.confidence}</span>
        {" · "}Generated {new Date(p.generated_at).toLocaleString()}
      </div>
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-10">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}
        {title}
      </h2>
      {children}
    </div>
  );
}

function ScoreCard({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "good" | "warn";
}) {
  const border =
    tone === "good"
      ? "border-emerald-500/30 bg-emerald-500/5"
      : tone === "warn"
        ? "border-amber-500/30 bg-amber-500/5"
        : "border-primary/40 bg-gradient-to-br from-primary/10 to-transparent";
  return (
    <div className={`rounded-2xl border p-4 ${border}`}>
      <div className="mb-2 text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold tracking-tight">{value}</div>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

function SwotBox({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card/50 p-4">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </div>
      <ul className="space-y-1 text-sm">
        {items.map((s, i) => (
          <li key={i} className="text-foreground/90">
            • {s}
          </li>
        ))}
      </ul>
    </div>
  );
}

function TwoCol({
  left,
  right,
}: {
  left: { title: string; items: string[] };
  right: { title: string; items: string[] };
}) {
  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      {[left, right].map((col) => (
        <div key={col.title} className="rounded-2xl border border-border/50 bg-card/50 p-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {col.title}
          </div>
          <ul className="space-y-1 text-sm">
            {col.items.map((s, i) => (
              <li key={i}>• {s}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function labelize(band?: string) {
  if (!band) return "—";
  return { low: "Steady", medium: "Solid", high: "High", exceptional: "Exceptional" }[band] ?? band;
}

function formatMoney(n: unknown) {
  const v = typeof n === "number" ? n : Number(n ?? 0);
  return v.toLocaleString();
}
