import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Shield } from "lucide-react";
import { useState } from "react";
import { Wordmark } from "@/components/brand/Wordmark";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Velora" },
      { name: "description", content: "Simple, transparent pricing. Start free. Upgrade when Velora saves you time. Cancel in one click." },
      { property: "og:title", content: "Pricing — Velora" },
      { property: "og:description", content: "Four plans. Start free. Cancel anytime. 30-day money-back guarantee." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PricingPage,
});

type Plan = {
  name: string;
  monthly: number;
  tagline: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  contact?: boolean;
};

const PLANS: Plan[] = [
  {
    name: "Starter",
    monthly: 0,
    tagline: "For trying it on one account.",
    features: ["1 connected account", "Daily plain-English brief", "3 recommended tasks / day", "Weekly report"],
    cta: "Start free",
  },
  {
    name: "Professional",
    monthly: 49,
    tagline: "For running your whole marketing.",
    features: ["Unlimited connected accounts", "AI strategist", "Publishing & scheduling", "Custom reports", "Priority support"],
    cta: "Start 14-day trial",
    highlighted: true,
  },
  {
    name: "Agency",
    monthly: 199,
    tagline: "For managing multiple businesses.",
    features: ["Everything in Professional", "Unlimited workspaces", "Client roles & approvals", "White-label reports", "Dedicated onboarding"],
    cta: "Start 14-day trial",
  },
  {
    name: "Enterprise",
    monthly: 0,
    tagline: "For teams that need it all.",
    features: ["SSO / SAML", "Custom integrations", "Compliance review", "SLA & security review", "Dedicated success manager"],
    cta: "Talk to us",
    contact: true,
  },
];

const COMPARISON: { section: string; rows: { label: string; values: (string | boolean)[] }[] }[] = [
  {
    section: "Core",
    rows: [
      { label: "Connected accounts", values: ["1", "Unlimited", "Unlimited", "Unlimited"] },
      { label: "Daily AI brief", values: [true, true, true, true] },
      { label: "Weekly reports", values: [true, true, true, true] },
      { label: "Publishing & scheduling", values: [false, true, true, true] },
      { label: "Custom reports", values: [false, true, true, true] },
    ],
  },
  {
    section: "Team",
    rows: [
      { label: "Team members", values: ["1", "5", "Unlimited", "Unlimited"] },
      { label: "Roles & approvals", values: [false, true, true, true] },
      { label: "Client workspaces", values: [false, false, true, true] },
    ],
  },
  {
    section: "Enterprise",
    rows: [
      { label: "SSO / SAML", values: [false, false, false, true] },
      { label: "Custom integrations", values: [false, false, false, true] },
      { label: "Dedicated support", values: [false, false, false, true] },
    ],
  },
];

const FAQS = [
  { q: "Is there really a free plan?", a: "Yes. Starter is free forever on one account. No credit card, no time limit." },
  { q: "What's included in the 14-day trial?", a: "Everything in Professional. No card required to start. Cancel in one click." },
  { q: "What happens if I cancel?", a: "You keep access until the end of the billing period. We don't charge cancellation fees. Ever." },
  { q: "Do you offer a money-back guarantee?", a: "Yes. 30 days, no questions asked. Email support@velora.app and we'll refund you the same day." },
  { q: "How is my data protected?", a: "SOC 2 Type II, encrypted at rest and in transit, read-only permissions wherever possible. You can disconnect any account with one click." },
  { q: "Can I switch plans?", a: "Anytime, up or down. Upgrades are prorated. Downgrades take effect next cycle." },
];

