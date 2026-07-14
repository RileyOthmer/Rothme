import { createFileRoute } from "@tanstack/react-router";
import { DevCenterShell } from "@/features/dev-center/DevCenterShell";
import { DEV_PLATFORMS } from "@/lib/dev-center/social-platforms";

const VELORA_METRICS = ["followers","reach","impressions","engagement","likes","comments","shares","saves","profile_visits","website_clicks","video_views","watch_time"];

export const Route = createFileRoute("/_authenticated/dev-center/analytics-mapping")({
  component: AnalyticsMappingPage,
});

function AnalyticsMappingPage() {
  return (
    <DevCenterShell
      title="Analytics Mapping"
      description="Map each provider's returned metric to ROTHME's unified reporting schema. Only supported metrics for each platform are shown."
    >
      <div className="space-y-4">
        {DEV_PLATFORMS.filter((p) => p.capabilities.includes("analytics")).map((p) => (
          <section key={p.id} className="rounded-2xl border border-border/60 bg-card/40">
            <header className="flex items-center gap-2 border-b border-border/50 px-4 py-3">
              <div className="grid h-7 w-7 place-items-center rounded-md text-[11px] font-semibold text-white" style={{ background: p.brandColor }}>{p.mark}</div>
              <h3 className="text-sm font-semibold">{p.name}</h3>
              <span className="text-xs text-muted-foreground">API {p.apiVersion}</span>
            </header>
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 text-left">Platform metric</th>
                  <th className="px-4 py-2 text-left">ROTHME metric</th>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-left">Sample</th>
                  <th className="px-4 py-2 text-left">Validation</th>
                </tr>
              </thead>
              <tbody>
                {VELORA_METRICS.slice(0, 6).map((m) => (
                  <tr key={m} className="border-t border-border/40">
                    <td className="px-4 py-2 font-mono text-xs">{m}</td>
                    <td className="px-4 py-2">{m}</td>
                    <td className="px-4 py-2 text-muted-foreground">integer</td>
                    <td className="px-4 py-2 text-muted-foreground">—</td>
                    <td className="px-4 py-2 text-xs text-muted-foreground">Awaiting first sync</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))}
      </div>
    </DevCenterShell>
  );
}
