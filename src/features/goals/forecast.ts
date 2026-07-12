import type { Goal, GoalForecast, GoalStatus } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;

function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / DAY_MS);
}

/**
 * Project pace using change since start, extrapolated to due date.
 * If already achieved, status is "achieved" and no forecast is needed.
 */
export function computeForecast(goal: Goal, today = new Date()): GoalForecast {
  const now = today.toISOString().slice(0, 10);
  const totalDays = Math.max(1, daysBetween(goal.startDate, goal.dueDate));
  const elapsed = Math.max(0, Math.min(totalDays, daysBetween(goal.startDate, now)));
  const daysRemaining = daysBetween(now, goal.dueDate);

  const progress = goal.current - goal.startValue;
  const needed = goal.target - goal.startValue;
  const progressPct = needed === 0 ? 100 : Math.max(0, (goal.current / goal.target) * 100);

  // Extrapolate: pace per day × total days.
  const perDay = elapsed > 0 ? progress / elapsed : 0;
  const projected = goal.startValue + perDay * totalDays;
  const projectedPct = goal.target === 0 ? 0 : (projected / goal.target) * 100;

  let status: GoalStatus;
  if (goal.current >= goal.target) status = "achieved";
  else if (projectedPct >= 100) status = "on_track";
  else if (projectedPct >= 85) status = "at_risk";
  else status = "behind";

  // Estimated completion — only if we're moving toward the target.
  let estimatedCompletion: string | null = null;
  if (perDay > 0 && goal.current < goal.target) {
    const remaining = goal.target - goal.current;
    const daysToFinish = Math.ceil(remaining / perDay);
    estimatedCompletion = new Date(today.getTime() + daysToFinish * DAY_MS)
      .toISOString()
      .slice(0, 10);
  } else if (goal.current >= goal.target) {
    estimatedCompletion = now;
  }

  const summary = buildSummary({ status, projectedPct, progressPct, daysRemaining });

  return {
    projected: Math.max(0, projected),
    status,
    projectedPct: Math.max(0, projectedPct),
    progressPct,
    estimatedCompletion,
    daysRemaining,
    summary,
  };
}

function buildSummary({
  status,
  projectedPct,
  progressPct,
  daysRemaining,
}: {
  status: GoalStatus;
  projectedPct: number;
  progressPct: number;
  daysRemaining: number;
}): string {
  if (status === "achieved") return "You've hit this goal — nice work.";
  const dueSoon = daysRemaining <= 7 ? "This week is the deadline." : `${daysRemaining} days left.`;
  if (status === "on_track") {
    return `At today's pace you'll land around ${Math.round(projectedPct)}% of target. ${dueSoon}`;
  }
  if (status === "at_risk") {
    return `You're at ${Math.round(progressPct)}%. On this pace you'll come in a little short. ${dueSoon}`;
  }
  return `You're at ${Math.round(progressPct)}% and the pace isn't enough to catch up. ${dueSoon}`;
}
