import { Funnel, FunnelChart, LabelList, ResponsiveContainer, Tooltip, Cell } from "recharts";

import { ChartCard } from "../ChartCard";
import { funnelStages } from "../data";

export function MarketingFunnel() {
  const rows = funnelStages.map((s, i) => {
    const prev = i === 0 ? s.value : funnelStages[i - 1].value;
    return { ...s, conversion: i === 0 ? 1 : s.value / prev };
  });

  return (
    <ChartCard
      title="Marketing funnel"
      description="From impression to conversion — where people drop off."
      fileSlug="funnel"
      csvRows={rows.map((r) => ({
        stage: r.stage,
        value: r.value,
        step_conversion: (r.conversion * 100).toFixed(1) + "%",
      }))}
    >
      <div className="h-80 w-full">
        <ResponsiveContainer>
          <FunnelChart>
            <Tooltip
              contentStyle={{
                background: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 10,
                fontSize: 12,
              }}
              formatter={(v: number) => v.toLocaleString()}
            />
            <Funnel dataKey="value" data={rows} isAnimationActive animationDuration={700}>
              <LabelList
                position="right"
                fill="hsl(var(--foreground))"
                stroke="none"
                dataKey="stage"
                style={{ fontSize: 12, fontWeight: 500 }}
              />
              <LabelList
                position="center"
                fill="white"
                stroke="none"
                dataKey="value"
                formatter={(v: number) => v.toLocaleString()}
                style={{ fontSize: 12, fontWeight: 600 }}
              />
              {rows.map((r) => (
                <Cell key={r.stage} fill={r.color} />
              ))}
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
