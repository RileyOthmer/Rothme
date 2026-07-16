import { Link } from "@tanstack/react-router";
import { Sparkles, ArrowRight } from "lucide-react";

import { AppHeader } from "@/components/layout/AppHeader";
import { AnalyticsHubNav } from "@/features/analytics/AnalyticsHubNav";

export function ComingSoonHub({
  title,
  subtitle,
  phase,
  kpis,
  charts,
}: {
  title: string;
  subtitle: string;
  phase: 2 | 3 | 4 | 5;
  kpis: string[];
  charts: string[];
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Analytics Center
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
        </div>

        <AnalyticsHubNav />

        <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-transparent to-transparent p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3 w-3" />
            Shipping in Phase {phase}
          </div>
          <h2 className="text-xl font-semibold tracking-tight">
            Everything that will live here
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            The Analytics Center is being built in phases so every screen ships production-ready.
            Here is exactly what this hub will do when it lands.
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                KPIs
              </h3>
              <ul className="space-y-1.5">
                {kpis.map((k) => (
                  <li key={k} className="flex items-start gap-2 text-sm">
                    <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-primary" />
                    <span>{k}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Visualizations
              </h3>
              <ul className="space-y-1.5">
                {charts.map((c) => (
                  <li key={c} className="flex items-start gap-2 text-sm">
                    <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-primary" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/analytics/overview"
              search={{ range: "30d", from: "", to: "", platforms: [] }}
              className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-2 text-xs font-medium text-background hover:opacity-90"
            >
              Go to Overview <ArrowRight className="h-3 w-3" />
            </Link>
            <Link
              to="/settings/plugins"
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-medium hover:bg-muted"
            >
              Connect plugins first
            </Link>
          </div>
        </section>

        <p className="text-xs text-muted-foreground">
          Building in phases keeps the whole product honest — every hub that ships is powered by real KPI metadata from your installed plugins, never mocked shells.
        </p>
      </main>
    </div>
  );
}
