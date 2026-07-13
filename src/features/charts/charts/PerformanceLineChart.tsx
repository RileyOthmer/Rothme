import { useMemo, useState } from "react";
import {
  CartesianGrid, Legend, Line, LineChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis, Brush,
} from "recharts";

import { ChartCard } from "../ChartCard";
import { PLATFORMS, performanceSeries, type PlatformKey, type RangeDays } from "../data";
import { Toggle } from "@/components/ui/toggle";

export function PerformanceLineChart({ range }: { range: RangeDays }) {
  const [active, setActive] = useState<PlatformKey[]>(["instagram", "tiktok", "linkedin", "youtube"]);
  const rows = useMemo(() => performanceSeries(range, active), [range, active]);

  const toggle = (id: PlatformKey) =>
    setActive((cur) => (cur.includes(id) ? cur.filter((p) => p !== id) : [...cur, id]));

  return (
    <ChartCard
      title="Performance over time"
      description={`Daily reach across selected platforms — last ${range} days. Drag the brush to zoom.`}
      fileSlug={`performance-${range}d`}
      csvRows={rows}
      toolbar={
        <div className="flex flex-wrap gap-1">
          {PLATFORMS.map((p) => (
            <Toggle
              key={p.id}
              size="sm"
              pressed={active.includes(p.id)}
              onPressedChange={() => toggle(p.id)}
              className="h-7 rounded-full px-3 text-xs data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
            >
              <span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ background: p.color }} />
              {p.label}
            </Toggle>
          ))}
        </div>
      }
    >
      <div className="h-72 w-full">
        <ResponsiveContainer>
          <LineChart data={rows} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} width={44} />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 10,
                fontSize: 12,
              }}
              cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 1, strokeOpacity: 0.4 }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {active.map((id) => {
              const p = PLATFORMS.find((x) => x.id === id)!;
              return (
                <Line
                  key={id}
                  type="monotone"
                  dataKey={id}
                  name={p.label}
                  stroke={p.color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                  isAnimationActive
                  animationDuration={700}
                />
              );
            })}
            <Brush dataKey="day" height={22} travellerWidth={8} stroke="hsl(var(--primary))" fill="hsl(var(--muted))" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
