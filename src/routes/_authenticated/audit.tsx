import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Toaster, toast } from "sonner";
import { Loader2, RefreshCw, Sparkles, AlertTriangle, Zap, ArrowRight } from "lucide-react";

import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import {
  runAiAudit,
  getAiAudit,
  AUDIT_CATEGORIES,
  type AuditCategory,
  type AuditRecommendation,
} from "@/lib/audit/ai-audit.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/audit")({
  head: () => ({
    meta: [
      { title: "AI Audit — ROTHME" },
      { name: "description", content: "Your AI-powered growth audit with 100+ prioritized recommendations." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuditPage,
});

const CATEGORY_LABEL: Record<AuditCategory, string> = {
  website: "Website",
  seo: "SEO",
  speed: "Speed",
  mobile: "Mobile Experience",
  social: "Social Profiles",
  business_info: "Business Information",
};

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 } as const;
type Priority = keyof typeof PRIORITY_ORDER;
type Filter = "all" | Priority | AuditCategory;

function AuditPage() {
  const qc = useQueryClient();
  const getFn = useServerFn(getAiAudit);
  const runFn = useServerFn(runAiAudit);
  const [filter, setFilter] = useState<Filter>("all");

  const { data: audit, isLoading } = useQuery({
    queryKey: ["ai-audit"],
    queryFn: () => getFn(),
  });

  const mutation = useMutation({
    mutationFn: () => runFn(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ai-audit"] });
      toast.success("Audit complete.");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Audit failed."),
  });

  // Auto-trigger the audit on first visit if nothing is saved yet.
  useEffect(() => {
    if (!isLoading && !audit && !mutation.isPending) mutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, audit]);

  const recs = (audit?.recommendations ?? []) as unknown as AuditRecommendation[];
  const catSummaries = (audit?.category_summaries ?? {}) as Record<string, string>;

  const counts = useMemo(() => {
    const c = { high: 0, medium: 0, low: 0 };
    for (const r of recs) c[r.priority]++;
    return c;
  }, [recs]);

  const filtered = useMemo(() => {
    const list = recs.filter((r) => {
      if (filter === "all") return true;
      if (filter === "high" || filter === "medium" || filter === "low") return r.priority === filter;
      return r.category === filter;
    });
    return [...list].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
  }, [recs, filter]);

  const running = mutation.isPending || (isLoading && !audit);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border/60 bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3 w-3" /> AI Audit
            </div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Your growth audit
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              We analyzed your website, SEO, speed, mobile experience, social profiles, and
              business information. Here's what to fix and in what order.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => mutation.mutate()}
            disabled={running}
            className="gap-2"
          >
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {audit ? "Re-run audit" : "Run audit"}
          </Button>
        </header>

        {running && !audit ? (
          <RunningState />
        ) : audit ? (
          <>
            <OverallCard
              score={audit.overall_score}
              summary={audit.summary}
              confidence={audit.confidence}
              counts={counts}
            />

            <section className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
              {AUDIT_CATEGORIES.map((cat) => (
                <ScoreTile
                  key={cat}
                  label={CATEGORY_LABEL[cat]}
                  score={
                    (
                      audit as unknown as Record<string, number>
                    )[`${cat}_score`] ?? 0
                  }
                  summary={catSummaries[cat] ?? ""}
                />
              ))}
            </section>

            <section className="mt-10">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">
                  {recs.length} recommendations
                </h2>
                <div className="text-xs text-muted-foreground">
                  <span className="text-rose-500">● {counts.high} high</span>{" · "}
                  <span className="text-amber-500">● {counts.medium} medium</span>{" · "}
                  <span className="text-emerald-500">● {counts.low} low</span>
                </div>
              </div>

              <FilterBar current={filter} onChange={setFilter} counts={counts} />

              <ul className="mt-4 space-y-3">
                {filtered.map((r, i) => (
                  <RecCard key={`${r.category}-${i}-${r.title}`} rec={r} />
                ))}
                {filtered.length === 0 && (
                  <li className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-sm text-muted-foreground">
                    Nothing matches that filter.
                  </li>
                )}
              </ul>
            </section>
          </>
        ) : (
          <div className="rounded-2xl border border-border bg-surface p-8 text-center text-sm text-muted-foreground">
            No audit yet.
          </div>
        )}
      </main>
      <Toaster theme="light" position="bottom-right" />
    </div>
  );
}

function RunningState() {
  return (
    <div className="rounded-3xl border border-border bg-gradient-to-br from-surface to-surface-2 p-10 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
      <h2 className="mt-4 text-lg font-semibold">Running your AI audit…</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Analyzing your website, SEO, speed, mobile experience, social profiles, and business
        information. This takes about 30 seconds.
      </p>
    </div>
  );
}

function OverallCard({
  score,
  summary,
  confidence,
  counts,
}: {
  score: number;
  summary: string;
  confidence: string;
  counts: { high: number; medium: number; low: number };
}) {
  return (
    <div className="rounded-3xl border border-border bg-gradient-to-br from-primary/5 via-surface to-surface p-6 sm:p-8">
      <div className="flex flex-wrap items-start gap-6">
        <div className="grid h-24 w-24 shrink-0 place-items-center rounded-2xl bg-primary/10">
          <div className="text-3xl font-semibold tabular-nums">{score}</div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background px-2 py-0.5">
              Overall business health
            </span>
            <span className="capitalize">Confidence: {confidence}</span>
          </div>
          <p className="mt-2 text-base leading-relaxed">{summary}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <Pill tone="rose" icon={<AlertTriangle className="h-3 w-3" />}>
              {counts.high} high priority
            </Pill>
            <Pill tone="amber" icon={<Zap className="h-3 w-3" />}>{counts.medium} medium</Pill>
            <Pill tone="emerald">{counts.low} low</Pill>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreTile({ label, score, summary }: { label: string; score: number; summary: string }) {
  const tone =
    score >= 70 ? "emerald" : score >= 45 ? "amber" : "rose";
  const bar = tone === "emerald" ? "bg-emerald-500" : tone === "amber" ? "bg-amber-500" : "bg-rose-500";
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium text-muted-foreground">{label}</div>
        <div className="text-lg font-semibold tabular-nums">{score}</div>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
        <div className={cn("h-full", bar)} style={{ width: `${Math.max(2, Math.min(100, score))}%` }} />
      </div>
      {summary && <p className="mt-2 line-clamp-3 text-xs text-muted-foreground">{summary}</p>}
    </div>
  );
}

function FilterBar({
  current,
  onChange,
  counts,
}: {
  current: Filter;
  onChange: (f: Filter) => void;
  counts: { high: number; medium: number; low: number };
}) {
  const chips: { id: Filter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "high", label: `High (${counts.high})` },
    { id: "medium", label: `Medium (${counts.medium})` },
    { id: "low", label: `Low (${counts.low})` },
    ...AUDIT_CATEGORIES.map((c) => ({ id: c as Filter, label: CATEGORY_LABEL[c] })),
  ];
  return (
    <div className="-mx-1 flex snap-x snap-mandatory gap-1 overflow-x-auto px-1 pb-1">
      {chips.map((c) => {
        const active = current === c.id;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onChange(c.id)}
            className={cn(
              "snap-start whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              active
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-surface text-muted-foreground hover:text-foreground",
            )}
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );
}

function RecCard({ rec }: { rec: AuditRecommendation }) {
  const tone =
    rec.priority === "high" ? "rose" : rec.priority === "medium" ? "amber" : "emerald";
  return (
    <li className="rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-border/80">
      <div className="flex items-start gap-3">
        <PriorityDot tone={tone} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold">{rec.title}</h3>
            <span className="rounded-full border border-border/60 bg-background px-2 py-0.5 text-[10px] text-muted-foreground">
              {CATEGORY_LABEL[rec.category]}
            </span>
            <span className="text-[10px] text-muted-foreground">
              Impact {rec.impact} · Effort {rec.effort}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{rec.why}</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <div className="rounded-lg bg-surface-2 p-2.5 text-xs">
              <div className="mb-0.5 font-medium">Next step</div>
              <div className="flex items-start gap-1.5 text-muted-foreground">
                <ArrowRight className="mt-0.5 h-3 w-3 shrink-0" /> {rec.next_step}
              </div>
            </div>
            <div className="rounded-lg bg-surface-2 p-2.5 text-xs">
              <div className="mb-0.5 font-medium">Estimated impact</div>
              <div className="text-muted-foreground">{rec.estimated_lift}</div>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

function Pill({
  tone,
  icon,
  children,
}: {
  tone: "rose" | "amber" | "emerald";
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  const cls =
    tone === "rose"
      ? "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
      : tone === "amber"
        ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
        : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-medium", cls)}>
      {icon}
      {children}
    </span>
  );
}

function PriorityDot({ tone }: { tone: "rose" | "amber" | "emerald" }) {
  const cls =
    tone === "rose" ? "bg-rose-500" : tone === "amber" ? "bg-amber-500" : "bg-emerald-500";
  return <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", cls)} aria-hidden />;
}
