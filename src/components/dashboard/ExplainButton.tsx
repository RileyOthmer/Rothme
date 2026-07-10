import { type ReactNode, useState } from "react";
import { ChevronDown } from "lucide-react";

/**
 * A "Why did this happen?" style disclosure.
 * Renders a small link-styled trigger and inline plain-English content.
 */
export function ExplainButton({
  label = "Why did this happen?",
  openLabel = "Hide explanation",
  children,
}: {
  label?: string;
  openLabel?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:opacity-80"
      >
        {open ? openLabel : label}
        <ChevronDown
          className={"h-3.5 w-3.5 transition-transform " + (open ? "rotate-180" : "")}
        />
      </button>
      {open ? (
        <div className="mt-3 rounded-md border border-border bg-surface-2 p-3 text-sm leading-relaxed text-muted-foreground">
          {children}
        </div>
      ) : null}
    </div>
  );
}
