import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Play, Copy, Trash2, Plus, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import {
  listEndpoints, upsertEndpoint, deleteEndpoint, cloneEndpoint, testEndpoint,
} from "@/lib/dev-center/dev-center.functions";
import type { PlatformEndpoint } from "@/lib/dev-center/types";
import { JsonMapper } from "./JsonMapper";

interface Props { platformId: string }

const EMPTY: Omit<PlatformEndpoint, "id" | "created_at" | "updated_at" | "last_tested_at" | "last_status"> = {
  platform_id: "",
  name: "New endpoint",
  http_method: "GET",
  path: "/",
  headers: {},
  query_params: {},
  body: null,
  auth_override: {},
  pagination: {},
  rate_limit: {},
  parser: {},
  validation: {},
  example_response: null,
};

export function EndpointBuilder({ platformId }: Props) {
  const qc = useQueryClient();
  const listFn = useServerFn(listEndpoints);
  const saveFn = useServerFn(upsertEndpoint);
  const delFn = useServerFn(deleteEndpoint);
  const cloneFn = useServerFn(cloneEndpoint);
  const testFn = useServerFn(testEndpoint);

  const { data: endpoints = [] } = useQuery({
    queryKey: ["endpoints", platformId],
    queryFn: () => listFn({ data: { platform_id: platformId } }),
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const active = useMemo(
    () => endpoints.find((e) => e.id === selectedId) ?? endpoints[0] ?? null,
    [endpoints, selectedId],
  );

  const [testResult, setTestResult] = useState<{ status: number; response: unknown; duration_ms: number } | null>(null);
  const [busy, setBusy] = useState<null | "save" | "test" | "delete" | "clone" | "new">(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["endpoints", platformId] });

  async function handleNew() {
    setBusy("new");
    try {
      await saveFn({ data: { ...EMPTY, platform_id: platformId } });
      await invalidate();
      toast.success("Endpoint created");
    } catch (e) { toast.error((e as Error).message); }
    finally { setBusy(null); }
  }

  async function handleSave(patch: Partial<PlatformEndpoint>) {
    if (!active) return;
    setBusy("save");
    try {
      await saveFn({ data: {
        id: active.id, platform_id: platformId,
        name: patch.name ?? active.name,
        http_method: (patch.http_method ?? active.http_method) as any,
        path: patch.path ?? active.path,
        headers: (patch.headers ?? active.headers) as Record<string, string>,
        query_params: (patch.query_params ?? active.query_params) as Record<string, string>,
        body: patch.body === undefined ? active.body : patch.body,
        auth_override: active.auth_override, pagination: active.pagination,
        rate_limit: active.rate_limit, parser: active.parser, validation: active.validation,
      } });
      await invalidate();
      toast.success("Endpoint saved");
    } catch (e) { toast.error((e as Error).message); }
    finally { setBusy(null); }
  }

  async function handleTest() {
    if (!active) return;
    setBusy("test"); setTestResult(null);
    try {
      const r = await testFn({ data: { endpoint_id: active.id } });
      setTestResult({ status: r.status, response: r.response, duration_ms: r.duration_ms });
      if (r.ok) toast.success(`HTTP ${r.status} · ${r.duration_ms}ms`);
      else toast.error(`HTTP ${r.status || "network"} · ${r.duration_ms}ms`);
      await invalidate();
    } catch (e) { toast.error((e as Error).message); }
    finally { setBusy(null); }
  }

  async function handleClone() {
    if (!active) return;
    setBusy("clone");
    try { await cloneFn({ data: { id: active.id } }); await invalidate(); toast.success("Cloned"); }
    catch (e) { toast.error((e as Error).message); }
    finally { setBusy(null); }
  }

  async function handleDelete() {
    if (!active) return;
    if (!confirm(`Delete endpoint "${active.name}"?`)) return;
    setBusy("delete");
    try {
      await delFn({ data: { id: active.id } });
      setSelectedId(null); setTestResult(null);
      await invalidate(); toast.success("Deleted");
    } catch (e) { toast.error((e as Error).message); }
    finally { setBusy(null); }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      {/* Endpoint list */}
      <aside className="space-y-2">
        <Button size="sm" variant="outline" className="w-full" onClick={handleNew} disabled={busy === "new"}>
          <Plus className="mr-2 h-3.5 w-3.5" /> New endpoint
        </Button>
        <ul className="space-y-1">
          {endpoints.map((e) => {
            const selected = active?.id === e.id;
            return (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => { setSelectedId(e.id); setTestResult(null); }}
                  className={
                    "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-xs transition " +
                    (selected ? "bg-primary/10 text-foreground" : "hover:bg-muted/60 text-muted-foreground")
                  }
                >
                  <span className="truncate font-medium">{e.name}</span>
                  <Badge variant="outline" className="rounded font-mono text-[10px]">{e.http_method}</Badge>
                </button>
              </li>
            );
          })}
          {endpoints.length === 0 && (
            <li className="rounded-lg border border-dashed border-border/60 p-3 text-center text-xs text-muted-foreground">
              No endpoints yet.
            </li>
          )}
        </ul>
      </aside>

      {/* Editor */}
      <section className="space-y-4">
        {!active ? (
          <p className="text-sm text-muted-foreground">Select or create an endpoint to configure it.</p>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-[1fr_130px]">
              <div>
                <Label>Name</Label>
                <Input value={active.name}
                  onChange={(e) => handleSave({ name: e.target.value })}
                  onBlur={(e) => handleSave({ name: e.target.value })} />
              </div>
              <div>
                <Label>Method</Label>
                <Select value={active.http_method} onValueChange={(v) => handleSave({ http_method: v as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["GET","POST","PUT","PATCH","DELETE"].map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Path (appended to Base URL)</Label>
              <Input value={active.path} placeholder="/v1/analytics"
                onBlur={(e) => handleSave({ path: e.target.value })}
                onChange={(e) => { active.path = e.target.value; }} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <KVEditor label="Query params" value={active.query_params}
                onSave={(v) => handleSave({ query_params: v })} />
              <KVEditor label="Headers" value={active.headers}
                onSave={(v) => handleSave({ headers: v })} />
            </div>

            {["POST","PUT","PATCH"].includes(active.http_method) && (
              <div>
                <Label>Request body (JSON)</Label>
                <Textarea rows={4} defaultValue={active.body ?? ""}
                  onBlur={(e) => handleSave({ body: e.target.value || null })} />
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={handleTest} disabled={busy === "test"}>
                {busy === "test" ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Play className="mr-2 h-3.5 w-3.5" />}
                Test endpoint
              </Button>
              <Button size="sm" variant="outline" onClick={handleClone} disabled={busy === "clone"}>
                <Copy className="mr-2 h-3.5 w-3.5" /> Clone
              </Button>
              <Button size="sm" variant="outline" onClick={handleDelete} disabled={busy === "delete"}>
                <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
              </Button>
              {active.last_status != null && (
                <Badge variant="outline" className="rounded-full">
                  Last: HTTP {active.last_status}
                </Badge>
              )}
            </div>

            {(testResult || active.example_response) && (
              <JsonMapper
                platformId={platformId}
                endpointId={active.id}
                response={testResult?.response ?? active.example_response}
                status={testResult?.status ?? active.last_status ?? null}
                duration={testResult?.duration_ms}
              />
            )}
          </>
        )}
      </section>
    </div>
  );
}

// ---- Key/value editor ------------------------------------------------------

function KVEditor({ label, value, onSave }: {
  label: string; value: Record<string, string>;
  onSave: (v: Record<string, string>) => void;
}) {
  const [rows, setRows] = useState<[string, string][]>(() =>
    Object.entries(value ?? {}).length ? Object.entries(value ?? {}) : [["", ""]]);

  const commit = (next: [string, string][]) => {
    const obj: Record<string, string> = {};
    for (const [k, v] of next) if (k.trim()) obj[k.trim()] = v;
    onSave(obj);
  };

  return (
    <div className="rounded-lg border border-border/60 p-3">
      <Label className="mb-2 block">{label}</Label>
      <div className="space-y-2">
        {rows.map(([k, v], i) => (
          <div key={i} className="flex gap-2">
            <Input placeholder="key" value={k}
              onChange={(e) => { const n = [...rows]; n[i] = [e.target.value, v]; setRows(n); }}
              onBlur={() => commit(rows)}
              className="h-8 text-xs" />
            <Input placeholder="value" value={v}
              onChange={(e) => { const n = [...rows]; n[i] = [k, e.target.value]; setRows(n); }}
              onBlur={() => commit(rows)}
              className="h-8 text-xs" />
          </div>
        ))}
        <Button size="sm" variant="ghost" className="h-7 w-full text-xs"
          onClick={() => setRows([...rows, ["", ""]])}>+ Add row</Button>
      </div>
    </div>
  );
}
