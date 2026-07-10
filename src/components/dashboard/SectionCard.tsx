import { type ReactNode, useState } from "react";
import { ChevronDown } from "lucide-react";

export type SectionCardProps = {
  eyebrow: string;
  whatHappened: ReactNode;
  why?: ReactNode;
  whatToDo?: ReactNode;
  action?: { label: string; onClick: () => void };
  advanced?: ReactNode;
  tone?: "default" | "success" | "warning" | "danger";
  children?: ReactNode;
};

const toneRing: Record<NonNullable<SectionCardProps["tone"]>, string> = {
  default: "",
  success: "before:bg-success",
  warning: "before:bg-warning",
  danger: "before:bg-danger",
};

export function SectionCard({
  eyebrow,
  whatHappened,
  why,
  whatToDo,
  action,
  advanced,
  tone = "default",
  children,
}: SectionCardProps) {
  const [showAdv, setShowAdv] = useState(false);
  return (
    <section
      className={
        "relative overflow-hidden rounded-xl border border-border bg-surface p-5 sm:p-6 " +
        "before:absolute before:inset-y-0 before:left-0 before:w-[2px] " +
        toneRing[tone]
      }
    >
      <div className="eyebrow mb-3">{eyebrow}</div>

      <div className="text-lg font-medium leading-snug text-foreground sm:text-xl">
        {whatHappened}
      </div>

      {why ? (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
          {why}
        </p>
      ) : null}

      {whatToDo ? (
        <p className="mt-3 text-sm leading-relaxed text-foreground/90 sm:text-[15px]">
          <span className="eyebrow mr-2 align-middle">What to do</span>
          <span className="align-middle">{whatToDo}</span>
        </p>
      ) : null}

      {children ? <div className="mt-4">{children}</div> : null}

      {action ? (
        <div className="mt-5">
          <button
            type="button"
            onClick={action.onClick}
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {action.label}
          </button>
        </div>
      ) : null}

      {advanced ? (
        <div className="mt-5 border-t border-border pt-4">
          <button
            type="button"
            onClick={() => setShowAdv((v) => !v)}
            className="eyebrow inline-flex items-center gap-1 transition-colors hover:text-foreground"
          >
            {showAdv ? "Hide advanced" : "Show advanced"}
            <ChevronDown
              className={"h-3 w-3 transition-transform " + (showAdv ? "rotate-180" : "")}
            />
          </button>
          {showAdv ? <div className="mt-3">{advanced}</div> : null}
        </div>
      ) : null}
    </section>
  );
}
