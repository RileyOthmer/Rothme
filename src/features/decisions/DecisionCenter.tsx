import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Sparkles, PartyPopper, Plug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DecisionCard } from "./DecisionCard";
import { SEED_DECISIONS } from "./seed";
import type { Decision, DecisionStatus } from "./types";

type Props = {
  firstName: string;
  hasConnections?: boolean;
};

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 } as const;

export function DecisionCenter({ firstName, hasConnections = true }: Props) {
  const [decisions, setDecisions] = useState<Decision[]>(SEED_DECISIONS);

  const visible = useMemo(
    () =>
      decisions
        .filter((d) => d.status === "open")
        .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]),
    [decisions],
  );

  const update = (id: string, status: DecisionStatus, msg: string) => {
    setDecisions((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)));
    toast.success(msg);
  };

  // Empty state — no connections
  if (!hasConnections) {
    return (
      <EmptyShell
        icon={<Plug className="h-6 w-6 text-primary" />}
        title={`Welcome, ${firstName}.`}
        body="Connect your first marketing platform and Velora will read the data, spot what changed, and tell you what to do about it — in plain English."
        cta={
          <Button asChild>
            <Link to="/settings/connections">Connect a platform</Link>
          </Button>
        }
      />
    );
  }

  // Empty state — nothing to decide
  if (visible.length === 0) {
    return (
      <EmptyShell
        icon={<PartyPopper className="h-6 w-6 text-emerald-500" />}
        title="You're on track."
        body="No decisions need your attention right now. Velora will surface something the moment it matters."
      />
    );
  }

  const highCount = visible.filter((d) => d.priority === "high").length;

  return (
    <section aria-labelledby="decision-heading" className="space-y-6">
      <header className="flex items-start gap-3">
        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <h1 id="decision-heading" className="text-2xl font-semibold tracking-tight text-foreground">
            Here's what to do today, {firstName}.
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {highCount > 0
              ? `${highCount} ${highCount === 1 ? "decision needs" : "decisions need"} your attention. Everything else can wait.`
              : "A short list of decisions worth making. Nothing urgent."}
          </p>
        </div>
      </header>

      <div className="space-y-4">
        {visible.map((d) => (
          <DecisionCard
            key={d.id}
            decision={d}
            onAccept={(id) => update(id, "accepted", "Nice — marked as done.")}
            onSnooze={(id) => update(id, "snoozed", "Snoozed until tomorrow.")}
            onDismiss={(id) => update(id, "dismissed", "Dismissed.")}
          />
        ))}
      </div>

      <p className="pt-2 text-center text-xs text-muted-foreground">
        Velora only surfaces decisions it's confident matter. If it's not here, it's not urgent.
      </p>
    </section>
  );
}

function EmptyShell({
  icon,
  title,
  body,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  cta?: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-10 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        {icon}
      </div>
      <h1 className="mt-4 text-xl font-semibold text-foreground">{title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
      {cta && <div className="mt-6">{cta}</div>}
    </div>
  );
}
