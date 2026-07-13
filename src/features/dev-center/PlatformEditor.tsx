import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Save, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

import type { Platform, SecretField } from "@/lib/dev-center/types";
import { SECRET_FIELDS } from "@/lib/dev-center/types";
import { upsertPlatform, deletePlatform } from "@/lib/dev-center/dev-center.functions";
import { EndpointBuilder } from "./EndpointBuilder";

const AUTH_TYPES = [
  { value: "none", label: "None" },
  { value: "api_key", label: "API Key" },
  { value: "bearer", label: "Bearer Token" },
  { value: "basic", label: "Basic Auth" },
  { value: "jwt", label: "JWT" },
  { value: "oauth2", label: "OAuth 2.0" },
  { value: "oauth2_pkce", label: "OAuth 2.0 PKCE" },
  { value: "webhook_only", label: "Webhook-only" },
  { value: "custom", label: "Custom" },
];

const STATUS_STYLE: Record<Platform["status"], string> = {
  needs_configuration: "bg-muted text-muted-foreground",
  tested: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  verified: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  error: "bg-red-500/15 text-red-600 dark:text-red-400",
};

interface Props { platform: Platform }

export function PlatformEditor({ platform }: Props) {
  const qc = useQueryClient();
  const saveFn = useServerFn(upsertPlatform);
  const delFn = useServerFn(deletePlatform);

  const [form, setForm] = useState(() => ({
    slug: platform.slug,
    name: platform.name,
    logo_url: platform.logo_url ?? "",
    description: platform.description ?? "",
    category: platform.category ?? "",
    base_url: platform.base_url ?? "",
    api_version: platform.api_version ?? "",
    auth_type: platform.auth_type,
    authorization_url: platform.authorization_url ?? "",
    token_url: platform.token_url ?? "",
    refresh_url: platform.refresh_url ?? "",
    redirect_uri: platform.redirect_uri ?? "",
    scopes: platform.scopes.join(", "),
    webhook_endpoint: platform.webhook_endpoint ?? "",
    timeout_ms: platform.timeout_ms,
    retry_count: platform.retry_count,
    notes: platform.notes ?? "",
    enabled: platform.enabled,
  }));
  const [secretsPatch, setSecretsPatch] = useState<Partial<Record<SecretField, string>>>({});
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await saveFn({ data: {
        id: platform.id,
        slug: form.slug, name: form.name,
        logo_url: form.logo_url || null,
        description: form.description || null,
        category: form.category || null,
        base_url: form.base_url || null,
        api_version: form.api_version || null,
        auth_type: form.auth_type,
        authorization_url: form.authorization_url || null,
        token_url: form.token_url || null,
        refresh_url: form.refresh_url || null,
        redirect_uri: form.redirect_uri || null,
        scopes: form.scopes.split(",").map(s => s.trim()).filter(Boolean),
        webhook_endpoint: form.webhook_endpoint || null,
        default_headers: platform.default_headers,
        timeout_ms: Number(form.timeout_ms) || 10000,
        retry_count: Number(form.retry_count) || 0,
        rate_limit: platform.rate_limit,
        notes: form.notes || null,
        enabled: form.enabled,
        secrets_patch: secretsPatch as Record<string, string>,
      } });
      await qc.invalidateQueries({ queryKey: ["platforms"] });
      setSecretsPatch({});
      toast.success("Platform saved");
    } catch (e) { toast.error((e as Error).message); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!confirm(`Delete platform "${platform.name}" and all its endpoints/mappings? This cannot be undone.`)) return;
    try {
      await delFn({ data: { id: platform.id } });
      await qc.invalidateQueries({ queryKey: ["platforms"] });
      toast.success("Platform deleted");
    } catch (e) { toast.error((e as Error).message); }
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-xl font-semibold">{platform.name}</h2>
            <Badge className={"rounded-full " + STATUS_STYLE[platform.status]}>
              {platform.status.replace("_", " ")}
            </Badge>
            {platform.enabled && <Badge variant="outline" className="rounded-full">Enabled</Badge>}
          </div>
          <p className="text-xs text-muted-foreground">Slug: <code>{platform.slug}</code></p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleDelete}>
            <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-3.5 w-3.5" /> {saving ? "Saving…" : "Save platform"}
          </Button>
        </div>
      </header>

      <Tabs defaultValue="config">
        <TabsList>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="secrets">Secrets</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints & Mapping</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-3 pt-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Slug"><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></Field>
            <Field label="Category"><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Social · Ads · Analytics" /></Field>
            <Field label="Logo URL"><Input value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} /></Field>
            <Field label="Base URL"><Input value={form.base_url} onChange={(e) => setForm({ ...form, base_url: e.target.value })} placeholder="https://graph.facebook.com" /></Field>
            <Field label="API Version"><Input value={form.api_version} onChange={(e) => setForm({ ...form, api_version: e.target.value })} placeholder="v18.0" /></Field>
            <Field label="Auth type">
              <Select value={form.auth_type} onValueChange={(v) => setForm({ ...form, auth_type: v as Platform["auth_type"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{AUTH_TYPES.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Redirect URI"><Input value={form.redirect_uri} onChange={(e) => setForm({ ...form, redirect_uri: e.target.value })} /></Field>
            <Field label="Authorization URL"><Input value={form.authorization_url} onChange={(e) => setForm({ ...form, authorization_url: e.target.value })} /></Field>
            <Field label="Token URL"><Input value={form.token_url} onChange={(e) => setForm({ ...form, token_url: e.target.value })} /></Field>
            <Field label="Refresh URL"><Input value={form.refresh_url} onChange={(e) => setForm({ ...form, refresh_url: e.target.value })} /></Field>
            <Field label="Webhook endpoint"><Input value={form.webhook_endpoint} onChange={(e) => setForm({ ...form, webhook_endpoint: e.target.value })} /></Field>
            <Field label="Scopes (comma-separated)"><Input value={form.scopes} onChange={(e) => setForm({ ...form, scopes: e.target.value })} /></Field>
            <Field label="Timeout (ms)"><Input type="number" value={form.timeout_ms} onChange={(e) => setForm({ ...form, timeout_ms: Number(e.target.value) })} /></Field>
            <Field label="Retry count"><Input type="number" value={form.retry_count} onChange={(e) => setForm({ ...form, retry_count: Number(e.target.value) })} /></Field>
          </div>
          <Field label="Description">
            <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <Field label="Notes (internal)">
            <Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.enabled}
              onChange={(e) => setForm({ ...form, enabled: e.target.checked })} />
            Enabled for production use
          </label>
        </TabsContent>

        <TabsContent value="secrets" className="space-y-3 pt-4">
          <p className="text-xs text-muted-foreground">
            Values are encrypted at rest. Leave blank to keep the saved value. Type a value to update, empty string to clear.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {SECRET_FIELDS.map((f) => (
              <Field key={f} label={f.replace(/_/g, " ")}>
                <Input type="password"
                  placeholder={platform.secrets_masked[f] ?? "not set"}
                  value={secretsPatch[f] ?? ""}
                  onChange={(e) => setSecretsPatch({ ...secretsPatch, [f]: e.target.value })} />
              </Field>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="endpoints" className="pt-4">
          <EndpointBuilder platformId={platform.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1 block text-xs capitalize text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
