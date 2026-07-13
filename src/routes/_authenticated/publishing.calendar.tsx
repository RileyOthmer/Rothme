import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { listPosts } from "@/lib/publishing/publishing.functions";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/publishing/calendar")({
  component: CalendarPage,
});

function CalendarPage() {
  const fn = useServerFn(listPosts);
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  const { data } = useQuery({
    queryKey: ["publishing", "calendar", cursor.toISOString()],
    queryFn: () => fn({ data: { limit: 500 } }),
  });

  const cells = useMemo(() => buildMonth(cursor), [cursor]);
  const schedules = useMemo(() => {
    const list = (data ?? []).flatMap((p: any) =>
      (p.post_schedules ?? []).map((s: any) => ({ post: p, schedule: s })),
    );
    const map = new Map<string, { post: any; schedule: any }[]>();
    for (const item of list) {
      const key = new Date(item.schedule.scheduled_at).toDateString();
      const arr = map.get(key) ?? [];
      arr.push(item);
      map.set(key, arr);
    }
    return map;
  }, [data]);

  const monthLabel = cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-medium">{monthLabel}</h2>
        <div className="flex gap-1">
          <Button variant="outline" size="icon" onClick={() => setCursor(shiftMonth(cursor, -1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCursor(startOfMonth(new Date()))}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={() => setCursor(shiftMonth(cursor, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-border bg-border">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="bg-surface px-2 py-1 text-[11px] font-medium uppercase text-muted-foreground">
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          const key = day.toDateString();
          const items = schedules.get(key) ?? [];
          const isCurrent = day.getMonth() === cursor.getMonth();
          const today = day.toDateString() === new Date().toDateString();
          return (
            <div
              key={i}
              className={
                "min-h-[100px] bg-background p-1.5 text-xs " +
                (isCurrent ? "" : "opacity-40")
              }
            >
              <div className={"mb-1 text-[11px] " + (today ? "font-semibold text-primary" : "text-muted-foreground")}>
                {day.getDate()}
              </div>
              <div className="space-y-1">
                {items.slice(0, 3).map(({ post, schedule }) => (
                  <div
                    key={schedule.id}
                    className="truncate rounded bg-surface px-1.5 py-0.5 text-[11px]"
                    title={post.title || post.body}
                  >
                    <span className="mr-1 uppercase text-muted-foreground">{schedule.platform_id.slice(0, 3)}</span>
                    {post.title || post.body.slice(0, 40) || "Untitled"}
                  </div>
                ))}
                {items.length > 3 ? (
                  <div className="text-[11px] text-muted-foreground">+{items.length - 3} more</div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function startOfMonth(d: Date) {
  const x = new Date(d);
  x.setDate(1);
  x.setHours(0, 0, 0, 0);
  return x;
}
function shiftMonth(d: Date, n: number) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
}
function buildMonth(anchor: Date) {
  const start = startOfMonth(anchor);
  const first = new Date(start);
  first.setDate(1 - start.getDay());
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(first);
    d.setDate(first.getDate() + i);
    return d;
  });
}
