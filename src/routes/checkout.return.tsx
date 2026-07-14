import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment } from "@/lib/stripe";
import { Wordmark } from "@/components/brand/Wordmark";

export const Route = createFileRoute("/checkout/return")({
  validateSearch: (search: Record<string, unknown>): { session_id?: string } => ({
    session_id: typeof search.session_id === "string" ? search.session_id : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Welcome to ROTHME Pro" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutReturn,
});

function CheckoutReturn() {
  const { session_id } = Route.useSearch();
  const navigate = useNavigate();
  const [state, setState] = useState<"loading" | "success" | "pending">("loading");
  const [nextPath, setNextPath] = useState<string>("/dashboard");

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    const poll = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) {
        navigate({ to: "/auth" });
        return;
      }

      // Decide next destination: resume onboarding if incomplete, else dashboard
      const { data: onboarding } = await supabase
        .from("onboarding_sessions")
        .select("current_step, completed_at")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (onboarding && !onboarding.completed_at) {
        const step = (onboarding.current_step as string | null) || "welcome";
        setNextPath(`/onboarding/${step}`);
      } else {
        setNextPath("/dashboard");
      }

      const env = getStripeEnvironment();
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("status")
        .eq("user_id", userId)
        .eq("environment", env)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cancelled) return;

      if (sub && ["active", "trialing"].includes(sub.status as string)) {
        setState("success");
        return;
      }

      attempts += 1;
      if (attempts < 12) {
        setTimeout(poll, 1000);
      } else {
        setState("pending");
      }
    };
    poll();
    return () => { cancelled = true; };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/70">
        <div className="mx-auto flex h-14 max-w-4xl items-center px-4 sm:px-6"><Wordmark /></div>
      </header>
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        {state === "loading" && (
          <>
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-muted-foreground" />
            <h1 className="mt-6 text-2xl font-semibold">Activating your subscription…</h1>
            <p className="mt-2 text-muted-foreground">This takes just a moment.</p>
          </>
        )}
        {state === "success" && (
          <>
            <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
            <h1 className="mt-6 text-3xl font-semibold">You're on ROTHME Pro.</h1>
            <p className="mt-3 text-muted-foreground">
              All Pro features are unlocked. A receipt is on the way to your inbox.
            </p>
            <Link
              to={nextPath}
              className="mt-8 inline-flex items-center justify-center rounded-lg bg-foreground px-5 py-3 text-sm font-medium text-background hover:opacity-90"
            >
              {nextPath.startsWith("/onboarding") ? "Continue setup" : "Go to dashboard"}
            </Link>
            {session_id && <p className="mt-8 text-xs text-muted-foreground/70">Ref: {session_id.slice(0, 24)}…</p>}
          </>
        )}
        {state === "pending" && (
          <>
            <h1 className="text-2xl font-semibold">Payment received</h1>
            <p className="mt-2 text-muted-foreground">
              Stripe is still confirming your subscription. Refresh in a moment, or head to your dashboard —
              your access will unlock automatically.
            </p>
            <Link
              to="/dashboard"
              className="mt-8 inline-flex items-center justify-center rounded-lg border border-border/70 px-5 py-3 text-sm font-medium hover:bg-muted/50"
            >
              Go to dashboard
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
