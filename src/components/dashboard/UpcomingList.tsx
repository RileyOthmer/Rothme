import { toast } from "sonner";
import type { DashboardData } from "@/lib/dashboard-mock";

export function UpcomingList({ items }: { items: DashboardData["upcoming"] }) {
  return (
    <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
      <div className="eyebrow mb-4">Upcoming recommendations</div>
      <ul className="divide-y divide-border">
        {items.map((item) => (
          <li key={item.id} className="py-3 first:pt-0 last:pb-0">
            <div className="flex items-start gap-3">
              <div className="flex w-12 shrink-0 flex-col items-center rounded-md border border-border bg-surface-2 px-2 py-1.5">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {item.day}
                </span>
                <span className="text-[10px] text-muted-foreground">{item.date}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug text-foreground">{item.action}</p>
                <button
                  type="button"
                  onClick={() => toast(`Starting: ${item.cta.toLowerCase()}`)}
                  className="mt-2 inline-flex h-7 items-center rounded-md border border-border-strong bg-surface-2 px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  {item.cta}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
