import { useRef, useState, type ReactNode } from "react";
import { toPng } from "html-to-image";
import { Download, FileImage, FileText, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Row = Record<string, string | number | boolean | null | undefined>;

function toCsv(rows: Row[]): string {
  if (!rows.length) return "";
  const cols = Array.from(
    rows.reduce<Set<string>>((set, r) => {
      Object.keys(r).forEach((k) => set.add(k));
      return set;
    }, new Set()),
  );
  const escape = (v: unknown) => {
    if (v == null) return "";
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [
    cols.join(","),
    ...rows.map((r) => cols.map((c) => escape(r[c])).join(",")),
  ].join("\n");
}

function download(name: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export interface ChartCardProps {
  title: string;
  description?: string;
  toolbar?: ReactNode;
  csvRows?: Row[];
  fileSlug: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function ChartCard({
  title,
  description,
  toolbar,
  csvRows,
  fileSlug,
  children,
  footer,
}: ChartCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  async function exportPng() {
    if (!ref.current) return;
    setBusy(true);
    try {
      const dataUrl = await toPng(ref.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: getComputedStyle(document.body).backgroundColor,
      });
      const res = await fetch(dataUrl);
      download(`${fileSlug}.png`, await res.blob());
    } finally {
      setBusy(false);
    }
  }

  function exportCsv() {
    if (!csvRows?.length) return;
    download(`${fileSlug}.csv`, new Blob([toCsv(csvRows)], { type: "text/csv" }));
  }

  return (
    <section className="rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm animate-fade-in">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border/50 px-5 py-4">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
          {description ? (
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {toolbar}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Chart actions">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={exportPng} disabled={busy}>
                <FileImage className="mr-2 h-4 w-4" /> Export as PNG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportCsv} disabled={!csvRows?.length}>
                <FileText className="mr-2 h-4 w-4" /> Export as CSV
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={exportPng} disabled={busy}>
                <Download className="mr-2 h-4 w-4" /> Download report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <div ref={ref} className="px-5 py-5">
        {children}
      </div>
      {footer ? (
        <footer className="border-t border-border/50 px-5 py-3 text-xs text-muted-foreground">
          {footer}
        </footer>
      ) : null}
    </section>
  );
}
