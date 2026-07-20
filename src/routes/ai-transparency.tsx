import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldCheck,
  Eye,
  GraduationCap,
  Hand,
  Lock,
  Sparkles,
  Check,
  X,
  Info,
  Database,
  BookOpen,
  TrendingUp,
  Heart,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/ai-transparency")({
  head: () => ({
    meta: [
      { title: "AI Transparency — Rothme" },
      {
        name: "description",
        content:
          "How Rothme's AI works, what it does and doesn't do, and how we protect your trust before automation.",
      },
      { property: "og:title", content: "AI Transparency — Rothme" },
      {
        property: "og:description",
        content:
          "At Rothme, trust comes before automation. Learn how our AI explains your marketing data — and what it will never do.",
      },
    ],
  }),
  component: AiTransparencyPage,
});

const philosophy = [
  { icon: ShieldCheck, title: "Accuracy over assumptions" },
  { icon: Eye, title: "Transparency over complexity" },
  { icon: GraduationCap, title: "Education over confusion" },
  { icon: Hand, title: "User control over automation" },
  { icon: Lock, title: "Security and privacy first" },
  { icon: Sparkles, title: "Trust before advanced AI" },
];

const doesList = [
  "Explains marketing metrics.",
  "Explains charts and reports.",
  "Explains marketing terminology.",
  "Explains Lead Audit findings.",
  "Explains connected integrations.",
  "Summarizes marketing performance using factual data from connected platforms.",
  "Answers questions about analytics and reports.",
  "Helps users understand marketing data in plain English.",
];

const doesNotList = [
  "Does not manage advertising campaigns.",
  "Does not change advertising budgets.",
  "Does not publish social media posts.",
  "Does not recommend marketing strategies.",
  "Does not recommend SEO strategies.",
  "Does not recommend pricing strategies.",
  "Does not recommend target audiences.",
  "Does not recommend posting schedules.",
  "Does not promise more leads.",
  "Does not promise more sales.",
  "Does not promise more revenue.",
  "Does not guarantee business growth.",
  "Does not make business decisions for users.",
  "Does not automatically change anything inside connected platforms.",
];

