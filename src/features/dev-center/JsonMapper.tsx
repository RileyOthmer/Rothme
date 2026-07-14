import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Check, Sparkles, Trash2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import { flattenJson } from "@/lib/dev-center/json-path";
import {
  listMappings, mapPathToKpi, upsertMapping, deleteMapping,
} from "@/lib/dev-center/dev-center.functions";

interface Props {
  platformId: string;
  endpointId: string;
  response: unknown;
  status: number | null;
  duration?: number;
}

// Suggested ROTHME KPIs — admin picks from any of these when mapping.
const KPI_SUGGESTIONS = [
  "Followers", "Reach", "Impressions", "Engagement", "Likes", "Comments",
  "Shares", "Saves", "Profile Visits", "Website Clicks", "CTR", "Video Views",
  "Watch Time", "Conversions", "Revenue", "ROAS", "Cost Per Click",
  "Cost Per Acquisition", "Campaign Spend",
];

export function JsonMapper({ platformId, endpointId, response, status, duration }: Props) {
  const qc = useQueryClient();
  const listFn = useServerFn(listMappings);
  const mapFn  = useServerFn(mapPathToKpi);
  const upFn   = useServerFn(upsertMapping);
  const delFn  = useServerFn(deleteMapping);

  const { data: mappings = [] } = useQuery({
    queryKey: ["mappings", platformId],
    queryFn: () => listFn({ data: { platform_id: platformId } }),
  });

  const leaves = useMemo(
    () => (response == null ? [] : flattenJson(response as any)),
    [response],
  );

  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [kpiName, setKpiName] = useState("");
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState("");

  const filtered = filter
    ? leaves.filter((l) => l.path.toLowerCase().includes(filter.toLowerCase()))
    : leaves;

  async function assignMapping() {
    if (!selectedPath || !kpiName.trim()) {
      toast.error("Pick a JSON field and enter a KPI name");
      return;
    }
    setBusy(true);
    try {
      await mapFn({ data: {
        platform_id: platformId, endpoint_id: endpointId,
        ROTHME_kpi: kpiName.trim(), json_path: selectedPath,
        example_response: response,
      } });
      await qc.invalidateQueries({ queryKey: ["mappings", platformId] });
      toast.success(`Mapped → ${kpiName}`);
      setKpiName(""); setSelectedPath(null);
    } catch (e) { toast.error((e as Error).message); }
    finally { setBusy(false); }
  }

  async function confirmMapping(id: string, confirmed: boolean, row: any) {
    try {
      await upFn({ data: {
        id, platform_id: platformId, endpoint_id: row.endpoint_id ?? null,
        ROTHME_kpi: row.ROTHME_kpi, json_path: row.json_path,
        data_type: row.data_type, confirmed,
      } });
      await qc.invalidateQueries({ queryKey: ["mappings", platformId] });
    } catch (e) { toast.error((e as Error).message); }
  }

  async function removeMapping(id: string) {
    try {
      await delFn({ data: { id } });
      await qc.invalidateQueries({ queryKey: ["mappings", platformId] });
    } catch (e) { toast.error((e as Error).message); }
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-semibold">JSON → KPI mapper</h4>
          <p className="text-xs text-muted-foreground">
            Click a field on the left, name the ROTHME KPI, then Assign. No coding.
          </p>
        </div>
        {status != null && (
          <Badge variant="outline" className="rounded-full">
            HTTP {status}{duration != null ? ` · ${duration}ms` : ""}
          </Badge>
        )}
      </header>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        {/* JSON leaves */}
        <div className="rounded-lg border border-border/60 bg-card/30 p-2">
          <Input placeholder="Filter fields…" value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="mb-2 h-8 text-xs" />
          <ul className="max-h-64 space-y-0.5 overflow-y-auto font-mono text-xs">
            {filtered.map((leaf) => {
              const active = selectedPath === leaf.path;
              return (
                <li key={leaf.path}>
                  <button type="button"
                    onClick={() => setSelectedPath(leaf.path)}
                    className={
                      "flex w-full items-start justify-between gap-2 rounded px-2 py-1.5 text-left transition " +
                      (active ? "bg-primary/10 text-foreground" : "hover:bg-muted/60")
                    }
                  >
                    <span className="truncate">{leaf.path}</span>
                    <span className="shrink-0 text-muted-foreground">
                      {leaf.kind === "object" || leaf.kind === "array"
                        ? leaf.kind
                        : String(leaf.value).slice(0, 30)}
                    </span>
                  </button>
                </li>
              );
            })}
            {filtered.length === 0 && (
              <li className="p-3 text-center text-muted-foreground">No fields to display.</li>
            )}
          </ul>
        </div>

        {/* Assignment + existing mappings */}
        <div className="space-y-3">
          <div className="rounded-lg border border-border/60 bg-card/30 p-3 space-y-2">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Selected path</div>
            <code className="block truncate rounded bg-muted px-2 py-1 font-mono text-xs">
              {selectedPath ?? "—"}
            </code>
            <Input placeholder="ROTHME KPI (e.g. Followers)"
              value={kpiName} onChange={(e) => setKpiName(e.target.value)}
              list="kpi-suggestions" className="h-8 text-xs" />
            <datalist id="kpi-suggestions">
              {KPI_SUGGESTIONS.map((k) => <option key={k} value={k} />)}
            </datalist>
            <Button size="sm" className="w-full" onClick={assignMapping} disabled={busy || !selectedPath}>
              {busy ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Sparkles className="mr-2 h-3.5 w-3.5" />}
              Assign mapping
            </Button>
          </div>

          <div>
            <div className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">
              Existing mappings · {mappings.length}
            </div>
            <ul className="space-y-1">
              {mappings.map((m) => (
                <li key={m.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-card/30 px-2 py-1.5 text-xs">
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{m.ROTHME_kpi}</div>
                    <code className="block truncate font-mono text-[10px] text-muted-foreground">{m.json_path || "—"}</code>
                  </div>
                  <Button size="icon" variant="ghost" className="h-7 w-7"
                    onClick={() => confirmMapping(m.id, !m.confirmed, m)}
                    title={m.confirmed ? "Confirmed" : "Confirm mapping"}>
                    <Check className={"h-3.5 w-3.5 " + (m.confirmed ? "text-emerald-500" : "text-muted-foreground")} />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7"
                    onClick={() => removeMapping(m.id)} title="Delete">
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </li>
              ))}
              {mappings.length === 0 && (
                <li className="rounded-lg border border-dashed border-border/60 p-3 text-center text-xs text-muted-foreground">
                  No mappings yet.
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
