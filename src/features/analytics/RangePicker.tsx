import { RANGE_OPTIONS, type RangeDays } from "./kpis";

export function RangePicker({
  value,
  onChange,
}: {
  value: RangeDays;
  onChange: (r: RangeDays) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Date range"
      className="inline-flex items-center rounded-full border border-border bg-card p-1 text-xs font-medium"
    >
      {RANGE_OPTIONS.map((r) => {
        const active = r === value;
        return (
          <button
            key={r}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(r)}
            className={
              "rounded-full px-3 py-1.5 transition-colors " +
              (active
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground")
            }
          >
            {r}d
          </button>
        );
      })}
    </div>
  );
}
