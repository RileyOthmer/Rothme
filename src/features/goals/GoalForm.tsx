import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { METRIC_LABEL } from "./types";
import type { Goal, GoalMetric } from "./types";
import { newGoalId } from "./store";

const METRICS: GoalMetric[] = [
  "revenue",
  "orders",
  "roas",
  "sessions",
  "leads",
  "email_subscribers",
  "followers",
  "appointments",
  "conversions",
];

const DAY = 24 * 60 * 60 * 1000;

export type GoalFormProps = {
  onSubmit: (goal: Goal) => void;
  onCancel: () => void;
  initial?: Partial<Goal>;
};

export function GoalForm({ onSubmit, onCancel, initial }: GoalFormProps) {
  const [metric, setMetric] = useState<GoalMetric>(initial?.metric ?? "revenue");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [target, setTarget] = useState(String(initial?.target ?? ""));
  const [current, setCurrent] = useState(String(initial?.current ?? "0"));
  const [durationDays, setDurationDays] = useState("30");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const targetNum = Number(target);
    const currentNum = Number(current);
    const daysNum = Math.max(1, Number(durationDays));
    if (Number.isNaN(targetNum) || Number.isNaN(currentNum)) return;

    const now = new Date();
    const goal: Goal = {
      id: initial?.id ?? newGoalId(),
      metric,
      title: title.trim() || `${METRIC_LABEL[metric]}: reach ${targetNum}`,
      target: targetNum,
      current: currentNum,
      startValue: currentNum,
      startDate: now.toISOString().slice(0, 10),
      dueDate: new Date(now.getTime() + daysNum * DAY).toISOString().slice(0, 10),
      impact: initial?.impact ?? "medium",
      impactReason:
        initial?.impactReason ??
        "You told ROTHME this matters — we'll track it and flag risks early.",
      recommendation:
        initial?.recommendation ??
        "Check in weekly. ROTHME will suggest a specific action once there's a week of data.",
      source: initial?.source ?? "user",
      confidencePct: initial?.confidencePct ?? 60,
      history: [{ date: now.toISOString().slice(0, 10), value: currentNum }],
      createdAt: now.toISOString(),
    };
    onSubmit(goal);
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="metric">What are you tracking?</Label>
          <Select value={metric} onValueChange={(v) => setMetric(v as GoalMetric)}>
            <SelectTrigger id="metric">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {METRICS.map((m) => (
                <SelectItem key={m} value={m}>
                  {METRIC_LABEL[m]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="duration">Time to hit it (days)</Label>
          <Input
            id="duration"
            type="number"
            min={1}
            value={durationDays}
            onChange={(e) => setDurationDays(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="title">Name this goal</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={`e.g. Grow ${METRIC_LABEL[metric].toLowerCase()} to a new high`}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="current">Where you are today</Label>
          <Input
            id="current"
            type="number"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="target">Where you want to be</Label>
          <Input
            id="target"
            type="number"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Button type="submit">Create goal</Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
