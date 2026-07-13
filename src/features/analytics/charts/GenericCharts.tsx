import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell,
  Funnel, FunnelChart, LabelList,
  Legend, Line, LineChart, Pie, PieChart,
  PolarAngleAxis, PolarGrid, Radar, RadarChart,
  RadialBar, RadialBarChart, ResponsiveContainer,
  Scatter, ScatterChart, Tooltip, Treemap, XAxis, YAxis, ZAxis,
} from "recharts";

const AXIS = { fontSize: 11, tick: { fill: "hsl(var(--muted-foreground))" } as any };
const GRID = { stroke: "hsl(var(--border))", strokeDasharray: "3 3" };
const TOOLTIP_STYLE: React.CSSProperties = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
};

type Series = { key: string; color: string; label?: string };

export function GenericLineChart({
  data, xKey, series, curve = "monotone",
}: {
  data: any[]; xKey: string; series: Series[];
  curve?: "monotone" | "linear" | "natural";
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid {...GRID} />
        <XAxis dataKey={xKey} {...AXIS} />
        <YAxis {...AXIS} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {series.map((s) => (
          <Line key={s.key} type={curve} dataKey={s.key} name={s.label ?? s.key}
            stroke={s.color} strokeWidth={2} dot={false} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

/** Spline = smoothed line */
export function GenericSplineChart(props: React.ComponentProps<typeof GenericLineChart>) {
  return <GenericLineChart {...props} curve="natural" />;
}

export function GenericBarChart({
  data, xKey, series, stacked = false, horizontal = false,
}: {
  data: any[]; xKey: string; series: Series[];
  stacked?: boolean; horizontal?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data} layout={horizontal ? "vertical" : "horizontal"}
        margin={{ top: 8, right: 12, left: horizontal ? 40 : 0, bottom: 0 }}
      >
        <CartesianGrid {...GRID} />
        {horizontal ? (
          <>
            <XAxis type="number" {...AXIS} />
            <YAxis type="category" dataKey={xKey} {...AXIS} width={80} />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} {...AXIS} />
            <YAxis {...AXIS} />
          </>
        )}
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {series.map((s) => (
          <Bar key={s.key} dataKey={s.key} name={s.label ?? s.key}
            fill={s.color} stackId={stacked ? "s" : undefined}
            radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function GenericAreaChart({
  data, xKey, series, stacked = false,
}: {
  data: any[]; xKey: string; series: Series[]; stacked?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <defs>
          {series.map((s) => (
            <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity={0.5} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid {...GRID} />
        <XAxis dataKey={xKey} {...AXIS} />
        <YAxis {...AXIS} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {series.map((s) => (
          <Area key={s.key} type="monotone" dataKey={s.key} name={s.label ?? s.key}
            stroke={s.color} fill={`url(#grad-${s.key})`}
            stackId={stacked ? "s" : undefined} />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function GenericPieChart({
  data, donut = false,
}: {
  data: { name: string; value: number; color: string }[]; donut?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Pie data={data} dataKey="value" nameKey="name"
          innerRadius={donut ? "55%" : 0} outerRadius="80%"
          paddingAngle={donut ? 2 : 0}>
          {data.map((d, i) => <Cell key={i} fill={d.color} />)}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

export function GenericRadarChart({
  data, dimensions, series,
}: {
  data: any[]; dimensions: string;
  series: Series[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={data}>
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis dataKey={dimensions} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {series.map((s) => (
          <Radar key={s.key} name={s.label ?? s.key} dataKey={s.key}
            stroke={s.color} fill={s.color} fillOpacity={0.3} />
        ))}
      </RadarChart>
    </ResponsiveContainer>
  );
}

export function GenericScatterChart({
  data, xKey, yKey, zKey, color,
}: {
  data: any[]; xKey: string; yKey: string; zKey?: string; color: string;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid {...GRID} />
        <XAxis type="number" dataKey={xKey} {...AXIS} />
        <YAxis type="number" dataKey={yKey} {...AXIS} />
        {zKey && <ZAxis type="number" dataKey={zKey} range={[40, 400]} />}
        <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={TOOLTIP_STYLE} />
        <Scatter data={data} fill={color} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

export function GenericFunnelChart({
  data,
}: {
  data: { name: string; value: number; fill: string }[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <FunnelChart>
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Funnel dataKey="value" data={data} isAnimationActive>
          <LabelList position="right" fill="hsl(var(--foreground))" stroke="none" dataKey="name" fontSize={11} />
        </Funnel>
      </FunnelChart>
    </ResponsiveContainer>
  );
}

export function GenericTreemap({
  data,
}: {
  data: { name: string; size: number; color?: string }[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <Treemap
        data={data} dataKey="size" nameKey="name"
        stroke="hsl(var(--background))"
        content={({ x, y, width, height, name, payload }: any) => (
          <g>
            <rect x={x} y={y} width={width} height={height}
              style={{ fill: payload?.color ?? "hsl(var(--primary))", stroke: "hsl(var(--background))", strokeWidth: 2 }} />
            {width > 60 && height > 24 && (
              <text x={x + 6} y={y + 16} fill="hsl(var(--primary-foreground))" fontSize={11} fontWeight={500}>
                {name}
              </text>
            )}
          </g>
        )}
      />
    </ResponsiveContainer>
  );
}

export function GenericGauge({
  value, max = 100, label, color = "hsl(var(--primary))",
}: {
  value: number; max?: number; label?: string; color?: string;
}) {
  const pct = Math.max(0, Math.min(1, value / max));
  const data = [{ name: label ?? "value", value: pct * 100, fill: color }];
  return (
    <div className="relative h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart innerRadius="70%" outerRadius="100%" data={data}
          startAngle={210} endAngle={-30}>
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar dataKey="value" cornerRadius={8} background={{ fill: "hsl(var(--muted))" }} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-semibold tabular-nums">{Math.round(pct * 100)}%</span>
        {label && <span className="text-xs text-muted-foreground">{label}</span>}
      </div>
    </div>
  );
}

/** Simple heatmap. `data` is a 2D grid; rows = y labels, cols = x labels. */
export function GenericHeatmap({
  xLabels, yLabels, data, color = "hsl(var(--primary))",
}: {
  xLabels: string[]; yLabels: string[];
  data: number[][]; // data[y][x]
  color?: string;
}) {
  const max = Math.max(1, ...data.flat());
  return (
    <div className="flex h-full w-full flex-col">
      <div className="grid gap-1"
        style={{ gridTemplateColumns: `48px repeat(${xLabels.length}, minmax(0, 1fr))` }}>
        <div />
        {xLabels.map((x) => (
          <div key={x} className="truncate text-center text-[10px] text-muted-foreground">{x}</div>
        ))}
        {yLabels.map((y, yi) => (
          <>
            <div key={`l-${y}`} className="truncate pr-1 text-right text-[10px] text-muted-foreground">{y}</div>
            {xLabels.map((_, xi) => {
              const v = data[yi]?.[xi] ?? 0;
              const alpha = v / max;
              return (
                <div key={`${yi}-${xi}`}
                  title={`${y} · ${xLabels[xi]}: ${v}`}
                  className="aspect-square rounded-sm border border-border/40"
                  style={{ backgroundColor: color, opacity: 0.08 + alpha * 0.92 }}
                />
              );
            })}
          </>
        ))}
      </div>
    </div>
  );
}

export function Scorecard({
  label, value, sublabel,
}: {
  label: string; value: string | number; sublabel?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums">{value}</p>
      {sublabel && <p className="mt-1 text-xs text-muted-foreground">{sublabel}</p>}
    </div>
  );
}

export function DataTable<T extends Record<string, any>>({
  columns, rows,
}: {
  columns: { key: keyof T & string; label: string; align?: "left" | "right" }[];
  rows: T[];
}) {
  return (
    <div className="overflow-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={`px-3 py-2 font-medium ${c.align === "right" ? "text-right" : "text-left"}`}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-border/60">
              {columns.map((c) => (
                <td key={c.key} className={`px-3 py-2 tabular-nums ${c.align === "right" ? "text-right" : "text-left"}`}>
                  {r[c.key] as any}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={columns.length} className="px-3 py-8 text-center text-muted-foreground">No data yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function ProgressRow({
  label, value, max = 100, color = "hsl(var(--primary))",
}: {
  label: string; value: number; max?: number; color?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="tabular-nums font-medium">{value.toLocaleString()} / {max.toLocaleString()}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}
