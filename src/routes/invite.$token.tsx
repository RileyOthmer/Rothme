import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { acceptInvite } from "@/lib/collab/members.functions";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/brand/Wordmark";

export const Route = createFileRoute("/invite/$token")({
  component: InvitePage,
});

function InvitePage() {
  const { token } = Route.useParams();
  const navigate = useNavigate();
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setSignedIn(!!data.user));
  }, []);

  const accept = useMutation({
    mutationFn: () => acceptInvite({ data: { token } }),
    onSuccess: () => navigate({ to: "/dashboard" }),
    onError: (e: any) => setError(e?.message ?? "Failed to accept invite"),
  });

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mb-6 flex justify-center">
          <Wordmark />
        </div>
        <h1 className="text-xl font-semibold">You've been invited to a team</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Accept to join the shared workspace and start collaborating.
        </p>

        {signedIn === null ? null : signedIn ? (
          <Button
            className="mt-6 w-full"
            disabled={accept.isPending}
            onClick={() => accept.mutate()}
          >
            {accept.isPending ? "Joining…" : "Accept invite"}
          </Button>
        ) : (
          <Button
            className="mt-6 w-full"
            onClick={() =>
              navigate({
                to: "/auth",
                search: { redirect: `/invite/${token}` },
              })
            }
          >
            Sign in to accept
          </Button>
        )}

        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      </div>
    </div>
  );
}
