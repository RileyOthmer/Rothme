import { useEffect, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, FileText, Settings as SettingsIcon, LogOut, RefreshCw, Target, Users, CheckSquare, BarChart3, LineChart, Send, Boxes } from "lucide-react";
import { Wordmark } from "@/components/brand/Wordmark";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { OrgSwitcher } from "@/features/collab/OrgSwitcher";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/publishing", label: "Publishing", icon: Send },
  { to: "/analytics", label: "Analytics", icon: LineChart },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/team", label: "Team", icon: Users },
  { to: "/insights", label: "Insights", icon: BarChart3 },
  { to: "/dev-center/integrations", label: "Dev Center", icon: Boxes },
  { to: "/settings/profile", label: "Settings", icon: SettingsIcon },
] as const;

export function AppHeader({ onRefresh }: { onRefresh?: () => void }) {
  const [today, setToday] = useState<string>("");
  useEffect(() => {
    setToday(
      new Date().toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      }),
    );
  }, []);

  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" aria-label="ROTHME home">
            <Wordmark />
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {NAV.map((item) => {
              const active =
                pathname === item.to ||
                (item.to === "/settings/profile" && pathname.startsWith("/settings")) ||
                (item.to === "/reports" && pathname.startsWith("/reports")) ||
                (item.to.startsWith("/dev-center") && pathname.startsWith("/dev-center"));
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={
                    "inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors " +
                    (active
                      ? "bg-surface text-foreground"
                      : "text-muted-foreground hover:bg-surface hover:text-foreground")
                  }
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-muted-foreground sm:inline">{today}</span>
          {onRefresh ? (
            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-xs font-medium text-foreground shadow-xs transition-all duration-150 hover:bg-surface-2"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
          ) : null}
          <OrgSwitcher />
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Account menu"
              className="grid h-8 w-8 place-items-center rounded-full border border-border bg-surface text-xs font-medium text-foreground shadow-xs transition-colors hover:bg-surface-2"
            >
              N
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link to="/settings/profile" className="w-full cursor-pointer">
                  <SettingsIcon className="mr-2 h-4 w-4" /> Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="flex items-center gap-1 border-t border-border px-3 py-2 md:hidden" aria-label="Main">
        {NAV.map((item) => {
          const active =
            pathname === item.to ||
            (item.to === "/settings/profile" && pathname.startsWith("/settings")) ||
            (item.to === "/reports" && pathname.startsWith("/reports")) ||
            (item.to.startsWith("/dev-center") && pathname.startsWith("/dev-center"));
          return (
            <Link
              key={item.to}
              to={item.to}
              className={
                "inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors " +
                (active
                  ? "bg-surface text-foreground"
                  : "text-muted-foreground hover:bg-surface hover:text-foreground")
              }
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
