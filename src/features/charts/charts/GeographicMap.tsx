import { ChartCard } from "../ChartCard";
import { geography } from "../data";

export function GeographicMap() {
  const max = Math.max(...geography.map((g) => g.visitors));
  return (
    <ChartCard
      title="Audience by location"
      description="Top countries by visitors — bubble size scales with volume."
      fileSlug="geography"
      csvRows={geography}
    >
      <div className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
        <div className="relative aspect-[2/1] overflow-hidden rounded-xl border border-border/60 bg-muted/30">
          <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="absolute inset-0 h-full w-full opacity-60">
            {/* stylised world silhouette blobs */}
            <g fill="hsl(var(--muted-foreground) / 0.25)">
              <ellipse cx="22" cy="20" rx="10" ry="6" />
              <ellipse cx="26" cy="34" rx="6" ry="8" />
              <ellipse cx="48" cy="20" rx="9" ry="6" />
              <ellipse cx="55" cy="32" rx="7" ry="5" />
              <ellipse cx="72" cy="22" rx="12" ry="7" />
              <ellipse cx="83" cy="36" rx="5" ry="4" />
            </g>
          </svg>
          {geography.map((g) => {
            const size = 6 + (g.visitors / max) * 26;
            return (
              <div
                key={g.code}
                className="group absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${g.x}%`, top: `${g.y}%` }}
              >
                <div
                  className="rounded-full bg-primary/70 ring-2 ring-primary/30 transition-transform hover:scale-125"
                  style={{ width: size, height: size }}
                />
                <div className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-[11px] opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                  <span className="font-medium">{g.country}</span>
                  <span className="ml-2 text-muted-foreground">{g.visitors.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
        <ul className="space-y-2">
          {geography.map((g) => (
            <li key={g.code} className="flex items-center gap-3 text-sm">
              <span className="w-8 text-xs font-mono text-muted-foreground">{g.code}</span>
              <span className="flex-1 truncate">{g.country}</span>
              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${(g.visitors / max) * 100}%` }}
                />
              </div>
              <span className="w-16 text-right text-xs tabular-nums text-muted-foreground">
                {g.visitors.toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </ChartCard>
  );
}
