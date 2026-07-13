import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RANGE_LABEL, type RangePreset } from "@/features/unified/platforms";
import { cn } from "@/lib/utils";

const PRESETS: RangePreset[] = ["today", "yesterday", "7d", "30d", "90d", "1y", "custom"];

export function ExecutiveDateFilter({
  range, from, to, onChange,
}: {
  range: RangePreset;
  from: string;
  to: string;
  onChange: (v: { range: RangePreset; from: string; to: string }) => void;
}) {
  const [openCustom, setOpenCustom] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-1">
      {PRESETS.filter((p) => p !== "custom").map((p) => (
        <Button
          key={p} size="sm"
          variant={range === p ? "default" : "ghost"}
          onClick={() => onChange({ range: p, from: "", to: "" })}
          className={cn("h-7 px-2 text-xs")}
        >
          {RANGE_LABEL[p]}
        </Button>
      ))}
      <Popover open={openCustom} onOpenChange={setOpenCustom}>
        <PopoverTrigger asChild>
          <Button size="sm"
            variant={range === "custom" ? "default" : "ghost"}
            className="h-7 gap-1 px-2 text-xs">
            <CalendarIcon className="h-3 w-3" />
            {range === "custom" && from && to ? `${from} → ${to}` : "Custom"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            defaultMonth={from ? new Date(from) : undefined}
            selected={{
              from: from ? new Date(from) : undefined,
              to: to ? new Date(to) : undefined,
            }}
            onSelect={(r) => {
              if (r?.from && r?.to) {
                onChange({
                  range: "custom",
                  from: r.from.toISOString().slice(0, 10),
                  to: r.to.toISOString().slice(0, 10),
                });
                setOpenCustom(false);
              }
            }}
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
