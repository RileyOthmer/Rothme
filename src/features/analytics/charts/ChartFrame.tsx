import { useRef, useState, type ReactNode } from "react";
import { Download, Maximize2, Minimize2, FileImage, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type ExportRow = Record<string, string | number | null | undefined>;

export function ChartFrame({
  title,
  subtitle,
  children,
  csvRows,
  csvFilename,
  className,
  headerRight,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  csvRows?: ExportRow[];
  csvFilename?: string;
  className?: string;
  headerRight?: ReactNode;
}) {
  const [full, setFull] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const exportPng = async () => {
    const el = wrapRef.current;
    if (!el) return;
    const svg = el.querySelector("svg");
    if (!svg) return;
    const clone = svg.cloneNode(true) as SVGSVGElement;
    const box = svg.getBoundingClientRect();
    clone.setAttribute("width", String(box.width));
    clone.setAttribute("height", String(box.height));
    const xml = new XMLSerializer().serializeToString(clone);
    const svg64 = btoa(unescape(encodeURIComponent(xml)));
    const img = new Image();
    img.src = `data:image/svg+xml;base64,${svg64}`;
    await new Promise<void>((r) => { img.onload = () => r(); });
    const canvas = document.createElement("canvas");
    canvas.width = box.width * 2;
    canvas.height = box.height * 2;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(2, 2);
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--background") || "#fff";
    ctx.fillRect(0, 0, box.width, box.height);
    ctx.drawImage(img, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(csvFilename ?? title).replace(/\s+/g, "-").toLowerCase()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const exportCsv = () => {
    if (!csvRows || csvRows.length === 0) return;
    const headers = Array.from(
      csvRows.reduce((set, row) => {
        Object.keys(row).forEach((k) => set.add(k));
        return set;
      }, new Set<string>()),
    );
    const escape = (v: unknown) => {
      const s = v == null ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [headers.join(","), ...csvRows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(csvFilename ?? title).replace(/\s+/g, "-").toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-4",
        full && "fixed inset-4 z-50 flex flex-col shadow-2xl",
        className,
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-1">
          {headerRight}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="h-7 w-7">
                <Download className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportPng}>
                <FileImage className="mr-2 h-3.5 w-3.5" /> Export PNG
              </DropdownMenuItem>
              {csvRows && csvRows.length > 0 && (
                <DropdownMenuItem onClick={exportCsv}>
                  <FileSpreadsheet className="mr-2 h-3.5 w-3.5" /> Export CSV
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setFull((v) => !v)}>
            {full ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>
      <div ref={wrapRef} className={cn("w-full", full ? "flex-1" : "h-64")}>
        {children}
      </div>
    </div>
  );
}
