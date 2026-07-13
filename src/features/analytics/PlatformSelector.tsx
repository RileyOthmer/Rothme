import { Check, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PLATFORMS, type PlatformId } from "@/features/unified/platforms";
import { cn } from "@/lib/utils";

export function PlatformSelector({
  value, onChange,
}: {
  value: PlatformId[]; // empty = All
  onChange: (v: PlatformId[]) => void;
}) {
  const isAll = value.length === 0;
  const label = isAll
    ? "All platforms"
    : value.length === 1
    ? PLATFORMS.find((p) => p.id === value[0])?.label ?? "1 platform"
    : `${value.length} platforms`;

  const toggle = (id: PlatformId) => {
    if (value.includes(id)) onChange(value.filter((v) => v !== id));
    else onChange([...value, id]);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Layers className="h-3.5 w-3.5" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-1" align="end">
        <button
          onClick={() => onChange([])}
          className={cn(
            "flex w-full items-center justify-between rounded px-2 py-1.5 text-sm hover:bg-muted",
            isAll && "bg-muted",
          )}
        >
          <span>All platforms</span>
          {isAll && <Check className="h-3.5 w-3.5" />}
        </button>
        <div className="my-1 border-t border-border/60" />
        {PLATFORMS.map((p) => {
          const active = value.includes(p.id);
          const Icon = p.Icon;
          return (
            <button
              key={p.id}
              onClick={() => toggle(p.id)}
              className={cn(
                "flex w-full items-center justify-between rounded px-2 py-1.5 text-sm hover:bg-muted",
                active && "bg-muted",
              )}
            >
              <span className="flex items-center gap-2">
                <Icon className="h-3.5 w-3.5" style={{ color: p.color }} />
                {p.label}
              </span>
              {active && <Check className="h-3.5 w-3.5" />}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
