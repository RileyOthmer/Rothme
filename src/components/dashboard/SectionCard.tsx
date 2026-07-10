import { type ReactNode, useState } from "react";
import { ChevronDown } from "lucide-react";

export type SectionCardProps = {
  eyebrow: string;
  whatHappened: ReactNode;
  why?: ReactNode;
  whatToDo?: ReactNode;
  action?: { label: string; onClick: () => void };
  advanced?: ReactNode;
  right?: ReactNode;
  children?: ReactNode;
};

export function SectionCard({
  eyebrow,
  whatHappened,
  why,
  whatToDo,
  action,
  advanced,
  right,
  children,
}: SectionCardProps) {
  const [showAdv, setShowAdv] = useState(false);
  return (
    <section className="rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-7">
      <div className="mb-4 flex items-start justify-between gap-4">
        <span className="eyebrow">{eyebrow}</span>
        {right}
      </div>

      <div className="text-xl font-medium leading-snug tracking-tight text-foreground sm:text-[22px]">
        {whatHappened}
      </div>

      {why ? (
        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{why}</p>
      ) : null}

      {whatToDo ? (
        <p className="mt-4 text-[15px] leading-relaxed text-foreground/90">
          <span className="eyebrow mr-2 align-middle">What to do</span>
          <span className="align-middle">{whatToDo}</span>
        </p>
      ) : null}

      {children ? <div className="mt-4">{children}</div> : null}

      {action ? (
        <div className="mt-6">
          <button
            type="button"
            onClick={action.onClick}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs transition-all duration-150 hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            {action.label}
          </button>
        </div>
      ) : null}

      {advanced ? (
        <div className="mt-6 border-t border-border pt-4">
          <button
            type="button"
            onClick={() => setShowAdv((v) => !v)}
            className="eyebrow inline-flex items-center gap-1 transition-colors hover:text-foreground"
          >
            {showAdv ? "Hide advanced" : "Show advanced"}
            <ChevronDown
              className={"h-3 w-3 transition-transform duration-150 " + (showAdv ? "rotate-180" : "")}
            />
          </button>
          {showAdv ? <div className="mt-3 animate-in fade-in duration-150">{advanced}</div> : null}
        </div>
      ) : null}
    </section>
  );
}
