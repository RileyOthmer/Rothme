import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FileText,
  Settings as SettingsIcon,
  Target,
  Users,
  CheckSquare,
  BarChart3,
  LineChart,
  Send,
  Boxes,
  Shield,
} from "lucide-react";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { Wordmark } from "@/components/brand/Wordmark";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

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

function isActivePath(pathname: string, to: string): boolean {
  if (pathname === to) return true;
  if (to === "/settings/profile" && pathname.startsWith("/settings")) return true;
  if (to === "/reports" && pathname.startsWith("/reports")) return true;
  if (to.startsWith("/dev-center") && pathname.startsWith("/dev-center")) return true;
  if (to === "/analytics" && pathname.startsWith("/analytics")) return true;
  return false;
}

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { isAdmin } = useIsAdmin();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/dashboard" aria-label="ROTHME home" className="flex h-9 items-center px-2">
          {collapsed ? (
            <span className="grid h-7 w-7 place-items-center rounded-md bg-foreground text-[11px] font-bold text-background">
              R
            </span>
          ) : (
            <Wordmark />
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((item) => {
                const active = isActivePath(pathname, item.to);
                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                      <Link to={item.to}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin ? (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith("/admin")}
                    tooltip="Admin Console"
                    className="text-primary data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
                  >
                    <Link to="/admin">
                      <Shield className="h-4 w-4" />
                      <span>Admin Console</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <p className="px-2 py-1 text-[10px] text-muted-foreground group-data-[collapsible=icon]:hidden">
          v1 · Velora
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