function AiTransparencyPage() {
  return (
    <main className="bg-background">
      {/* Hero */}
      <section className="mx-auto max-w-4xl px-4 pt-20 pb-14 text-center sm:px-6 sm:pt-28 sm:pb-20">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" />
          AI Transparency
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          AI Transparency
        </h1>
        <p className="mt-4 text-lg font-medium text-foreground sm:text-xl">
          At Rothme, trust comes before automation.
        </p>
        <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          Our AI is designed to help you understand your marketing data by
          explaining metrics, reports, charts, and connected platform
          information. Rothme does not make business decisions for you,
          modify your marketing campaigns, or guarantee business results.
        </p>
      </section>

      <div className="mx-auto max-w-5xl space-y-16 px-4 pb-24 sm:px-6 sm:space-y-20">
        {/* Philosophy */}
        <Section title="Our Philosophy" eyebrow="Principles">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {philosophy.map((p) => (
              <div
                key={p.title}
                className="group rounded-xl border border-border bg-surface p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <p.icon className="h-4.5 w-4.5" />
                </div>
                <div className="text-[15px] font-medium text-foreground">
                  {p.title}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Does / Does Not */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ListCard
            title="What Rothme AI Does"
            items={doesList}
            variant="success"
          />
          <ListCard
            title="What Rothme AI Does NOT Do"
            items={doesNotList}
            variant="danger"
          />
        </div>

        {/* User Control */}
        <InfoCard
          icon={Hand}
          eyebrow="User Control"
          title="You Stay In Control"
          tone="primary"
          body={[
            "Every business is different.",
            "Rothme is designed to help you understand your marketing performance through reliable analytics and educational explanations.",
            "All business decisions remain the responsibility of the account owner.",
            "Rothme will never automatically change your campaigns, marketing settings, advertising budgets, audiences, content, or connected platforms.",
          ]}
        />

        {/* Data Accuracy */}
        <InfoCard
          icon={Database}
          eyebrow="Data Accuracy"
          title="Where Your Data Comes From"
          body={[
            "Rothme displays data received directly from your connected marketing platforms and services.",
            "If a connected platform experiences delays, outages, API limitations, or inaccurate reporting, Rothme may display the same information received from that provider.",
            "Rothme does not create, modify, estimate, or manipulate your marketing data.",
          ]}
        />

        {/* Educational */}
        <InfoCard
          icon={BookOpen}
          eyebrow="Purpose"
          title="Educational Purpose"
          body={[
            "Rothme is built to help users understand marketing concepts and analytics through educational explanations.",
            "The information provided inside Rothme is intended for educational and informational purposes only.",
            "Nothing within Rothme should be interpreted as legal advice, financial advice, tax advice, or guaranteed marketing advice.",
          ]}
        />

        {/* AI Availability */}
        <InfoCard
          icon={TrendingUp}
          eyebrow="AI Availability"
          title="Continuous Improvement"
          body={[
            "Rothme's AI features will continue evolving over time.",
            "Features may be added, updated, improved, or removed as the platform grows.",
            "Our priority is maintaining accuracy, transparency, and user trust before introducing additional AI capabilities.",
          ]}
        />

        {/* Commitment — featured */}
        <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-surface to-surface p-8 shadow-sm sm:p-12">
          <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Heart className="h-5 w-5" />
          </div>
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Our Commitment
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Software you can trust.
          </h2>
          <div className="mt-4 max-w-2xl space-y-3 text-[15px] leading-relaxed text-muted-foreground">
            <p>We believe businesses deserve software they can trust.</p>
            <p>
              Before introducing advanced AI recommendations, Rothme is
              committed to providing reliable analytics, transparent
              reporting, educational explanations, and accurate monitoring
              tools.
            </p>
            <p>
              Our goal is to help businesses understand their marketing—not
              make decisions for them.
            </p>
          </div>
        </section>

        {/* Learn More */}
        <Section title="Learn More" eyebrow="Resources">
          <div className="flex flex-wrap gap-3">
            <LearnButton to="/why">Marketing Cheat Sheet</LearnButton>
            <LearnButton to="/get-started">Help Center</LearnButton>
            <LearnButton to="/pricing">Contact Support</LearnButton>
          </div>
        </Section>

        {/* Disclaimer */}
        <div className="rounded-xl border border-border bg-muted/40 p-6 text-xs leading-relaxed text-muted-foreground sm:p-8">
          <p>
            Rothme provides marketing analytics, monitoring tools, and
            educational explanations designed to help users better
            understand their marketing performance.
          </p>
          <p className="mt-2">
            Business outcomes depend on many factors outside Rothme,
            including products, services, pricing, competition, advertising
            strategy, customer experience, and market conditions.
          </p>
          <p className="mt-2">
            Rothme does not guarantee leads, sales, revenue, marketing
            performance, or business growth.
          </p>
        </div>
      </div>
    </main>
  );
}

function Section({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-6">
        {eyebrow ? (
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {eyebrow}
          </div>
        ) : null}
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function ListCard({
  title,
  items,
  variant,
}: {
  title: string;
  items: string[];
  variant: "success" | "danger";
}) {
  const isOk = variant === "success";
  const Icon = isOk ? Check : X;
  return (
    <div className="rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-7">
      <div className="mb-5 flex items-center gap-3">
        <div
          className={
            "inline-flex h-9 w-9 items-center justify-center rounded-lg " +
            (isOk
              ? "bg-[color-mix(in_oklab,var(--success)_14%,transparent)] text-[color:var(--success)]"
              : "bg-destructive/10 text-destructive")
          }
        >
          <Icon className="h-4.5 w-4.5" strokeWidth={2.5} />
        </div>
        <h3 className="text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h3>
      </div>
      <ul className="space-y-3">
        {items.map((it) => (
          <li key={it} className="flex items-start gap-3">
            <span
              className={
                "mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full " +
                (isOk
                  ? "bg-[color-mix(in_oklab,var(--success)_14%,transparent)] text-[color:var(--success)]"
                  : "bg-destructive/10 text-destructive")
              }
            >
              <Icon className="h-3 w-3" strokeWidth={3} />
            </span>
            <span className="text-[14px] leading-relaxed text-foreground/90">
              {it}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  eyebrow,
  title,
  body,
  tone = "default",
}: {
  icon: React.ComponentType<{ className?: string }>;
  eyebrow: string;
  title: string;
  body: string[];
  tone?: "default" | "primary";
}) {
  return (
    <section
      className={
        "rounded-xl border p-6 shadow-sm sm:p-8 " +
        (tone === "primary"
          ? "border-primary/20 bg-primary/5"
          : "border-border bg-surface")
      }
    >
      <div className="flex items-start gap-4">
        <div
          className={
            "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg " +
            (tone === "primary"
              ? "bg-primary text-primary-foreground"
              : "bg-primary/10 text-primary")
          }
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {eyebrow}
          </div>
          <h3 className="mt-1 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {title}
          </h3>
          <div className="mt-3 space-y-2 text-[15px] leading-relaxed text-muted-foreground">
            {body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function LearnButton({
  to,
  children,
}: {
  to: "/why" | "/get-started" | "/pricing";
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className="group inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground shadow-xs transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
    >
      {children}
      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
    </Link>
  );
}
