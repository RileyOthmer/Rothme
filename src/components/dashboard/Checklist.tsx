import { Check } from "lucide-react";
import { useChecklist } from "@/hooks/use-checklist";

export type ChecklistItem = {
  id: string;
  title: string;
  why?: string;
  action?: string;
};

export function Checklist({
  storageKey,
  items,
  onAction,
}: {
  storageKey: string;
  items: ChecklistItem[];
  onAction?: (item: ChecklistItem) => void;
}) {
  const { checked, toggle } = useChecklist(storageKey);

  return (
    <ul className="divide-y divide-border">
      {items.map((item) => {
        const done = checked.has(item.id);
        return (
          <li key={item.id} className="py-3 first:pt-0 last:pb-0">
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => toggle(item.id)}
                aria-pressed={done}
                aria-label={done ? "Mark not done" : "Mark done"}
                className={
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors " +
                  (done
                    ? "border-success bg-success text-success-foreground"
                    : "border-border-strong bg-surface-2 hover:border-foreground/40")
                }
              >
                {done ? <Check className="h-3.5 w-3.5" /> : null}
              </button>
              <div className="min-w-0 flex-1">
                <div
                  className={
                    "text-sm font-medium leading-snug transition-colors " +
                    (done ? "text-muted-foreground line-through" : "text-foreground")
                  }
                >
                  {item.title}
                </div>
                {item.why ? (
                  <div className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {item.why}
                  </div>
                ) : null}
                {item.action && onAction && !done ? (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => onAction(item)}
                      className="inline-flex h-7 items-center rounded-md border border-border-strong bg-surface-2 px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
                    >
                      {item.action}
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
