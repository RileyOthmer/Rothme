import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { Lock, Plus, ShieldCheck } from "lucide-react";
import { toast, Toaster } from "sonner";

import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

import { listPlatforms, upsertPlatform } from "@/lib/dev-center/dev-center.functions";
import { claimFirstAdmin, isAdmin } from "@/lib/integrations/integrations.functions";
import { PlatformEditor } from "@/features/dev-center/PlatformEditor";

export const Route = createFileRoute("/_authenticated/settings/developer")({
  head: () => ({
    meta: [
      { title: "Developer Center — ROTHME" },
      { name: "description", content: "Admin-only integration engine: add any platform, wire endpoints, and map API fields to ROTHME KPIs." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DeveloperCenter,
});

function DeveloperCenter() {
  const adminFn  = useServerFn(isAdmin);
  const claimFn  = useServerFn(claimFirstAdmin);
  const listFn   = useServerFn(listPlatforms);

  const adminQ = useQuery({
    queryKey: ["is-admin"], queryFn: () => adminFn(), staleTime: 60_000,
  });
  const platformsQ = useQuery({
    queryKey: ["platforms"], queryFn: () => listFn(),
    enabled: adminQ.data?.isAdmin === true,
  });

  const [claiming, setClaiming] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  if (adminQ.isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AppHeader />
        <main className="mx-auto max-w-5xl px-4 py-14 text-sm text-muted-foreground">Loading…</main>
      </div>
    );
  }

  if (!adminQ.data?.isAdmin) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AppHeader />
        <main className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-muted">
            <Lock className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Developer Center</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This area is restricted to workspace administrators.
            </p>
          </div>
          <Button
            onClick={async () => {
              setClaiming(true);
              try {
                const { claimed } = await claimFn();
                if (claimed) toast.success("Admin claimed");
                adminQ.refetch();
              } finally { setClaiming(false); }
            }}
            disabled={claiming}
          >
            <ShieldCheck className="mr-2 h-4 w-4" />
            {claiming ? "Checking…" : "Claim admin access"}
          </Button>
          <p className="text-[11px] text-muted-foreground">
            Only works when no admin exists yet.
          </p>
        </main>
      </div>
    );
  }

  const platforms = platformsQ.data ?? [];
  const active = selected ? platforms.find(p => p.id === selected) : platforms[0];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Admin</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Developer Center</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Modular integration engine. Add any platform, wire unlimited endpoints, test them, and click JSON fields to map them to ROTHME KPIs — no code.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="rounded-full">
              <ShieldCheck className="mr-1 h-3 w-3" /> Admin
            </Badge>
            <NewPlatformDialog onCreated={(id) => { platformsQ.refetch(); setSelected(id); }} />
          </div>
        </header>

        {platforms.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 p-12 text-center">
            <h2 className="text-lg font-semibold">No platforms yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Create your first integration to start wiring endpoints and mapping KPIs.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
            <aside className="rounded-2xl border border-border/60 bg-card/40 p-2">
              <ul className="space-y-0.5">
                {platforms.map((p) => {
                  const isSelected = (active?.id ?? "") === p.id;
                  return (
                    <li key={p.id}>
                      <button type="button"
                        onClick={() => setSelected(p.id)}
                        className={
                          "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition " +
                          (isSelected ? "bg-primary/10 text-foreground" : "hover:bg-muted/60 text-muted-foreground")
                        }
                      >
                        <span className="min-w-0 truncate">{p.name}</span>
                        <span className={
                          "h-1.5 w-1.5 shrink-0 rounded-full " +
                          (p.status === "verified" ? "bg-emerald-500"
                           : p.status === "tested" ? "bg-blue-500"
                           : p.status === "error"  ? "bg-red-500"
                           : "bg-muted-foreground/40")
                        } />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </aside>

            <section className="rounded-2xl border border-border/60 bg-card/40 p-6">
              {active ? <PlatformEditor key={active.id} platform={active} /> : null}
            </section>
          </div>
        )}
      </main>
      <Toaster theme="dark" position="bottom-right" />
    </div>
  );
}

// ---- New-platform dialog ---------------------------------------------------

function NewPlatformDialog({ onCreated }: { onCreated: (id: string) => void }) {
  const saveFn = useServerFn(upsertPlatform);
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [auth, setAuth] = useState<"none" | "api_key" | "bearer" | "basic" | "jwt" | "oauth2" | "oauth2_pkce" | "webhook_only" | "custom">("bearer");
  const [busy, setBusy] = useState(false);

  async function create() {
    if (!name || !slug) { toast.error("Name and slug required"); return; }
    setBusy(true);
    try {
      const { id } = await saveFn({ data: {
        slug, name, auth_type: auth,
        scopes: [], default_headers: {}, rate_limit: {},
        timeout_ms: 10000, retry_count: 0, enabled: false,
        secrets_patch: {},
      } });
      await qc.invalidateQueries({ queryKey: ["platforms"] });
      onCreated(id);
      setOpen(false); setName(""); setSlug("");
      toast.success("Platform created");
    } catch (e) { toast.error((e as Error).message); }
    finally { setBusy(false); }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="mr-2 h-3.5 w-3.5" /> New platform</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add a new integration</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Name</Label>
            <Input value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
              }}
              placeholder="Instagram" />
          </div>
          <div>
            <Label>Slug</Label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="instagram" />
          </div>
          <div>
            <Label>Authentication</Label>
            <Select value={auth} onValueChange={(v) => setAuth(v as typeof auth)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                <SelectItem value="oauth2_pkce">OAuth 2.0 PKCE</SelectItem>
                <SelectItem value="bearer">Bearer Token</SelectItem>
                <SelectItem value="api_key">API Key</SelectItem>
                <SelectItem value="basic">Basic Auth</SelectItem>
                <SelectItem value="jwt">JWT</SelectItem>
                <SelectItem value="webhook_only">Webhook-only</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={create} disabled={busy}>{busy ? "Creating…" : "Create"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
