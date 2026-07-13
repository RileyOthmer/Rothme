import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { ChartCard } from "../ChartCard";
import { demographics } from "../data";

export function DemographicsDonut() {
  const total = demographics.reduce((s, d) => s + d.value, 0);
  return (
    <ChartCard
      title="Audience demographics"
      description="Share of your audience by age bracket."
      fileSlug="demographics"
      csvRows={demographics.map((d) => ({ age_range: d.name, percent: d.value }))}
    >
      <div className="h-72 w-full">
        <ResponsiveContainer>
          <PieChart>
            <Tooltip
              formatter={(v: number, n) => [`${v}%`, n]}
              contentStyle={{
                background: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 10,
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Pie
              data={demographics}
              dataKey="value"
              nameKey="name"
              innerRadius="55%"
              outerRadius="80%"
              paddingAngle={2}
              stroke="hsl(var(--background))"
              strokeWidth={2}
              animationDuration={700}
              label={({ name, value }) => `${name} · ${Math.round((value / total) * 100)}%`}
            >
              {demographics.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
