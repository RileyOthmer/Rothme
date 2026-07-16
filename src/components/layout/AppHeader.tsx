import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Settings as SettingsIcon, LogOut, RefreshCw, Shield } from "lucide-react";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { OrgSwitcher } from "@/features/collab/OrgSwitcher";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAdmin } = useIsAdmin();

  const handleSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="flex items-center justify-between gap-3 px-3 py-2.5 sm:px-6 sm:py-3">
        <div className="flex min-w-0 items-center gap-2">
          <SidebarTrigger className="shrink-0" />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden text-xs text-muted-foreground lg:inline">{today}</span>
          {onRefresh ? (
            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-xs font-medium text-foreground shadow-xs transition-all duration-150 hover:bg-surface-2"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Refresh</span>
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
              {isAdmin ? (
                <DropdownMenuItem asChild>
                  <Link to="/admin" className="w-full cursor-pointer">
                    <Shield className="mr-2 h-4 w-4" /> Admin Console
                  </Link>
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
