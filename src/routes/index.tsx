import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Subtle radial accent */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 h-[520px] bg-[radial-gradient(ellipse_at_center,_color-mix(in_oklab,var(--primary)_25%,transparent)_0%,transparent_60%)]"
      />

      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-primary text-primary-foreground">
            <span className="text-[11px] font-bold">N</span>
          </span>
          <span className="text-sm font-semibold tracking-tight">Northstar</span>
        </div>
        <Link
          to="/dashboard"
          className="inline-flex h-8 items-center gap-1 rounded-md border border-border bg-surface px-3 text-xs font-medium hover:bg-surface-2"
        >
          Open dashboard
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </header>

      <main className="relative mx-auto max-w-3xl px-4 pb-24 pt-16 text-center sm:px-6 sm:pt-24">
        <span className="eyebrow">Marketing, made simple</span>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
          Know if your business
          <br />
          is <span className="text-primary">healthy</span>. In one glance.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Northstar reads your marketing for you and tells you — in plain English —
          what happened, why, and what to do next. No charts. No jargon.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/dashboard"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Open your dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
          <span className="text-xs text-muted-foreground">
            No setup — try it with sample data.
          </span>
        </div>
      </main>
    </div>
  );
}