function PricingPage() {
  const [yearly, setYearly] = useState(true);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/"><Wordmark /></Link>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <Link to="/why" className="hover:text-foreground">Why Velora</Link>
            <Link to="/pricing" className="text-foreground">Pricing</Link>
          </nav>
          <Link
            to="/get-started"
            className="inline-flex h-8 items-center gap-1 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground"
          >
            Start free <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 pt-20 pb-12 text-center sm:px-6 sm:pt-28">
        <span className="eyebrow">Pricing</span>
        <h1 className="mt-6 font-serif text-4xl leading-tight text-foreground sm:text-6xl">
          Priced like a tool you'd actually keep.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-muted-foreground">
          Start free. Upgrade when Velora saves you a few hours a week. Cancel in one click.
        </p>

        <div className="mt-10 inline-flex rounded-full border border-border bg-surface p-1 text-xs">
          <button
            onClick={() => setYearly(false)}
            className={
              "rounded-full px-4 py-1.5 font-medium transition-colors " +
              (yearly ? "text-muted-foreground" : "bg-foreground text-background")
            }
          >
            Monthly
          </button>
          <button
            onClick={() => setYearly(true)}
            className={
              "rounded-full px-4 py-1.5 font-medium transition-colors " +
              (yearly ? "bg-foreground text-background" : "text-muted-foreground")
            }
          >
            Yearly <span className="ml-1 opacity-70">− 20%</span>
          </button>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((p) => (
            <PlanCard key={p.name} plan={p} yearly={yearly} />
          ))}
        </div>
      </section>

      <section className="border-t border-border/70 bg-surface-2/40">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="font-serif text-3xl text-foreground sm:text-4xl">Compare plans</h2>
          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-4 text-sm font-semibold text-muted-foreground">Feature</th>
                  {PLANS.map((p) => (
                    <th key={p.name} className="py-4 text-sm font-semibold text-foreground">{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((s) => (
                  <>
                    <tr key={`h-${s.section}`}>
                      <td colSpan={5} className="pt-8 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {s.section}
                      </td>
                    </tr>
                    {s.rows.map((r) => (
                      <tr key={r.label} className="border-b border-border/50">
                        <td className="py-3 text-sm text-foreground">{r.label}</td>
                        {r.values.map((v, i) => (
                          <td key={i} className="py-3 text-sm text-foreground">
                            {typeof v === "boolean" ? (
                              v ? <Check className="h-4 w-4 text-foreground" /> : <span className="text-muted-foreground/40">—</span>
                            ) : v}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="border-t border-border/70">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
          <div className="rounded-2xl border border-border bg-surface p-8 text-center">
            <Shield className="mx-auto h-6 w-6 text-foreground/60" />
            <h3 className="mt-4 font-serif text-2xl text-foreground">30-day money-back guarantee.</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              If Velora doesn't save you time in the first month, email us and we'll refund you the same day.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-full border border-border px-3 py-1">SOC 2 Type II</span>
              <span className="rounded-full border border-border px-3 py-1">GDPR</span>
              <span className="rounded-full border border-border px-3 py-1">Encrypted at rest</span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border/70">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
          <h2 className="font-serif text-3xl text-foreground sm:text-4xl">Common questions</h2>
          <div className="mt-8 divide-y divide-border border-y border-border">
            {FAQS.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium text-foreground">
                  {f.q}
                  <span className="text-muted-foreground transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/get-started"
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:opacity-90"
            >
              Start free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function PlanCard({ plan, yearly }: { plan: Plan; yearly: boolean }) {
  const price = plan.contact ? "Custom" : plan.monthly === 0 ? "$0" : `$${yearly ? Math.round(plan.monthly * 0.8) : plan.monthly}`;
  const cadence = plan.contact ? "let's talk" : plan.monthly === 0 ? "free, forever" : yearly ? "per month, billed yearly" : "per month";

  return (
    <div
      className={
        "relative flex flex-col rounded-2xl border bg-surface p-6 shadow-xs " +
        (plan.highlighted ? "border-foreground/20 ring-1 ring-foreground/10 shadow-md" : "border-border")
      }
    >
      {plan.highlighted ? (
        <span className="absolute -top-2.5 left-6 rounded-full bg-foreground px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-background">
          Most popular
        </span>
      ) : null}
      <div>
        <div className="text-[13px] font-medium text-foreground">{plan.name}</div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="font-serif text-4xl text-foreground">{price}</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{cadence}</p>
        <p className="mt-3 text-sm text-muted-foreground">{plan.tagline}</p>
      </div>
      <ul className="mt-6 flex-1 space-y-2.5">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-foreground/90">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-foreground/50" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Link
        to={plan.contact ? "/get-started" : "/get-started"}
        className={
          "mt-6 inline-flex h-10 items-center justify-center gap-1 rounded-lg px-4 text-sm font-medium transition-all " +
          (plan.highlighted
            ? "bg-primary text-primary-foreground shadow-sm hover:opacity-90"
            : "border border-border bg-surface text-foreground hover:bg-surface-2")
        }
      >
        {plan.cta}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
