import { Link } from "@tanstack/react-router";
import { Lock, Sparkles } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { isPaymentsConfigured } from "@/lib/stripe";

interface Props {
  children: ReactNode;
  featureName?: string;
}

/**
 * Client-side Pro feature gate. Falls open if payments aren't configured
 * (dev/preview without live token) so builders can still see the app.
 * Server operations must additionally check subscription status.
 */
export function RequirePro({ children, featureName = "This feature" }: Props) {
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);
  const { isActive, loading } = useSubscription(userId);

  if (!isPaymentsConfigured() || loading) return <>{children}</>;
  if (isActive) return <>{children}</>;

  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Lock className="h-5 w-5" />
      </div>
      <h1 className="mt-6 text-2xl font-semibold">{featureName} is on ROTHME Pro</h1>
      <p className="mt-3 text-muted-foreground">
        Upgrade to ROTHME Pro to unlock unified analytics, the AI strategist, and every connector.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link
          to="/pricing"
          className="inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-3 text-sm font-medium text-background hover:opacity-90"
        >
          <Sparkles className="h-4 w-4" /> Upgrade to Pro
        </Link>
        <Link
          to="/settings/billing"
          className="inline-flex items-center rounded-lg border border-border/70 px-5 py-3 text-sm hover:bg-muted/50"
        >
          Billing
        </Link>
      </div>
    </div>
  );
}
