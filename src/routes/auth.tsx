import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { checkIsAdmin } from "@/lib/admin/credentials.functions";
import { Wordmark } from "@/components/brand/Wordmark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast, Toaster } from "sonner";

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — ROTHME" },
      {
        name: "description",
        content:
          "Sign in to ROTHME or create an account to access your AI marketing strategist, unified analytics, publishing, and automations in one workspace.",
      },
      { property: "og:title", content: "Sign in to ROTHME" },
      {
        property: "og:description",
        content: "Access your AI marketing workspace — sign in or create a free account to get started.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  validateSearch: (search) => searchSchema.parse(search),
  component: AuthPage,
});

// Split "/checkout?plan=pro_monthly" into { to: "/checkout", search: { plan: "pro_monthly" } }
// so TanStack navigate handles the query string instead of treating it as part of the path.
function navTarget(redirect: string | undefined, defaultTo: string = "/dashboard") {
  if (!redirect || !redirect.startsWith("/") || redirect.startsWith("//")) {
    return { to: defaultTo, search: undefined as Record<string, string> | undefined };
  }
  const [path, query] = redirect.split("?", 2);
  if (!query) return { to: path, search: undefined };
  const search: Record<string, string> = {};
  for (const [k, v] of new URLSearchParams(query)) search[k] = v;
  return { to: path, search };
}

/**
 * Ask the server whether the just-signed-in user is an admin.
 * Server-side check (RLS + role table); never trust the client for authorization.
 * Falls back to "user" if the check fails — never accidentally grant admin.
 */
async function resolveLandingRoute(redirect: string | undefined): Promise<{ to: string; search?: Record<string, string> }> {
  // Honor an explicit redirect param (e.g. deep link, checkout return) as-is.
  if (redirect && redirect.startsWith("/") && !redirect.startsWith("//")) {
    return navTarget(redirect);
  }
  try {
    const { isAdmin } = await checkIsAdmin({});
    return navTarget(undefined, isAdmin ? "/admin" : "/dashboard");
  } catch {
    return navTarget(undefined, "/dashboard");
  }
}

function AuthPage() {
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: "/auth" });
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  // If already signed in, bounce.
  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (mounted && data.user) {
        const t = navTarget(redirect);
        navigate({ to: t.to, search: t.search, replace: true } as never);
      }
    });
    return () => {
      mounted = false;
    };
  }, [navigate, redirect]);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Only preserve same-origin relative paths, so OAuth consent URLs
      // (e.g. /.lovable/oauth/consent?...) survive the sign-in round-trip.
      const safeRedirect =
        redirect && redirect.startsWith("/") && !redirect.startsWith("//") ? redirect : undefined;
      const returnQuery = safeRedirect
        ? `?redirect=${encodeURIComponent(safeRedirect)}`
        : "";
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth${returnQuery}`,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account, then sign in.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const t = navTarget(safeRedirect);
        navigate({ to: t.to, search: t.search, replace: true } as never);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const safeRedirect =
        redirect && redirect.startsWith("/") && !redirect.startsWith("//") ? redirect : undefined;
      const returnQuery = safeRedirect
        ? `?redirect=${encodeURIComponent(safeRedirect)}`
        : "";
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: `${window.location.origin}/auth${returnQuery}`,
      });
      if (result.error) throw result.error;
      if (result.redirected) return;
      // Session set by helper — navigate.
      const t = navTarget(safeRedirect);
      navigate({ to: t.to, search: t.search, replace: true } as never);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Wordmark />
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 pb-16 sm:px-0">
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
          <h1 className="text-xl font-semibold tracking-tight">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Sign in to see this week's marketing at a glance."
              : "Two minutes to set up. No credit card required."}
          </p>

          <div className="mt-6 space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogle}
              disabled={loading}
            >
              <GoogleIcon /> Continue with Google
            </Button>
          </div>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            or
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleEmail} className="space-y-4">
            {mode === "signup" ? (
              <div className="space-y-1.5">
                <Label htmlFor="full_name">Your name</Label>
                <Input
                  id="full_name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  maxLength={100}
                  autoComplete="name"
                />
              </div>
            ) : null}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                maxLength={255}
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {mode === "signin" ? (
                  <button
                    type="button"
                    onClick={() => navigate({ to: "/auth/forgot" })}
                    className="text-xs text-muted-foreground underline-offset-4 hover:underline"
                  >
                    Forgot?
                  </button>
                ) : null}
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                maxLength={72}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "New to ROTHME? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </main>
      <Toaster theme="light" position="bottom-right" />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.7 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.9 1.5l2.7-2.6C16.9 3.3 14.7 2.3 12 2.3 6.7 2.3 2.4 6.6 2.4 12s4.3 9.7 9.6 9.7c5.6 0 9.3-3.9 9.3-9.4 0-.6-.1-1.1-.2-1.6H12z" />
    </svg>
  );
}
