import type { DashboardData } from "@/lib/dashboard-mock";

export function UpcomingList({ items }: { items: DashboardData["upcoming"] }) {
  return (
    <section className="rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-7">
      <div className="eyebrow mb-4">Recent changes</div>
      <ul className="divide-y divide-border">
        {items.map((item) => (
          <li key={item.id} className="py-3.5 first:pt-0 last:pb-0">
            <div className="flex items-start gap-3">
              <div className="flex w-12 shrink-0 flex-col items-center rounded-md border border-border bg-surface-2 px-2 py-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground">
                  {item.day}
                </span>
                <span className="mt-0.5 text-[10px] text-muted-foreground">{item.date}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug text-foreground">{item.action}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-muted-foreground">
        Rothme reports observed changes across your connected platforms. It does not decide what to do next.
      </p>
    </section>
  );
}
