import { useMemo } from "react";

import { ChartCard } from "../ChartCard";
import { DAYS, heatmapData } from "../data";

export function PostingHeatmap() {
  const cells = useMemo(heatmapData, []);
  const csv = cells.map((c) => ({ day: c.day, hour: c.hour, engagement_score: c.value.toFixed(3) }));

  const best = [...cells].sort((a, b) => b.value - a.value)[0];

  return (
    <ChartCard
      title="Best posting days & times"
      description={`Darker = higher engagement. Peak window: ${best.day} at ${best.hour.toString().padStart(2, "0")}:00.`}
      fileSlug="posting-heatmap"
      csvRows={csv}
    >
      <div className="overflow-x-auto">
        <div className="min-w-[560px]">
          <div className="grid grid-cols-[36px_repeat(24,1fr)] gap-[3px]">
            <div />
            {Array.from({ length: 24 }).map((_, h) => (
              <div key={h} className="text-center text-[10px] text-muted-foreground">
                {h % 3 === 0 ? h : ""}
              </div>
            ))}
            {DAYS.map((day) => (
              <div key={day} className="contents">
                <div className="flex items-center text-[11px] text-muted-foreground">{day}</div>
                {Array.from({ length: 24 }).map((_, h) => {
                  const cell = cells.find((c) => c.day === day && c.hour === h)!;
                  const alpha = 0.08 + cell.value * 0.92;
                  return (
                    <div
                      key={`${day}-${h}`}
                      title={`${day} ${h.toString().padStart(2, "0")}:00 — score ${cell.value.toFixed(2)}`}
                      className="h-6 rounded-sm transition-transform hover:scale-125 hover:ring-2 hover:ring-primary/60"
                      style={{ backgroundColor: `hsl(var(--primary) / ${alpha})` }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-[2px]">
              {[0.1, 0.3, 0.5, 0.7, 0.9].map((a) => (
                <div key={a} className="h-3 w-6 rounded-sm" style={{ backgroundColor: `hsl(var(--primary) / ${a})` }} />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
    </ChartCard>
  );
}
