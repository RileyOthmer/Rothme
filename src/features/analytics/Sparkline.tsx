import type { SeriesPoint } from "./kpis";

export function Sparkline({
  points,
  positive = true,
  height = 36,
  className = "",
}: {
  points: SeriesPoint[];
  positive?: boolean;
  height?: number;
  className?: string;
}) {
  if (points.length < 2) return <div style={{ height }} className={className} />;
  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 120;
  const h = height;
  const step = w / (points.length - 1);
  const coords = points.map((p, i) => {
    const x = i * step;
    const y = h - ((p.value - min) / range) * (h - 4) - 2;
    return [x, y] as const;
  });
  const d = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${d} L${w},${h} L0,${h} Z`;
  const stroke = positive ? "hsl(var(--primary))" : "hsl(var(--destructive))";
  const fillId = `spark-fill-${positive ? "p" : "n"}`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={className}
      preserveAspectRatio="none"
      style={{ width: "100%", height }}
      aria-hidden
    >
      <defs>
        <linearGradient id={fillId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity={0.25} />
          <stop offset="100%" stopColor={stroke} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${fillId})`} />
      <path d={d} fill="none" stroke={stroke} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
