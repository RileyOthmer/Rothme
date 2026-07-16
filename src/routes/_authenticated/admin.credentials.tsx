import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listAdminCredentials, upsertAdminCredential, deleteAdminCredential, listInfraSecrets, type CredentialStatus } from "@/lib/admin/credentials.functions";
import { CheckCircle2, XCircle, Database, Server, ExternalLink, Trash2, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/credentials")({
  component: CredentialsPage,
});

function CredentialsPage() {
  const list = useServerFn(listAdminCredentials);
  const infraFn = useServerFn(listInfraSecrets);
  const q = useQuery({ queryKey: ["admin", "credentials"], queryFn: () => list({}) });
  const qInfra = useQuery({ queryKey: ["admin", "infra-secrets"], queryFn: () => infraFn({}) });

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-3">
          <h2 className="text-sm font-semibold">Social platform credentials</h2>
          <p className="text-xs text-muted-foreground">Client ID and secret per platform. Values are encrypted at rest and never returned in full.</p>
        </div>
        {q.isLoading ? (
          <div className="rounded-xl border border-border bg-surface p-6 text-sm text-muted-foreground">Loading…</div>
        ) : q.error ? (
          <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">{(q.error as Error).message}</div>
        ) : (
          <div className="grid gap-3">
            {(q.data ?? []).map((c) => <CredentialRow key={c.platformId} c={c} />)}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3">
          <h2 className="text-sm font-semibold">Infrastructure secrets</h2>
          <p className="text-xs text-muted-foreground">Managed in the Lovable secret store. Values are never displayed here.</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {(qInfra.data ?? []).map((s) => (
            <div key={s.name} className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3">
              <div className="flex items-center gap-2">
                <Server className="h-3.5 w-3.5 text-muted-foreground" />
                <code className="text-xs">{s.name}</code>
              </div>
              {s.configured ? (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-500"><CheckCircle2 className="h-3.5 w-3.5" /> Set</span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><XCircle className="h-3.5 w-3.5" /> Missing</span>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function CredentialRow({ c }: { c: CredentialStatus }) {
  const upsert = useServerFn(upsertAdminCredential);
  const del = useServerFn(deleteAdminCredential);
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");

  const save = useMutation({
    mutationFn: () => upsert({ data: { platformId: c.platformId, clientId: clientId || undefined, clientSecret: clientSecret || undefined } }),
    onSuccess: () => {
      toast.success(`${c.name} credentials saved`);
      setClientId(""); setClientSecret(""); setExpanded(false);
      qc.invalidateQueries({ queryKey: ["admin", "credentials"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: () => del({ data: { platformId: c.platformId } }),
    onSuccess: () => {
      toast.success(`${c.name} credentials removed (env fallback restored)`);
      qc.invalidateQueries({ queryKey: ["admin", "credentials"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="rounded-xl border border-border bg-surface">
      <button
        onClick={() => setExpanded((x) => !x)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <div
          className="grid h-9 w-9 place-items-center rounded-lg text-[10px] font-semibold text-white"
          style={{ backgroundColor: c.brandColor }}
        >
          {c.mark}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{c.name}</span>
            <SourceBadge source={c.source} />
          </div>
          <div className="text-xs text-muted-foreground">
            {c.configured
              ? c.source === "db"
                ? `ID ••••${c.clientIdLast4 ?? "----"} · Secret ••••${c.clientSecretLast4 ?? "----"}`
                : `Loaded from env: ${c.clientIdEnv} / ${c.clientSecretEnv}`
              : "Not configured — awaiting credentials"}
          </div>
        </div>
        <span className="text-xs text-muted-foreground">{expanded ? "Close" : "Edit"}</span>
      </button>

      {expanded ? (
        <div className="border-t border-border px-4 py-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs">
              <span className="mb-1 block text-muted-foreground">Client ID</span>
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder={c.source === "db" ? "Leave blank to keep current" : "Paste client ID"}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                autoComplete="off"
              />
            </label>
            <label className="text-xs">
              <span className="mb-1 block text-muted-foreground">Client Secret</span>
              <input
                type="password"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                placeholder={c.source === "db" ? "Leave blank to keep current" : "Paste client secret"}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                autoComplete="off"
              />
            </label>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <a href={c.docsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              Developer docs <ExternalLink className="h-3 w-3" />
            </a>
            <div className="flex items-center gap-2">
              {c.source === "db" ? (
                <button
                  type="button"
                  onClick={() => remove.mutate()}
                  disabled={remove.isPending}
                  className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-xs font-medium text-destructive hover:bg-destructive/5 disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => save.mutate()}
                disabled={save.isPending || (!clientId && !clientSecret)}
                className="inline-flex h-8 items-center gap-1.5 rounded-md bg-foreground px-3 text-xs font-medium text-background disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" /> {save.isPending ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SourceBadge({ source }: { source: "db" | "env" | "none" }) {
  if (source === "db")
    return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-500"><Database className="h-3 w-3" /> DB</span>;
  if (source === "env")
    return <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-500"><Server className="h-3 w-3" /> ENV</span>;
  return <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">Not set</span>;
}
