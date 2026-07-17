import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  FileText,
  CalendarClock,
  Plug,
  Sparkles,
  Settings2,
  Search,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  globalSearch,
  type SearchHit,
  type SearchResults,
} from "@/lib/search/global-search.functions";

const EMPTY: SearchResults = {
  drafts: [],
  future: [],
  accounts: [],
  ai: [],
  settings: [],
};

function useDebounced<T>(value: T, delay = 200): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export function GlobalSearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [q, setQ] = useState("");
  const debounced = useDebounced(q, 180);
  const navigate = useNavigate();
  const searchFn = useServerFn(globalSearch);

  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  const { data = EMPTY, isFetching } = useQuery({
    queryKey: ["global-search", debounced],
    queryFn: () => searchFn({ data: { q: debounced } }),
    enabled: open,
    staleTime: 15_000,
    placeholderData: (prev) => prev,
  });

  const totalCount = useMemo(
    () =>
      data.drafts.length +
      data.future.length +
      data.accounts.length +
      data.ai.length +
      data.settings.length,
    [data],
  );

  const go = (to: string) => {
    onOpenChange(false);
    navigate({ to });
  };

  const hasQuery = debounced.trim().length > 0;

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search drafts, campaigns, accounts, settings…"
        value={q}
        onValueChange={setQ}
      />
      <CommandList>
        {!hasQuery && totalCount === 0 && !isFetching && (
          <div className="px-4 py-10 text-center">
            <Search className="mx-auto h-5 w-5 text-muted-foreground" />
            <p className="mt-2 text-sm font-medium text-foreground">
              Search everything.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Drafts, AI history, connected accounts, settings, and upcoming
              campaigns — all in one place.
            </p>
          </div>
        )}

        {hasQuery && totalCount === 0 && !isFetching && (
          <CommandEmpty>
            No matches for "{debounced}". Try a different word.
          </CommandEmpty>
        )}

        <ResultGroup
          heading="Drafts"
          icon={FileText}
          items={data.drafts}
          onSelect={go}
        />
        <Divider show={data.drafts.length > 0 && data.future.length > 0} />
        <ResultGroup
          heading="Upcoming campaigns"
          icon={CalendarClock}
          items={data.future}
          onSelect={go}
        />
        <Divider
          show={
            (data.drafts.length > 0 || data.future.length > 0) &&
            data.accounts.length > 0
          }
        />
        <ResultGroup
          heading="Connected accounts"
          icon={Plug}
          items={data.accounts}
          onSelect={go}
        />
        <Divider
          show={
            (data.drafts.length + data.future.length + data.accounts.length) > 0 &&
            data.ai.length > 0
          }
        />
        <ResultGroup
          heading="AI history"
          icon={Sparkles}
          items={data.ai}
          onSelect={go}
        />
        <Divider
          show={
            (data.drafts.length +
              data.future.length +
              data.accounts.length +
              data.ai.length) > 0 && data.settings.length > 0
          }
        />
        <ResultGroup
          heading="Settings"
          icon={Settings2}
          items={data.settings}
          onSelect={go}
        />
      </CommandList>
    </CommandDialog>
  );
}

function Divider({ show }: { show: boolean }) {
  if (!show) return null;
  return <CommandSeparator />;
}

function ResultGroup({
  heading,
  icon: Icon,
  items,
  onSelect,
}: {
  heading: string;
  icon: React.ComponentType<{ className?: string }>;
  items: SearchHit[];
  onSelect: (to: string) => void;
}) {
  if (items.length === 0) return null;
  return (
    <CommandGroup heading={heading}>
      {items.map((item) => (
        <CommandItem
          key={`${heading}-${item.id}`}
          value={`${heading} ${item.title} ${item.subtitle ?? ""}`}
          onSelect={() => onSelect(item.to)}
          className="gap-3"
        >
          <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {item.title}
            </p>
            {item.subtitle && (
              <p className="truncate text-xs text-muted-foreground">
                {item.subtitle}
              </p>
            )}
          </div>
        </CommandItem>
      ))}
    </CommandGroup>
  );
}
