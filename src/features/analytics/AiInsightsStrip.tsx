import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getExecutiveInsights } from "@/lib/analytics/insights.functions";

type Kpi = { label: string; value: number; previous: number };

export function AiInsightsStrip({
  range, platforms, kpis,
}: {
  range: string;
  platforms: string[];
  kpis: Kpi[];
}) {
  const fn = useServerFn(getExecutiveInsights);
  const m = useMutation({
    mutationFn: () => fn({ data: { range, platforms, kpis } }),
  });

  const data = m.data;
  const confidenceTone =
    data?.confidence === "high" ? "text-emerald-600" :
    data?.confidence === "medium" ? "text-amber-600" : "text-muted-foreground";

  return (
    <div className="rounded-lg border border-primary/30 bg-gradient-to-br from-primary/5 via-transparent to-transparent p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">AI Strategist</h3>
          {data && (
            <Badge variant="outline" className={confidenceTone}>
              {data.confidence} confidence
            </Badge>
          )}
        </div>
        <Button size="sm" variant="outline" onClick={() => m.mutate()} disabled={m.isPending}>
          {m.isPending
            ? <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            : <RefreshCw className="mr-1 h-3 w-3" />}
          {data ? "Refresh" : "Analyze"}
        </Button>
      </div>

      {!data && !m.isPending && (
        <p className="text-sm text-muted-foreground">
          Click <span className="font-medium">Analyze</span> to get a plain-English summary of what changed, why, and what to do next.
        </p>
      )}

      {m.isPending && (
        <p className="text-sm text-muted-foreground">Reading the numbers…</p>
      )}

      {data && (
        <div className="space-y-3">
          <p className="text-sm leading-relaxed">{data.summary}</p>
          {data.actions.length > 0 && (
            <ul className="space-y-1.5">
              {data.actions.map((a, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
