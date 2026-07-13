import { ChartCard } from "../ChartCard";
import { goals } from "../data";

export function GoalProgress() {
  return (
    <ChartCard
      title="Goal progress"
      description="Where you are against this quarter's targets."
      fileSlug="goals"
      csvRows={goals.map((g) => ({ goal: g.name, progress_percent: g.value, target: g.target }))}
    >
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        {goals.map((g) => {
          const pct = Math.min(100, Math.round((g.value / g.target) * 100));
          const c = 2 * Math.PI * 40;
          const dash = (pct / 100) * c;
          return (
            <div key={g.name} className="flex flex-col items-center gap-2">
              <div className="relative h-28 w-28">
                <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                  <circle cx="50" cy="50" r="40" stroke="hsl(var(--muted))" strokeWidth="10" fill="none" />
                  <circle
                    cx="50" cy="50" r="40" fill="none" strokeWidth="10" strokeLinecap="round"
                    stroke={g.color}
                    strokeDasharray={`${dash} ${c}`}
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-semibold">{pct}%</span>
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">of goal</span>
                </div>
              </div>
              <span className="text-sm font-medium">{g.name}</span>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
}
