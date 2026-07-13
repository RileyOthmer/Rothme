import { useMemo, useState } from "react";
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";

import { ChartCard } from "../ChartCard";
import { platformComparison } from "../data";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Metric = "reach" | "engagement" | "clicks";

export function PlatformBarChart() {
  const [metric, setMetric] = useState<Metric>("reach");
  const rows = useMemo(platformComparison, []);
  const label: Record<Metric, string> = { reach: "Reach", engagement: "Engagement", clicks: "Clicks" };

  return (
    <ChartCard
      title="Platform comparison"
      description={`${label[metric]} per platform across the last 30 days.`}
      fileSlug={`platforms-${metric}`}
      csvRows={rows}
      toolbar={
        <Tabs value={metric} onValueChange={(v) => setMetric(v as Metric)}>
          <TabsList className="h-8">
            <TabsTrigger value="reach" className="text-xs">Reach</TabsTrigger>
            <TabsTrigger value="engagement" className="text-xs">Engagement</TabsTrigger>
            <TabsTrigger value="clicks" className="text-xs">Clicks</TabsTrigger>
          </TabsList>
        </Tabs>
      }
    >
      <div className="h-72 w-full">
        <ResponsiveContainer>
          <BarChart data={rows} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
            <XAxis dataKey="platform" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} width={44} />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 10,
                fontSize: 12,
              }}
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey={metric} name={label[metric]} radius={[8, 8, 0, 0]} animationDuration={700}>
              {rows.map((r) => (
                <Cell key={r.platform} fill={r.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
