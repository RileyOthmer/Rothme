import { useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Activity,
  Globe,
  Loader2,
  Megaphone,
  RefreshCcw,
  Search,
  Sparkles,
  Target,
  Users,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  generateDashboardInsights,
  getDashboardInsights,
} from "@/lib/onboarding/dashboard-insights.functions";
import { cn } from "@/lib/utils";

type CardDef = {
  key: string;
  title: string;
  icon: React.ReactNode;
  score: number;
  summary: string;
  accent?: boolean;
};

export function DashboardInsightsSection() {
  const getInsights = useServerFn(getDashboardInsights);
  const gen = useServerFn(generateDashboardInsights);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["dashboard-insights"],
    queryFn: () => getInsights(),
  });

  const regen = useMutation({
    mutationFn: () => gen(),
    onSuccess: () => refetch(),
  });

  // Auto-generate on first load if we have nothing yet.
  useEffect(() => {
    if (!isLoading && !data && regen.status === "idle") {
      regen.mutate();
    }
  }, [isLoading, data, regen]);

  const loading = isLoading || (!data && regen.isPending);

  if (loading) {
    return (
      <section className="space-y-4">
        <SectionHeader loading />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-2xl border border-border/40 bg-card/40"
            />
          ))}
        </div>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="rounded-2xl border border-border/40 bg-card/40 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          We couldn't build your dashboard scores yet.
        </p>
        <Button className="mt-3" onClick={() => regen.mutate()} disabled={regen.isPending}>
          Try again
        </Button>
      </section>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = data as any;

  const cards: CardDef[] = [
    {
      key: "overall",
      title: "Overall business health",
      icon: <Activity className="h-4 w-4" />,
      score: d.overall_health_score,
      summary: d.overall_health_summary,
      accent: true,
    },
    {
      key: "marketing",
      title: "Marketing score",
      icon: <Megaphone className="h-4 w-4" />,
      score: d.marketing_score,
      summary: d.marketing_summary,
    },
    {
      key: "seo",
      title: "SEO score",
      icon: <Search className="h-4 w-4" />,
      score: d.seo_score,
      summary: d.seo_summary,
    },
    {
      key: "website",
      title: "Website score",
      icon: <Globe className="h-4 w-4" />,
      score: d.website_score,
      summary: d.website_summary,
    },
    {
      key: "social",
      title: "Social presence",
      icon: <Users className="h-4 w-4" />,
      score: d.social_presence_score,
      summary: d.social_presence_summary,
    },
    {
      key: "leads",
      title: "Lead generation",
      icon: <Target className="h-4 w-4" />,
      score: d.lead_generation_score,
      summary: d.lead_generation_summary,
    },
    {
      key: "paid",
      title: "Paid advertising",
      icon: <Wallet className="h-4 w-4" />,
      score: d.paid_advertising_score,
      summary: d.paid_advertising_summary,
    },
  ];

  const recs: Array<{
    title: string;
    category: string;
    impact: string;
    effort: string;
    reason: string;
    nextStep: string;
  }> = d.recommendations ?? [];

  return (
    <section className="space-y-6">
      <SectionHeader
        confidence={d.confidence}
        generatedAt={d.generated_at}
        onRefresh={() => regen.mutate()}
        refreshing={regen.isPending}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <ScoreCard {...c} />
        ))}
      </div>

      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          Personalized recommendations
        </h3>
        <div className="space-y-2">
          {recs.map((r, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border/50 bg-card/50 p-4 transition-all hover:border-primary/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium">{r.title}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{r.reason}</p>
                  <p className="mt-2 text-sm">
                    <span className="text-muted-foreground">Next step: </span>
                    <span className="text-foreground">{r.nextStep}</span>
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 text-[10px] uppercase text-muted-foreground">
                  <span className="rounded-full border border-border/50 px-2 py-0.5">
                    {r.category}
                  </span>
                  <span className="rounded-full border border-border/50 px-2 py-0.5">
                    Impact: {r.impact}
                  </span>
                  <span className="rounded-full border border-border/50 px-2 py-0.5">
                    Effort: {r.effort}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionHeader({
  loading,
  confidence,
  generatedAt,
  onRefresh,
  refreshing,
}: {
  loading?: boolean;
  confidence?: string;
  generatedAt?: string;
  onRefresh?: () => void;
  refreshing?: boolean;
}) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs">
          <Sparkles className="h-3 w-3 text-primary" />
          <span className="text-muted-foreground">AI scoring</span>
        </div>
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
          {loading ? "Scoring your business…" : "How your business is doing today"}
        </h2>
        {!loading && generatedAt && (
          <p className="mt-1 text-xs text-muted-foreground">
            Confidence: <span className="text-foreground">{confidence}</span> · updated{" "}
            {new Date(generatedAt).toLocaleString()}
          </p>
        )}
      </div>
      {onRefresh && (
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={refreshing}>
          {refreshing ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <RefreshCcw className="h-3 w-3" />
          )}
          <span className="ml-2">Refresh</span>
        </Button>
      )}
    </div>
  );
}

function ScoreCard({ title, icon, score, summary, accent }: CardDef) {
  const tone = scoreTone(score);
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
        {title}
      </div>
      <div className="flex items-baseline gap-2">
        <div className="text-3xl font-semibold tracking-tight">{score}</div>
        <div className="text-xs text-muted-foreground">/ 100</div>
        <div className={cn("ml-auto text-[10px] uppercase", tone.text)}>{tone.label}</div>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-border/40">
        <div
          className={cn("h-full rounded-full", tone.bar)}
          style={{ width: `${Math.max(2, Math.min(100, score))}%` }}
        />
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{summary}</p>
    </div>
  );
}

function scoreTone(score: number) {
  if (score >= 75) return { label: "Strong", text: "text-emerald-500", bar: "bg-emerald-500" };
  if (score >= 55) return { label: "Solid", text: "text-primary", bar: "bg-primary" };
  if (score >= 35) return { label: "Needs work", text: "text-amber-500", bar: "bg-amber-500" };
  return { label: "Weak", text: "text-rose-500", bar: "bg-rose-500" };
}
