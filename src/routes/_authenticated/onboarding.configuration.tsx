import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { getOnboardingSession, saveOnboardingStep } from "@/lib/onboarding/session.functions";

export const Route = createFileRoute("/_authenticated/onboarding/configuration")({
  head: () => ({ meta: [{ title: "Brand profile — Velora" }, { name: "robots", content: "noindex" }] }),
  component: ConfigurationStep,
});

function ConfigurationStep() {
  const navigate = useNavigate();
  const getSession = useServerFn(getOnboardingSession);
  const save = useServerFn(saveOnboardingStep);
  const { data: session } = useQuery({ queryKey: ["onboarding-session"], queryFn: () => getSession() });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [brand, setBrand] = useState<Record<string, any>>({});
  useEffect(() => { if (session?.brand) setBrand((p) => ({ ...session.brand, ...p })); }, [session?.brand]);

  const setField = (k: string, v: unknown) => {
    setBrand((p) => ({ ...p, [k]: v }));
    save({ data: { brand: { [k]: v } } }).catch(() => {});
  };

  const next = async () => {
    await save({ data: { step: "ai-training", checklist: { brand_profile_complete: true } } }).catch(() => {});
    navigate({ to: "/onboarding/ai-training" });
  };

  return (
    <OnboardingShell currentStepId="configuration" session={session ?? null}>
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Set up your brand.</h1>
        <p className="mt-3 text-muted-foreground">Everything Velora writes will match this voice.</p>

        <div className="mt-8 space-y-5">
          <Field label="Company description">
            <Textarea rows={3} value={brand.description ?? ""} onChange={(e) => setField("description", e.target.value)} placeholder="What you do, in one paragraph." />
          </Field>
          <Field label="Mission">
            <Textarea rows={2} value={brand.mission ?? ""} onChange={(e) => setField("mission", e.target.value)} placeholder="Why you exist." />
          </Field>
          <Field label="Brand voice">
            <Input value={brand.voice ?? ""} onChange={(e) => setField("voice", e.target.value)} placeholder="e.g. warm, direct, no jargon" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Primary color">
              <Input type="color" className="h-11 w-full cursor-pointer p-1" value={brand.primaryColor ?? "#7c3aed"} onChange={(e) => setField("primaryColor", e.target.value)} />
            </Field>
            <Field label="Accent color">
              <Input type="color" className="h-11 w-full cursor-pointer p-1" value={brand.accentColor ?? "#22d3ee"} onChange={(e) => setField("accentColor", e.target.value)} />
            </Field>
          </div>
          <Field label="Business hours">
            <Input value={brand.hours ?? ""} onChange={(e) => setField("hours", e.target.value)} placeholder="e.g. Mon–Fri 9am–6pm ET" />
          </Field>
          <Field label="Invite teammates (comma-separated emails, optional)">
            <Input value={brand.invites ?? ""} onChange={(e) => setField("invites", e.target.value)} placeholder="alex@company.com, sam@company.com" />
          </Field>
        </div>

        <div className="mt-10 flex justify-end">
          <Button size="lg" onClick={next} className="gap-2">Continue<ArrowRight className="h-4 w-4" /></Button>
        </div>
      </div>
    </OnboardingShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}
