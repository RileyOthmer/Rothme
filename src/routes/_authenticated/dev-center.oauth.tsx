import { createFileRoute } from "@tanstack/react-router";
import { DevCenterShell } from "@/features/dev-center/DevCenterShell";
import { DEV_PLATFORMS } from "@/lib/dev-center/social-platforms";
import { Badge } from "@/components/ui/badge";
import { KeyRound } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dev-center/oauth")({
  component: OAuthPage,
});

function OAuthPage() {
  return (
    <DevCenterShell
      title="OAuth Manager"
      description="Every platform authorizes through its official OAuth flow. Tokens are refreshed server-side and encrypted at rest using INTEGRATION_ENCRYPTION_KEY."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {DEV_PLATFORMS.map((p) => (
          <article key={p.id} className="rounded-2xl border border-border/60 bg-card/40 p-4">
            <header className="mb-2 flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg text-[11px] font-semibold text-white" style={{ background: p.brandColor }}>{p.mark}</div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{p.name}</p>
                <p className="text-[11px] text-muted-foreground">API {p.apiVersion}</p>
              </div>
            </header>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="outline" className="rounded-full text-[11px]"><KeyRound className="mr-1 h-3 w-3" />OAuth 2.0</Badge>
              {p.capabilities.slice(0, 4).map((c) => (
                <Badge key={c} variant="outline" className="rounded-full text-[11px] text-muted-foreground">{c}</Badge>
              ))}
            </div>
          </article>
        ))}
      </div>
    </DevCenterShell>
  );
}
