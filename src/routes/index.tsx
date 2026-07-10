import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Eye, HelpCircle, ListChecks } from "lucide-react";
import { Wordmark } from "@/components/brand/Wordmark";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Wordmark />
        <Link
          to="/dashboard"
          className="inline-flex h-8 items-center gap-1 rounded-md border border-border bg-surface px-3 text-xs font-medium text-foreground shadow-xs transition-all duration-150 hover:bg-surface-2"
        >
          Open dashboard
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-24 pt-20 text-center sm:px-6 sm:pt-28">
        <span className="eyebrow">Marketing, made simple</span>
        <h1 className="mt-6 text-[44px] font-medium leading-[1.05] tracking-tight text-foreground sm:text-[64px]">
          Know if your business is{" "}
          <span className="font-serif italic font-normal">healthy</span>.
          <br className="hidden sm:block" /> In one glance.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-muted-foreground">
          Northstar reads your marketing for you and tells you — in plain English —
          what happened, why, and what to do next. No charts. No jargon.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/dashboard"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-150 hover:opacity-90"
          >
            Open your dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
          <span className="text-xs text-muted-foreground">
            No setup — try it with sample data.
          </span>
        </div>
      </main>

      <section className="mx-auto max-w-5xl px-4 pb-32 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: Eye,
              title: "What happened",
              body: "One clear sentence, every morning. No dashboards to read.",
            },
            {
              icon: HelpCircle,
              title: "Why",
              body: "The reason behind the number, explained like a friend would.",
            },
            {
              icon: ListChecks,
              title: "What to do",
              body: "Three small tasks a day. Each one done for you if you'd like.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-xl border border-border bg-surface p-6 shadow-sm transition-all duration-150 hover:-translate-y-[1px] hover:shadow-md"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface-2 text-foreground/70">
                <Icon className="h-4 w-4" />
              </span>
              <h3 className="mt-4 text-[15px] font-semibold tracking-tight text-foreground">
                {title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 text-xs text-muted-foreground sm:px-6">
          <Wordmark />
          <span>Plain-English marketing, for business owners.</span>
        </div>
      </footer>
    </div>
  );
}
