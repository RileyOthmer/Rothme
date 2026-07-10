import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme, type Theme } from "@/lib/theme";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const OPTIONS: Array<{ value: Theme; label: string; Icon: typeof Sun }> = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Monitor },
];

export function ThemeToggle() {
  const { theme, setTheme, mounted } = useTheme();
  const Current = OPTIONS.find((o) => o.value === theme)?.Icon ?? Monitor;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Toggle theme"
        className="grid h-8 w-8 place-items-center rounded-md border border-border bg-surface text-foreground shadow-xs transition-colors hover:bg-surface-2"
      >
        {mounted ? <Current className="h-3.5 w-3.5" /> : <Monitor className="h-3.5 w-3.5" />}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        {OPTIONS.map(({ value, label, Icon }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setTheme(value)}
            className="cursor-pointer"
          >
            <Icon className="mr-2 h-4 w-4" />
            <span>{label}</span>
            {theme === value ? (
              <span className="ml-auto text-xs text-muted-foreground">✓</span>
            ) : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
