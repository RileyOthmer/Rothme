import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, X, Check } from "lucide-react";
import { Wordmark } from "@/components/brand/Wordmark";

export const Route = createFileRoute("/why")({
  head: () => ({
    meta: [
      { title: "Why Velora — One workspace instead of ten tabs" },
      { name: "description", content: "Compare life without Velora to life with Velora. One dashboard, one AI, one workspace, one bill." },
      { property: "og:title", content: "Why Velora" },
      { property: "og:description", content: "Stop juggling dashboards. Velora replaces them with plain English." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Why,
});

const WITHOUT = [
  "Five tabs open, none of them agree",
  "A different login for every platform",
  "Reporting takes hours every week",
  "Teams work off different spreadsheets",
  "You spot problems days after they happened",
  "You pay for tools you barely use",
];

const WITH = [
  "One dashboard, one truth",
  "One workspace, one login",
  "Reports write themselves",
  "Everyone sees the same thing",
  "Alerts land the moment it matters",
  "One bill, one place, one team",
];

function Why() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/70">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/"><Wordmark /></Link>
          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/pricing" className="hover:text-foreground">Pricing</Link>
            <Link to="/get-started" className="inline-flex h-8 items-center gap-1 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground">Start free <ArrowRight className="h-3 w-3" /></Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 pt-20 pb-10 text-center sm:px-6 sm:pt-28">
        <span className="eyebrow">Why Velora</span>
        <h1 className="mt-6 font-serif text-4xl leading-tight text-foreground sm:text-6xl">
          The difference is what you don't do.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-muted-foreground">
          Velora replaces the ten tabs, the copy-pasting, and the "wait, which number is right?" — with one calm workspace.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-24 sm:px-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-surface p-8">
            <div className="flex items-center gap-2 text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="eyebrow">Without Velora</span>
            </div>
            <ul className="mt-6 space-y-3.5">
              {WITHOUT.map((item, idx) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-[15px] leading-relaxed text-foreground/70 animate-fade-in"
                  style={{ animationDelay: `${idx * 60}ms`, animationFillMode: "backwards" }}
                >
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/60" />
                  <span className="line-through decoration-muted-foreground/40">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-foreground/20 bg-surface p-8 shadow-md ring-1 ring-foreground/5">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-foreground" />
              <span className="eyebrow">With Velora</span>
            </div>
            <ul className="mt-6 space-y-3.5">
              {WITH.map((item, idx) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-[15px] leading-relaxed text-foreground animate-fade-in"
                  style={{ animationDelay: `${idx * 60 + 100}ms`, animationFillMode: "backwards" }}
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 text-center">
          <Link
            to="/get-started"
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:opacity-90"
          >
            Get my personalized plan <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-3 text-xs text-muted-foreground">Two minutes. No credit card.</p>
        </div>
      </section>
    </div>
  );
}
