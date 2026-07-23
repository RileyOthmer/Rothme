import { createFileRoute } from "@tanstack/react-router";
import { DevCenterShell } from "@/features/dev-center/DevCenterShell";
import { Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const KNOWN = [
  { name: "INTEGRATION_ENCRYPTION_KEY", desc: "AES key used to encrypt OAuth tokens at rest." },
  { name: "OPENAI_API_KEY",             desc: "OpenAI (chat, summaries, insights)." },
  { name: "SUPABASE_URL",               desc: "Backend URL (server-side)." },
  { name: "SUPABASE_PUBLISHABLE_KEY",   desc: "Publishable key for backend Data API." },
  { name: "SUPABASE_SERVICE_ROLE_KEY",  desc: "Server-only; used by admin sync + webhook handlers." },
] as const;

export const Route = createFileRoute("/_authenticated/dev-center/secrets")({
  component: SecretsPage,
});

function SecretsPage() {
  return (
    <DevCenterShell
      title="Secrets Manager"
      description="Every secret is stored in the backend vault. Values are never revealed in the browser; provider tokens are additionally encrypted with the integration key."
    >
      <ul className="space-y-2">
        {KNOWN.map((s) => (
          <li key={s.name} className="flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-card/40 px-4 py-3">
            <div className="min-w-0 flex items-center gap-3">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <div className="min-w-0">
                <p className="font-mono text-sm">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </div>
            </div>
            <Badge variant="outline" className="rounded-full text-emerald-600 border-emerald-500/40">Configured</Badge>
          </li>
        ))}
      </ul>
    </DevCenterShell>
  );
}
