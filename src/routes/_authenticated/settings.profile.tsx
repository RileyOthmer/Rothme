import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Loader2, LogOut } from "lucide-react";
import { Toaster, toast } from "sonner";

import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getProfile, updateProfile } from "@/lib/profile.functions";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/settings/profile")({
  head: () => ({
    meta: [
      { title: "Profile — ROTHME" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProfileSettings,
});

function ProfileSettings() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fetchProfile = useServerFn(getProfile);
  const saveProfile = useServerFn(updateProfile);

  const profile = useQuery({ queryKey: ["profile"], queryFn: () => fetchProfile() });

  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (profile.data) {
      setFullName(profile.data.full_name ?? "");
      setBusinessName(profile.data.business_name ?? "");
    }
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setEmail(data.user.email);
    });
  }, [profile.data]);

  const saveMutation = useMutation({
    mutationFn: () =>
      saveProfile({ data: { full_name: fullName.trim(), business_name: businessName.trim() } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Saved.");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save."),
  });

  const emailMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.updateUser({ email });
      if (error) throw error;
    },
    onSuccess: () => toast.success("Check your inbox to confirm your new email."),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not update email."),
  });

  const passwordMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Password updated.");
      setPassword("");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not update password."),
  });

  const handleSignOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your account and business info.</p>
        </div>

        <nav className="mb-6 flex gap-1 border-b border-border">
          <Link
            to="/settings/profile"
            className="border-b-2 border-foreground px-3 py-2 text-sm font-medium"
          >
            Profile
          </Link>
          <Link
            to="/settings/connections"
            className="border-b-2 border-transparent px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Connections
          </Link>
        </nav>

        <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="text-base font-semibold">Your details</h2>
          <div className="mt-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="full_name">Your name</Label>
              <Input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={100} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="business_name">Business name</Label>
              <Input
                id="business_name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                maxLength={100}
              />
            </div>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="text-base font-semibold">Email</h2>
          <div className="mt-4 flex items-end gap-3">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} />
            </div>
            <Button variant="outline" onClick={() => emailMutation.mutate()} disabled={emailMutation.isPending}>
              Update
            </Button>
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="text-base font-semibold">Password</h2>
          <div className="mt-4 flex items-end gap-3">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                maxLength={72}
                autoComplete="new-password"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => passwordMutation.mutate()}
              disabled={passwordMutation.isPending || password.length < 8}
            >
              Update
            </Button>
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="text-base font-semibold">Sign out</h2>
          <p className="mt-1 text-sm text-muted-foreground">You can sign back in any time.</p>
          <Button variant="outline" className="mt-4" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </section>
      </main>
      <Toaster theme="light" position="bottom-right" />
    </div>
  );
}
