import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  AlertCircle, CheckCircle2, Loader2, Play, Save, ShieldCheck,
  Sparkles, Trash2, XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

import {
  deleteIntegration, deleteKpiMapping, listKpiMappings, listLogs,
  previewData, testConnection, upsertIntegration, upsertKpiMapping,
  verifyAndEnable,
} from "@/lib/integrations/integrations.functions";
import {
  KPI_CATALOG, SECRET_FIELDS,
  type IntegrationConfig, type IntegrationRow, type IntegrationSecrets,
  type KpiMapping,
} from "@/lib/integrations/types";

const STATUS_META: Record<
  IntegrationRow["status"],
  { label: string; className: string }
> = {
  draft:    { label: "Draft",    className: "bg-muted text-muted-foreground" },
  tested:   { label: "Tested",   className: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  verified: { label: "Verified", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  error:    { label: "Error",    className: "bg-red-500/10 text-red-600 dark:text-red-400" },
};

export function PlatformPanel({ row }: { row: IntegrationRow }) {
  const qc = useQueryClient();
  const platform = row.platform;

  // ---- local editable state ------------------------------------------------
  const [displayName, setDisplayName] = useState(row.display_name);
  const [enabled, setEnabled] = useState(row.enabled);
  const [config, setConfig] = useState<IntegrationConfig>(row.config ?? {});
  const [secretsPatch, setSecretsPatch] = useState<Record<string, string>>({});

  const setCfg = <K extends keyof IntegrationConfig>(k: K, v: IntegrationConfig[K]) =>
    setConfig((c) => ({ ...c, [k]: v }));

  const setSecret = (k: keyof IntegrationSecrets, v: string) =>
    setSecretsPatch((s) => ({ ...s, [k]: v }));

  // ---- server actions ------------------------------------------------------
  const upsertFn  = useServerFn(upsertIntegration);
  const deleteFn  = useServerFn(deleteIntegration);
  const testFn    = useServerFn(testConnection);
  const previewFn = useServerFn(previewData);
  const verifyFn  = useServerFn(verifyAndEnable);
  const listKpis  = useServerFn(listKpiMappings);
  const upsertKpi = useServerFn(upsertKpiMapping);
  const deleteKpi = useServerFn(deleteKpiMapping);
  const listLogFn = useServerFn(listLogs);

  const saveMutation = useMutation({
    mutationFn: () =>
      upsertFn({
        data: {
          platform,
          display_name: displayName,
          enabled,
          config: config as any,
          secrets_patch: secretsPatch,
        },
      }),
    onSuccess: () => {
      toast.success(`${row.display_name} saved`);
      setSecretsPatch({});
      qc.invalidateQueries({ queryKey: ["integrations"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteFn({ data: { platform } }),
    onSuccess: () => {
      toast.success(`${row.display_name} cleared`);
      qc.invalidateQueries({ queryKey: ["integrations"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const [testResult, setTestResult] = useState<Awaited<ReturnType<typeof testFn>> | null>(null);
  const testMutation = useMutation({
    mutationFn: () => testFn({ data: { platform } }),
    onSuccess: (r) => {
      setTestResult(r);
      qc.invalidateQueries({ queryKey: ["integrations"] });
      qc.invalidateQueries({ queryKey: ["logs", platform] });
      if (r.ok) toast.success(r.message);
      else toast.error(r.message);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const [previewResult, setPreviewResult] = useState<Awaited<ReturnType<typeof previewFn>> | null>(null);
  const previewMutation = useMutation({
    mutationFn: () => previewFn({ data: { platform } }),
    onSuccess: (r) => {
      setPreviewResult(r);
      qc.invalidateQueries({ queryKey: ["logs", platform] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const verifyMutation = useMutation({
    mutationFn: () => verifyFn({ data: { platform } }),
    onSuccess: (r) => {
      if (r.verified) toast.success(r.message ?? "Verified");
      else toast.error(r.reason ?? "Not verified");
      qc.invalidateQueries({ queryKey: ["integrations"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // ---- KPI mappings --------------------------------------------------------
  const kpiQuery = useQuery({
    queryKey: ["kpis", platform],
    queryFn:  () => listKpis({ data: { platform } }),
  });

  const upsertKpiMutation = useMutation({
    mutationFn: (m: Partial<KpiMapping> & { internal_kpi: string }) =>
      upsertKpi({
        data: {
          platform,
          internal_kpi:     m.internal_kpi,
          external_field:   m.external_field ?? "",
          data_type:        (m.data_type ?? "number") as any,
          update_frequency: (m.update_frequency ?? "daily") as any,
          description:      m.description ?? null,
          confirmed:        Boolean(m.confirmed),
        },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["kpis", platform] }),
    onError:  (e: Error) => toast.error(e.message),
  });

  const deleteKpiMutation = useMutation({
    mutationFn: (id: string) => deleteKpi({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["kpis", platform] }),
  });

  // ---- Logs ----------------------------------------------------------------
  const logsQuery = useQuery({
    queryKey: ["logs", platform],
    queryFn:  () => listLogFn({ data: { platform, limit: 40 } }),
  });

  const statusMeta = STATUS_META[row.status];

  // Combined KPI list = catalog ∪ existing rows.
  const kpiRows = useMemo(() => {
    const existing = new Map(kpiQuery.data?.map((m) => [m.internal_kpi, m]));
    return KPI_CATALOG.map((id) => existing.get(id) ?? {
      id: `new:${id}`, platform, internal_kpi: id, external_field: "",
      data_type: "number", update_frequency: "daily", description: null, confirmed: false,
    } as KpiMapping);
  }, [kpiQuery.data, platform]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{row.display_name}</h2>
          <p className="text-xs text-muted-foreground">
            {row.status_message ?? "Configure credentials and endpoints, then test."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={statusMeta.className + " rounded-full"}>{statusMeta.label}</Badge>
          {row.verified ? (
            <Badge variant="outline" className="rounded-full gap-1">
              <ShieldCheck className="h-3 w-3" /> Live
            </Badge>
          ) : null}
          <div className="flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs">
            <Switch id={`en-${platform}`} checked={enabled} onCheckedChange={setEnabled} />
            <Label htmlFor={`en-${platform}`} className="text-xs">Enabled</Label>
          </div>
        </div>
      </header>

      <Tabs defaultValue="credentials" className="w-full">
        <TabsList className="h-9">
          <TabsTrigger value="credentials" className="text-xs">Credentials</TabsTrigger>
          <TabsTrigger value="endpoints"   className="text-xs">Endpoints</TabsTrigger>
          <TabsTrigger value="kpis"        className="text-xs">KPI mapping</TabsTrigger>
          <TabsTrigger value="test"        className="text-xs">Test & preview</TabsTrigger>
          <TabsTrigger value="logs"        className="text-xs">Logs</TabsTrigger>
        </TabsList>

        {/* -------------------- Credentials -------------------- */}
        <TabsContent value="credentials" className="pt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Display name">
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </Field>
            <Field label="Redirect URI">
              <Input value={config.redirect_uri ?? ""} onChange={(e) => setCfg("redirect_uri", e.target.value)} placeholder="https://yourapp.com/oauth/callback" />
            </Field>
            <Field label="OAuth URL">
              <Input value={config.oauth_url ?? ""} onChange={(e) => setCfg("oauth_url", e.target.value)} placeholder="https://provider.com/oauth/authorize" />
            </Field>
            <Field label="Scopes">
              <Input value={config.scopes ?? ""} onChange={(e) => setCfg("scopes", e.target.value)} placeholder="read_insights,pages_show_list" />
            </Field>
            {SECRET_FIELDS.map((f) => (
              <Field key={f.id} label={f.label}>
                <div className="flex items-center gap-2">
                  <Input
                    type="password"
                    value={secretsPatch[f.id] ?? ""}
                    placeholder={row.secrets_masked[f.id] || `Enter ${f.label.toLowerCase()}`}
                    onChange={(e) => setSecret(f.id, e.target.value)}
                    autoComplete="off"
                  />
                  {row.secrets_masked[f.id] ? (
                    <Button size="sm" variant="ghost" onClick={() => setSecret(f.id, "")} title="Clear on save">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  ) : null}
                </div>
                {row.secrets_masked[f.id] ? (
                  <p className="mt-1 text-[10px] text-muted-foreground">Stored: {row.secrets_masked[f.id]}</p>
                ) : null}
              </Field>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Secrets are encrypted with AES-256-GCM before being written to the database and never sent to non-admin users.
          </p>
        </TabsContent>

        {/* -------------------- Endpoints -------------------- */}
        <TabsContent value="endpoints" className="pt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Base API URL">
              <Input value={config.base_api_url ?? ""} onChange={(e) => setCfg("base_api_url", e.target.value)} placeholder="https://graph.facebook.com/v24.0" />
            </Field>
            <Field label="Version">
              <Input value={config.version ?? ""} onChange={(e) => setCfg("version", e.target.value)} placeholder="v24.0" />
            </Field>
            <Field label="REST or GraphQL">
              <Select value={config.rest_or_graphql ?? "rest"} onValueChange={(v) => setCfg("rest_or_graphql", v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="rest">REST</SelectItem>
                  <SelectItem value="graphql">GraphQL</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Authentication method">
              <Select value={config.auth_method ?? "bearer"} onValueChange={(v) => setCfg("auth_method", v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="oauth2">OAuth 2.0 (bearer token)</SelectItem>
                  <SelectItem value="bearer">Bearer token</SelectItem>
                  <SelectItem value="api_key">API key header</SelectItem>
                  <SelectItem value="basic">Basic auth</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="HTTP method">
              <Select value={config.http_method ?? "GET"} onValueChange={(v) => setCfg("http_method", v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Sample endpoint path">
              <Input value={config.endpoint_path ?? ""} onChange={(e) => setCfg("endpoint_path", e.target.value)} placeholder="/me/insights" />
            </Field>
            <Field label="Timeout (ms)">
              <Input type="number" value={config.timeout_ms ?? 10000} onChange={(e) => setCfg("timeout_ms", Number(e.target.value))} />
            </Field>
            <Field label="Retry attempts">
              <Input type="number" value={config.retry?.attempts ?? 3} onChange={(e) => setCfg("retry", { ...(config.retry ?? {}), attempts: Number(e.target.value) })} />
            </Field>
            <Field label="Retry backoff (ms)">
              <Input type="number" value={config.retry?.backoff_ms ?? 500} onChange={(e) => setCfg("retry", { ...(config.retry ?? {}), backoff_ms: Number(e.target.value) })} />
            </Field>
            <Field label="Rate limit (requests/min)">
              <Input type="number" value={config.rate_limit?.rpm ?? 60} onChange={(e) => setCfg("rate_limit", { ...(config.rate_limit ?? {}), rpm: Number(e.target.value) })} />
            </Field>
            <Field label="Pagination style">
              <Input value={config.pagination ?? ""} onChange={(e) => setCfg("pagination", e.target.value)} placeholder="cursor, offset, next_url…" />
            </Field>
            <Field label="Webhook URL">
              <Input value={config.webhook_url ?? ""} onChange={(e) => setCfg("webhook_url", e.target.value)} placeholder="https://yourapp.com/webhooks/…" />
            </Field>
            <Field label="Custom headers (JSON)" className="sm:col-span-2">
              <Textarea rows={3}
                value={JSON.stringify(config.headers ?? {}, null, 2)}
                onChange={(e) => {
                  try { setCfg("headers", JSON.parse(e.target.value || "{}")); }
                  catch { /* keep last valid */ }
                }}
              />
            </Field>
            <Field label="Query parameters (JSON)" className="sm:col-span-2">
              <Textarea rows={3}
                value={JSON.stringify(config.query_params ?? {}, null, 2)}
                onChange={(e) => {
                  try { setCfg("query_params", JSON.parse(e.target.value || "{}")); }
                  catch {}
                }}
              />
            </Field>
            <Field label="Request body template" className="sm:col-span-2">
              <Textarea rows={4} value={config.body_template ?? ""} onChange={(e) => setCfg("body_template", e.target.value)} placeholder='{"query":"…"}' />
            </Field>
            <Field label="Notes" className="sm:col-span-2">
              <Textarea rows={2} value={config.notes ?? ""} onChange={(e) => setCfg("notes", e.target.value)} />
            </Field>
          </div>
        </TabsContent>

        {/* -------------------- KPI mapping -------------------- */}
        <TabsContent value="kpis" className="pt-4">
          <p className="mb-3 text-xs text-muted-foreground">
            Map every ROTHME KPI to the exact JSON field returned by the API. Confirmed mappings are required to enable the integration.
          </p>
          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="min-w-full text-xs">
              <thead className="bg-muted/40 text-muted-foreground">
                <tr className="[&>th]:px-3 [&>th]:py-2 [&>th]:text-left">
                  <th>ROTHME KPI</th>
                  <th>External field</th>
                  <th>Type</th>
                  <th>Frequency</th>
                  <th>Description</th>
                  <th>OK</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {kpiRows.map((m) => (
                  <KpiRow
                    key={m.internal_kpi}
                    row={m}
                    onSave={(patch) => upsertKpiMutation.mutate({ ...m, ...patch })}
                    onDelete={() => m.id.startsWith("new:") ? null : deleteKpiMutation.mutate(m.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* -------------------- Test & preview -------------------- */}
        <TabsContent value="test" className="pt-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => testMutation.mutate()} disabled={testMutation.isPending}>
              {testMutation.isPending ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Play className="mr-2 h-3.5 w-3.5" />}
              Test connection
            </Button>
            <Button variant="outline" onClick={() => previewMutation.mutate()} disabled={previewMutation.isPending}>
              {previewMutation.isPending ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Sparkles className="mr-2 h-3.5 w-3.5" />}
              Preview data
            </Button>
            <Button variant="outline" onClick={() => verifyMutation.mutate()} disabled={verifyMutation.isPending}>
              {verifyMutation.isPending ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="mr-2 h-3.5 w-3.5" />}
              Verify & enable
            </Button>
          </div>

          {testResult ? <TestResultView r={testResult} /> : null}

          {previewResult ? (
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-border/60">
                <header className="border-b border-border/50 px-4 py-2 text-xs font-medium">Raw API response</header>
                <pre className="max-h-96 overflow-auto p-3 text-[11px] leading-relaxed">
                  {JSON.stringify(previewResult.response, null, 2)}
                </pre>
              </div>
              <div className="rounded-xl border border-border/60">
                <header className="border-b border-border/50 px-4 py-2 text-xs font-medium">Parsed by ROTHME</header>
                <table className="w-full text-xs">
                  <thead className="bg-muted/40 text-muted-foreground">
                    <tr className="[&>th]:px-3 [&>th]:py-2 [&>th]:text-left"><th>KPI</th><th>Value</th></tr>
                  </thead>
                  <tbody>
                    {Object.entries(previewResult.parsed).map(([k, v]) => (
                      <tr key={k} className="border-t border-border/50">
                        <td className="px-3 py-2 font-mono text-[11px]">{k}</td>
                        <td className="px-3 py-2 font-mono text-[11px]">{v == null ? "—" : String(typeof v === "object" ? JSON.stringify(v) : v)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </TabsContent>

        {/* -------------------- Logs -------------------- */}
        <TabsContent value="logs" className="pt-4">
          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="min-w-full text-xs">
              <thead className="bg-muted/40 text-muted-foreground">
                <tr className="[&>th]:px-3 [&>th]:py-2 [&>th]:text-left">
                  <th>Time</th><th>Event</th><th>Status</th><th>Message</th>
                </tr>
              </thead>
              <tbody>
                {(logsQuery.data ?? []).map((l) => (
                  <tr key={l.id} className="border-t border-border/50 align-top">
                    <td className="whitespace-nowrap px-3 py-2 text-[11px] text-muted-foreground">
                      {new Date(l.created_at).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 font-mono text-[11px]">{l.event_type}</td>
                    <td className="px-3 py-2">
                      {l.success === true ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                       : l.success === false ? <XCircle className="h-4 w-4 text-red-500" />
                       : <span className="text-muted-foreground">—</span>}
                      {l.status_code ? <span className="ml-2 text-[11px] text-muted-foreground">{l.status_code}</span> : null}
                    </td>
                    <td className="px-3 py-2 text-[11px]">{l.message ?? "—"}</td>
                  </tr>
                ))}
                {!logsQuery.data?.length ? (
                  <tr><td colSpan={4} className="px-3 py-6 text-center text-xs text-muted-foreground">No logs yet</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      <Separator />
      <footer className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          Last tested: {row.last_tested_at ? new Date(row.last_tested_at).toLocaleString() : "never"}
        </p>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>
            <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
          </Button>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-2 h-3.5 w-3.5" />}
            Save configuration
          </Button>
        </div>
      </footer>
    </div>
  );
}

function Field({
  label, className, children,
}: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <Label className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function KpiRow({
  row, onSave, onDelete,
}: {
  row: KpiMapping;
  onSave: (patch: Partial<KpiMapping>) => void;
  onDelete: () => void;
}) {
  const [local, setLocal] = useState(row);
  return (
    <tr className="border-t border-border/50 align-top">
      <td className="px-3 py-2 font-mono text-[11px]">{row.internal_kpi}</td>
      <td className="px-3 py-2">
        <Input className="h-7 text-[11px]"
          value={local.external_field}
          onChange={(e) => setLocal({ ...local, external_field: e.target.value })}
          onBlur={() => onSave({ external_field: local.external_field })}
          placeholder="data.follower_count"
        />
      </td>
      <td className="px-3 py-2">
        <Select value={local.data_type} onValueChange={(v) => { setLocal({ ...local, data_type: v as any }); onSave({ data_type: v as any }); }}>
          <SelectTrigger className="h-7 w-[110px] text-[11px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="number">number</SelectItem>
            <SelectItem value="percent">percent</SelectItem>
            <SelectItem value="currency">currency</SelectItem>
            <SelectItem value="duration">duration</SelectItem>
          </SelectContent>
        </Select>
      </td>
      <td className="px-3 py-2">
        <Select value={local.update_frequency} onValueChange={(v) => { setLocal({ ...local, update_frequency: v as any }); onSave({ update_frequency: v as any }); }}>
          <SelectTrigger className="h-7 w-[110px] text-[11px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="realtime">realtime</SelectItem>
            <SelectItem value="hourly">hourly</SelectItem>
            <SelectItem value="daily">daily</SelectItem>
            <SelectItem value="weekly">weekly</SelectItem>
          </SelectContent>
        </Select>
      </td>
      <td className="px-3 py-2">
        <Input className="h-7 text-[11px]"
          value={local.description ?? ""}
          onChange={(e) => setLocal({ ...local, description: e.target.value })}
          onBlur={() => onSave({ description: local.description })}
        />
      </td>
      <td className="px-3 py-2">
        <Switch checked={local.confirmed}
          onCheckedChange={(v) => { setLocal({ ...local, confirmed: v }); onSave({ confirmed: v }); }} />
      </td>
      <td className="px-3 py-2">
        {row.id.startsWith("new:") ? null : (
          <Button size="sm" variant="ghost" onClick={onDelete}><Trash2 className="h-3.5 w-3.5" /></Button>
        )}
      </td>
    </tr>
  );
}

function TestResultView({ r }: { r: Awaited<ReturnType<ReturnType<typeof useServerFn<typeof testConnection>>>> }) {
  return (
    <div className="mt-4 rounded-xl border border-border/60">
      <header className="flex items-center gap-2 border-b border-border/50 px-4 py-2 text-xs">
        {r.ok ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <AlertCircle className="h-4 w-4 text-red-500" />}
        <span className="font-medium">{r.ok ? "Connected" : "Failed"}</span>
        <span className="text-muted-foreground">HTTP {r.status} · {r.duration_ms}ms</span>
        <span className="ml-auto font-mono text-[10px] text-muted-foreground">{r.url}</span>
      </header>
      <div className="grid gap-0 lg:grid-cols-2">
        <div>
          <p className="border-b border-border/50 bg-muted/40 px-3 py-1.5 text-[11px] font-medium">Request</p>
          <pre className="max-h-64 overflow-auto p-3 text-[10px] leading-relaxed">{JSON.stringify(r.request, null, 2)}</pre>
        </div>
        <div className="border-l border-border/50">
          <p className="border-b border-border/50 bg-muted/40 px-3 py-1.5 text-[11px] font-medium">Response</p>
          <pre className="max-h-64 overflow-auto p-3 text-[10px] leading-relaxed">{JSON.stringify(r.response, null, 2)}</pre>
        </div>
      </div>
      {!r.ok ? (
        <div className="border-t border-border/50 bg-red-500/5 px-4 py-2 text-[11px] text-red-600 dark:text-red-400">
          {r.message}
        </div>
      ) : null}
    </div>
  );
}
