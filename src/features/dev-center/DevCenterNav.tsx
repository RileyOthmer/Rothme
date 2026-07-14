import { Link, useRouterState } from "@tanstack/react-router";
import {
  Boxes, Plug, Activity, RefreshCw, KeyRound, Webhook,
  Map, Send, ScrollText, Clock, Lock, Cpu,
} from "lucide-react";

export const DEV_CENTER_NAV = [
  { to: "/dev-center/integrations",       label: "Integrations",       icon: Boxes },
  { to: "/dev-center/connections",        label: "Connected Accounts", icon: Plug },
  { to: "/dev-center/health",             label: "API Health",         icon: Activity },
  { to: "/dev-center/sync",               label: "Sync Manager",       icon: RefreshCw },
  { to: "/dev-center/oauth",              label: "OAuth Manager",      icon: KeyRound },
  { to: "/dev-center/webhooks",           label: "Webhooks",           icon: Webhook },
  { to: "/dev-center/analytics-mapping",  label: "Analytics Mapping",  icon: Map },
  { to: "/dev-center/publishing",         label: "Publishing",         icon: Send },
  { to: "/dev-center/logs",               label: "Logs",               icon: ScrollText },
  { to: "/dev-center/scheduler",          label: "Scheduler",          icon: Clock },
  { to: "/dev-center/secrets",            label: "Secrets Manager",    icon: Lock },
  { to: "/dev-center/status",             label: "System Status",      icon: Cpu },
] as const;

export function DevCenterNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav aria-label="Developer Center" className="rounded-2xl border border-border/60 bg-card/40 p-2">
      <ul className="space-y-0.5">
        {DEV_CENTER_NAV.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.to || pathname.startsWith(item.to + "/");
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                className={
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition " +
                  (active
                    ? "bg-primary/10 text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground")
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
