import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Wordmark } from "@/components/brand/Wordmark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster, toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth/forgot")({
  head: () => ({
    meta: [
      { title: "Reset password — Northstar" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ForgotPage,
});

function ForgotPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;
      setSent(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send reset email.");
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
          <h1 className="text-xl font-semibold tracking-tight">Reset your password</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {sent
              ? "Check your email for a link to set a new password."
              : "Enter your email and we'll send you a link to set a new password."}
          </p>
          {!sent ? (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send reset link"}
              </Button>
            </form>
          ) : null}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link to="/auth" className="font-medium text-foreground underline-offset-4 hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>
      </main>
      <Toaster theme="light" position="bottom-right" />
    </div>
  );
}
