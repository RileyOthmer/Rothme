import { useMemo } from "react";
import {
  Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer,
  Tooltip, XAxis, YAxis, Brush,
} from "recharts";

import { ChartCard } from "../ChartCard";
import { organicVsPaid, type RangeDays } from "../data";

export function OrganicVsPaid({ range }: { range: RangeDays }) {
  const rows = useMemo(() => organicVsPaid(range), [range]);
  return (
    <ChartCard
      title="Organic vs Paid growth"
      description={`Stacked daily contribution over the last ${range} days.`}
      fileSlug={`organic-vs-paid-${range}d`}
      csvRows={rows}
    >
      <div className="h-72 w-full">
        <ResponsiveContainer>
          <AreaChart data={rows} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="g-organic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(160 72% 45%)" stopOpacity={0.7} />
                <stop offset="100%" stopColor="hsl(160 72% 45%)" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="g-paid" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(280 72% 60%)" stopOpacity={0.7} />
                <stop offset="100%" stopColor="hsl(280 72% 60%)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
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
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="organic" name="Organic" stackId="1" stroke="hsl(160 72% 45%)" fill="url(#g-organic)" animationDuration={700} />
            <Area type="monotone" dataKey="paid" name="Paid" stackId="1" stroke="hsl(280 72% 60%)" fill="url(#g-paid)" animationDuration={700} />
            <Brush dataKey="day" height={22} travellerWidth={8} stroke="hsl(var(--primary))" fill="hsl(var(--muted))" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
