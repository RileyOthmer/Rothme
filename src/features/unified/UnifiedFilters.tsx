import { useState } from "react";
import { Calendar as CalendarIcon, Check, ChevronDown } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import {
  PLATFORMS, PLATFORM_MAP, RANGE_LABEL,
  type PlatformId, type RangePreset,
} from "./platforms";

export interface UnifiedFiltersValue {
  platforms: PlatformId[]; // empty = all
  range: RangePreset;
  customFrom?: string;
  customTo?: string;
}

export function UnifiedFilters({
  value,
  onChange,
}: {
  value: UnifiedFiltersValue;
  onChange: (v: UnifiedFiltersValue) => void;
}) {
  const [platformOpen, setPlatformOpen] = useState(false);
  const [rangeOpen, setRangeOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);

  const isAll = value.platforms.length === 0 || value.platforms.length === PLATFORMS.length;
  const platformLabel = isAll
    ? "All platforms"
    : value.platforms.length === 1
      ? PLATFORM_MAP[value.platforms[0]].label
      : `${value.platforms.length} platforms`;

  const togglePlatform = (id: PlatformId) => {
    const set = new Set(value.platforms.length ? value.platforms : PLATFORMS.map((p) => p.id));
    if (set.has(id)) set.delete(id);
    else set.add(id);
    onChange({ ...value, platforms: set.size === PLATFORMS.length ? [] : [...set] });
  };

  const selectOnly = (id: PlatformId) => onChange({ ...value, platforms: [id] });
  const selectAll = () => onChange({ ...value, platforms: [] });

  const rangeLabel =
    value.range === "custom" && value.customFrom
      ? `${format(new Date(value.customFrom), "MMM d")} – ${format(new Date(value.customTo || value.customFrom), "MMM d")}`
      : RANGE_LABEL[value.range];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Platform picker */}
      <Popover open={platformOpen} onOpenChange={setPlatformOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 gap-2 rounded-full">
            <div className="flex -space-x-1.5">
              {(value.platforms.length ? value.platforms : PLATFORMS.slice(0, 4).map((p) => p.id))
                .slice(0, 4)
                .map((id) => {
                  const p = PLATFORM_MAP[id];
                  return (
                    <span
                      key={id}
                      className="grid h-4 w-4 place-items-center rounded-full ring-2 ring-background"
                      style={{ background: p.color }}
                    >
                      <p.Icon className="h-2.5 w-2.5 text-white" />
                    </span>
                  );
                })}
            </div>
            <span className="text-xs font-medium">{platformLabel}</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2" align="start">
          <button
            type="button"
            onClick={() => { selectAll(); setPlatformOpen(false); }}
            className={cn(
              "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent",
              isAll && "bg-accent/60 font-medium",
            )}
          >
            All platforms
            {isAll ? <Check className="h-4 w-4" /> : null}
          </button>
          <div className="my-1 h-px bg-border" />
          <div className="max-h-72 overflow-y-auto">
            {PLATFORMS.map((p) => {
              const selected = !isAll && value.platforms.includes(p.id);
              return (
                <div
                  key={p.id}
                  className="group flex items-center rounded-md px-2 py-1 hover:bg-accent"
                >
                  <button
                    type="button"
                    onClick={() => togglePlatform(p.id)}
                    className="flex flex-1 items-center gap-2 py-1 text-sm"
                  >
                    <span
                      className="grid h-5 w-5 place-items-center rounded"
                      style={{ background: p.color }}
                    >
                      <p.Icon className="h-3 w-3 text-white" />
                    </span>
                    <span>{p.label}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { selectOnly(p.id); setPlatformOpen(false); }}
                    className="rounded px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground opacity-0 transition hover:bg-background group-hover:opacity-100"
                  >
                    only
                  </button>
                  {selected ? <Check className="ml-1 h-4 w-4 text-primary" /> : null}
                </div>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      {/* Range picker */}
      <Popover open={rangeOpen} onOpenChange={setRangeOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 gap-2 rounded-full">
            <CalendarIcon className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">{rangeLabel}</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-1" align="end">
          {(["today", "yesterday", "7d", "30d", "90d", "1y"] as RangePreset[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => { onChange({ ...value, range: r }); setRangeOpen(false); }}
              className={cn(
                "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent",
                value.range === r && "bg-accent/60 font-medium",
              )}
            >
              {RANGE_LABEL[r]}
              {value.range === r ? <Check className="h-4 w-4" /> : null}
            </button>
          ))}
          <div className="my-1 h-px bg-border" />
          <button
            type="button"
            onClick={() => { setRangeOpen(false); setDateOpen(true); }}
            className={cn(
              "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent",
              value.range === "custom" && "bg-accent/60 font-medium",
            )}
          >
            Custom date…
            {value.range === "custom" ? <Check className="h-4 w-4" /> : null}
          </button>
        </PopoverContent>
      </Popover>

      {/* Hidden trigger for custom calendar */}
      <Popover open={dateOpen} onOpenChange={setDateOpen}>
        <PopoverTrigger asChild>
          <span className="sr-only" aria-hidden />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            defaultMonth={value.customFrom ? new Date(value.customFrom) : undefined}
            selected={
              value.customFrom
                ? { from: new Date(value.customFrom), to: value.customTo ? new Date(value.customTo) : undefined }
                : undefined
            }
            onSelect={(range) => {
              if (!range?.from) return;
              onChange({
                ...value,
                range: "custom",
                customFrom: range.from.toISOString().slice(0, 10),
                customTo: (range.to ?? range.from).toISOString().slice(0, 10),
              });
              if (range.to) setDateOpen(false);
            }}
            numberOfMonths={2}
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
