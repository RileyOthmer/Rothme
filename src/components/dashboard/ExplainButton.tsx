import { type ReactNode, useState } from "react";
import { ChevronDown } from "lucide-react";

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
        className="inline-flex items-center gap-1 text-sm font-medium text-foreground underline-offset-4 transition-colors hover:underline"
      >
        {open ? openLabel : label}
        <ChevronDown
          className={
            "h-3.5 w-3.5 transition-transform duration-150 " + (open ? "rotate-180" : "")
          }
        />
      </button>
      {open ? (
        <div className="mt-3 animate-in fade-in duration-150 rounded-lg border border-border bg-surface-2 p-3.5 text-sm leading-relaxed text-muted-foreground">
          {children}
        </div>
      ) : null}
    </div>
  );
}
