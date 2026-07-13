import {
  Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";

import { ChartCard } from "../ChartCard";
import { campaigns } from "../data";

export function CampaignCompare() {
  return (
    <ChartCard
      title="Campaign comparison"
      description="Spend vs revenue side-by-side. Hover for ROAS and CTR."
      fileSlug="campaigns"
      csvRows={campaigns}
    >
      <div className="h-80 w-full">
        <ResponsiveContainer>
          <BarChart data={campaigns} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} width={54} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 10,
                fontSize: 12,
              }}
              formatter={(v: number, n) => {
                if (n === "spend" || n === "revenue") return [`$${v.toLocaleString()}`, n];
                return [v, n];
              }}
              labelFormatter={(l, payload) => {
                const c = payload?.[0]?.payload as (typeof campaigns)[number] | undefined;
                if (!c) return l;
                return `${l} · ROAS ${c.roas.toFixed(2)}x · CTR ${c.ctr}%`;
              }}
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="spend" name="Spend" fill="hsl(0 72% 60%)" radius={[6, 6, 0, 0]} animationDuration={700} />
            <Bar dataKey="revenue" name="Revenue" fill="hsl(150 62% 45%)" radius={[6, 6, 0, 0]} animationDuration={700} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
