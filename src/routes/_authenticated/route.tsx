import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { CommandBar } from "@/components/assistant/CommandBar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { GlobalSearchLauncher } from "@/components/search/GlobalSearchLauncher";
import { isPaymentsConfigured, getStripeEnvironment } from "@/lib/stripe";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({
        to: "/auth",
        search: { redirect: location.href },
      });
    }

    // Enforce subscription on every authenticated route except onboarding
    // and checkout — users who haven't subscribed are sent to the plan page.
    const isOnboardingPath =
      location.pathname.startsWith("/onboarding") ||
      location.pathname.startsWith("/checkout") ||
      location.pathname.startsWith("/settings/billing");

    if (!isOnboardingPath && isPaymentsConfigured()) {
      const env = getStripeEnvironment();
      const { data: profile } = await supabase
        .from("profiles")
        .select("active_org_id")
        .eq("id", data.user.id)
        .maybeSingle();
      const activeOrg = (profile?.active_org_id as string | null) ?? null;

      let query = supabase
        .from("subscriptions")
        .select("status,current_period_end")
        .eq("environment", env)
        .order("created_at", { ascending: false })
        .limit(1);
      query = activeOrg
        ? query.eq("org_id", activeOrg)
        : query.eq("user_id", data.user.id);

      const { data: sub } = await query.maybeSingle();
      const now = Date.now();
      const periodEnd = sub?.current_period_end
        ? new Date(sub.current_period_end).getTime()
        : null;
      const isActive =
        sub &&
        (["active", "trialing", "past_due"].includes(sub.status) &&
          (!periodEnd || periodEnd > now)) ||
        (sub.status === "canceled" && periodEnd !== null && periodEnd > now);

      if (!isActive) {
        throw redirect({ to: "/onboarding/subscription" });
      }
    }

    return { user: data.user };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="min-w-0 flex-1">
          <Outlet />
          <CommandBar />
          <GlobalSearchLauncher />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
