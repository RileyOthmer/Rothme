import { useMemo, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  Megaphone,
  Search,
  Mail,
  Share2,
  Globe,
  Users,
  Wallet,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { HealthScore, PillarBand, PillarId, PillarScore, PillarTrend } from "./types";
import { BAND_LABEL } from "./types";

const PILLAR_ICON: Record<PillarId, React.ComponentType<{ className?: string }>> = {
  advertising: Megaphone,
  seo: Search,
  email: Mail,
  social: Share2,
  website: Globe,
  retention: Users,
  revenue: Wallet,
};

const BAND_TONE: Record<PillarBand, { text: string; dot: string; ring: string }> = {
  strong: {
    text: "text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
    ring: "ring-emerald-500/20",
  },
  steady: {
    text: "text-primary",
    dot: "bg-primary",
    ring: "ring-primary/20",
  },
  shaky: {
    text: "text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
    ring: "ring-amber-500/20",
  },
  weak: {
    text: "text-destructive",
    dot: "bg-destructive",
    ring: "ring-destructive/20",
  },
  no_data: {
    text: "text-muted-foreground",
    dot: "bg-muted-foreground/40",
    ring: "ring-border",
  },
};

function TrendIcon({ trend, className }: { trend: PillarTrend; className?: string }) {
  if (trend === "up") return <TrendingUp className={className} />;
  if (trend === "down") return <TrendingDown className={className} />;
  if (trend === "flat") return <Minus className={className} />;
  return null;
}

function TrendTone(trend: PillarTrend): string {
  if (trend === "up") return "text-emerald-600 dark:text-emerald-400";
  if (trend === "down") return "text-destructive";
  return "text-muted-foreground";
}

function freshnessLabel(hours: number): string | null {
  if (hours < 24) return null;
  if (hours < 48) return "Data is ~1 day old";
  return `Data is ~${Math.round(hours / 24)} days old`;
}

/** Circular gauge — plain, calm, no gradients. */
function ScoreDial({ score, band }: { score: number | null; band: PillarBand }) {
  const tone = BAND_TONE[band];
  const pct = score === null ? 0 : Math.max(0, Math.min(100, score));
  const size = 168;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          className="fill-none stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className={`fill-none transition-all duration-700 ${tone.text}`}
          style={{ stroke: "currentColor" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {score === null ? (
          <span className="text-xs text-muted-foreground">Not enough data</span>
        ) : (
          <>
            <span className="text-4xl font-semibold tracking-tight tabular-nums text-foreground">
              {score}
            </span>
            <span className="text-xs text-muted-foreground">out of 100</span>
          </>
        )}
      </div>
    </div>
  );
}

function PillarRow({ pillar }: { pillar: PillarScore }) {
  const [open, setOpen] = useState(false);
  const Icon = PILLAR_ICON[pillar.id];
  const tone = BAND_TONE[pillar.band];
  const stale = freshnessLabel(pillar.dataFreshnessHours);
  const hasData = pillar.score !== null;

  return (
    <div className="rounded-xl border border-border bg-card transition-shadow hover:shadow-sm">
      <div className="flex items-center gap-4 p-4 sm:p-5">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted ${tone.text}`}>
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <h3 className="text-sm font-semibold text-foreground">{pillar.label}</h3>
            <span className={`text-xs ${tone.text}`}>· {BAND_LABEL[pillar.band]}</span>
          </div>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">{pillar.status}</p>
        </div>

        <div className="hidden text-right sm:block">
          {hasData ? (
            <div className="tabular-nums text-2xl font-semibold text-foreground">
              {pillar.score}
              <span className="ml-0.5 text-xs font-normal text-muted-foreground">/100</span>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">—</div>
          )}
          {pillar.trend !== "unknown" && (
            <div className={`mt-0.5 inline-flex items-center gap-1 text-xs ${TrendTone(pillar.trend)}`}>
              <TrendIcon trend={pillar.trend} className="h-3.5 w-3.5" />
              <span>{pillar.trendText}</span>
            </div>
          )}
        </div>
      </div>

      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <button className="flex w-full items-center justify-between gap-2 border-t border-border/60 px-4 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground sm:px-5">
            <span>{open ? "Hide the details" : "Explain this score & what to do"}</span>
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-4 border-t border-border/60 p-4 sm:p-5">
            {stale && (
              <div className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-3 w-3" />
                {stale}
              </div>
            )}

            <Detail label="Why this score">{pillar.explanation}</Detail>
            <Detail label="Biggest opportunity">{pillar.opportunity}</Detail>

            <div className="rounded-lg border border-border/60 bg-muted/40 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Action plan
              </p>
              <p className="mt-1 text-sm text-foreground">{pillar.actionPlan}</p>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm leading-relaxed text-foreground/90">{children}</p>
    </div>
  );
}

export type HealthScoreCardProps = {
  score: HealthScore;
};

export function HealthScoreCard({ score }: HealthScoreCardProps) {
  const tone = BAND_TONE[score.overallBand];
  const withData = useMemo(() => score.pillars.filter((p) => p.score !== null).length, [score]);

  return (
    <section aria-labelledby="health-heading" className="space-y-5">
      {/* Overall */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
          <ScoreDial score={score.overall} band={score.overallBand} />

          <div className="flex-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Marketing Health Score
              </span>
            </div>
            <h2 id="health-heading" className={`mt-2 text-2xl font-semibold ${tone.text}`}>
              {BAND_LABEL[score.overallBand]}
            </h2>
            {score.overallTrend !== "unknown" && (
              <div
                className={`mt-1 inline-flex items-center gap-1 text-sm ${TrendTone(score.overallTrend)}`}
              >
                <TrendIcon trend={score.overallTrend} className="h-4 w-4" />
                <span>{score.overallTrendText}</span>
              </div>
            )}
            <p className="mt-3 text-sm leading-relaxed text-foreground/90">{score.summary}</p>
            <p className="mt-3 text-xs text-muted-foreground">
              Based on {withData} of {score.pillars.length} areas · Updates automatically as new data arrives.
            </p>
          </div>
        </div>
      </div>

      {/* Pillars */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">Breakdown</h3>
        <div className="space-y-3">
          {score.pillars.map((p) => (
            <PillarRow key={p.id} pillar={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
