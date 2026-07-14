import { createFileRoute } from "@tanstack/react-router";
import { DevCenterShell } from "@/features/dev-center/DevCenterShell";
import { DEV_PLATFORMS } from "@/lib/dev-center/social-platforms";
import { Badge } from "@/components/ui/badge";

const FEATURES = ["text","image","video","reels","shorts","stories","scheduled","drafts"] as const;

function supports(p: (typeof DEV_PLATFORMS)[number], feat: (typeof FEATURES)[number]): boolean {
  const caps = p.capabilities;
  switch (feat) {
    case "text":      return caps.includes("publish");
    case "image":     return caps.includes("media");
    case "video":     return caps.includes("media") && (p.category === "video" || caps.includes("reels"));
    case "reels":     return caps.includes("reels");
    case "shorts":    return p.id === "youtube";
    case "stories":   return caps.includes("stories");
    case "scheduled": return caps.includes("publish");
    case "drafts":    return caps.includes("publish");
  }
}

export const Route = createFileRoute("/_authenticated/dev-center/publishing")({
  component: PublishingCapabilitiesPage,
});

function PublishingCapabilitiesPage() {
  return (
    <DevCenterShell
      title="Publishing"
      description="Publishing capabilities detected per platform. Only officially supported post types are enabled."
    >
      <div className="overflow-hidden rounded-2xl border border-border/60">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-2 text-left">Platform</th>
              {FEATURES.map((f) => <th key={f} className="px-3 py-2 text-center">{f}</th>)}
            </tr>
          </thead>
          <tbody>
            {DEV_PLATFORMS.map((p) => (
              <tr key={p.id} className="border-t border-border/50">
                <td className="px-4 py-2 font-medium">{p.name}</td>
                {FEATURES.map((f) => (
                  <td key={f} className="px-3 py-2 text-center">
                    {supports(p, f) ? (
                      <Badge variant="outline" className="rounded-full text-emerald-600 border-emerald-500/40">✓</Badge>
                    ) : (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DevCenterShell>
  );
}
