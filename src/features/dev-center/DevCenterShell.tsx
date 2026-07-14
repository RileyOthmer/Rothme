import type { ReactNode } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { DevCenterNav } from "./DevCenterNav";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";

export function DevCenterShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Developer Center
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
            {description ? (
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="rounded-full">
              <ShieldCheck className="mr-1 h-3 w-3" /> Admin
            </Badge>
            {actions}
          </div>
        </header>
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <aside><DevCenterNav /></aside>
          <section className="min-w-0">{children}</section>
        </div>
      </main>
    </div>
  );
}

export function EmptyPanel({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border/60 bg-card/30 p-10 text-center">
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
