import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Check } from "lucide-react";
import { Toaster, toast } from "sonner";

import { Wordmark } from "@/components/brand/Wordmark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getProfile, updateProfile } from "@/lib/profile.functions";
import {
  connectProvider,
  disconnectProvider,
  listConnections,
  PROVIDERS,
  PROVIDER_META,
  type Provider,
} from "@/lib/connections.functions";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "Get set up — Northstar" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OnboardingPage,
});

function OnboardingPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fetchProfile = useServerFn(getProfile);
  const saveProfile = useServerFn(updateProfile);
  const fetchConnections = useServerFn(listConnections);
  const connectFn = useServerFn(connectProvider);
  const disconnectFn = useServerFn(disconnectProvider);

  const profile = useQuery({ queryKey: ["profile"], queryFn: () => fetchProfile() });
  const connections = useQuery({
    queryKey: ["connections"],
    queryFn: () => fetchConnections(),
  });

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [fullName, setFullName] = useState(profile.data?.full_name ?? "");
  const [businessName, setBusinessName] = useState(profile.data?.business_name ?? "");

  const step1 = useMutation({
    mutationFn: (input: { full_name: string; business_name: string }) =>
      saveProfile({ data: input }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      setStep(2);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save."),
  });

  const connectMutation = useMutation({
    mutationFn: (provider: Provider) => connectFn({ data: { provider } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["connections"] }),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not connect."),
  });
  const disconnectMutation = useMutation({
    mutationFn: (provider: Provider) => disconnectFn({ data: { provider } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["connections"] }),
  });

  const finish = useMutation({
    mutationFn: () => saveProfile({ data: { mark_onboarded: true } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      navigate({ to: "/dashboard", replace: true });
    },
  });

  const connectedSet = new Set((connections.data ?? []).map((c) => c.provider));

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Wordmark />
        <span className="text-xs text-muted-foreground">Step {step} of 3</span>
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 pb-16 sm:px-0">
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
          {step === 1 ? (
            <>
              <h1 className="text-xl font-semibold tracking-tight">Tell us about your business</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                We'll use this to personalize your dashboard.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  step1.mutate({ full_name: fullName.trim(), business_name: businessName.trim() });
                }}
                className="mt-6 space-y-4"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="full_name">Your name</Label>
                  <Input
                    id="full_name"
                    required
                    maxLength={100}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="business_name">Business name</Label>
                  <Input
                    id="business_name"
                    required
                    maxLength={100}
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={step1.isPending}>
                  {step1.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue"}
                </Button>
              </form>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <h1 className="text-xl font-semibold tracking-tight">Connect your marketing accounts</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Connect the tools you use. You can add more later.
              </p>
              <p className="mt-3 rounded-md bg-surface-2 px-3 py-2 text-xs text-muted-foreground">
                Demo connections for now — real account linking is coming soon.
              </p>

              <ul className="mt-6 space-y-2">
                {PROVIDERS.map((p) => {
                  const meta = PROVIDER_META[p];
                  const connected = connectedSet.has(p);
                  return (
                    <li
                      key={p}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
                    >
                      <div>
                        <div className="text-sm font-medium">{meta.name}</div>
                        <div className="text-xs text-muted-foreground">{meta.blurb}</div>
                      </div>
                      {connected ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => disconnectMutation.mutate(p)}
                          disabled={disconnectMutation.isPending}
                        >
                          <Check className="h-3.5 w-3.5" /> Connected
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => connectMutation.mutate(p)}
                          disabled={connectMutation.isPending}
                        >
                          Connect
                        </Button>
                      )}
                    </li>
                  );
                })}
              </ul>

              <div className="mt-6 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                >
                  Skip for now
                </button>
                <Button onClick={() => setStep(3)}>Continue</Button>
              </div>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <h1 className="text-xl font-semibold tracking-tight">You're all set</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Your first dashboard is ready. We'll keep watching your marketing and let you know what to
                do next.
              </p>
              <Button
                className="mt-6 w-full"
                onClick={() => finish.mutate()}
                disabled={finish.isPending}
              >
                {finish.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Go to dashboard"}
              </Button>
            </>
          ) : null}
        </div>
      </main>
      <Toaster theme="light" position="bottom-right" />
    </div>
  );
}
