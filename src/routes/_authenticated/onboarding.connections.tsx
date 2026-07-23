import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { getOnboardingSession, saveOnboardingStep } from "@/lib/onboarding/session.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/onboarding/connections")({
  head: () => ({ meta: [{ title: "Connect platforms — ROTHME" }, { name: "robots", content: "noindex" }] }),
  component: ConnectionsStep,
});

type PlatformCard = {
  id: string;
  name: string;
  initials: string;
  description: string;
  benefit: string;
  gradient: string;
};

const PLATFORMS: PlatformCard[] = [
  { id: "instagram", name: "Instagram", initials: "IG", description: "Posts, reels, insights.", benefit: "See what's actually growing your following.", gradient: "from-[#f58529] via-[#dd2a7b] to-[#8134af]" },
  { id: "facebook", name: "Facebook", initials: "FB", description: "Pages and audience insights.", benefit: "Track reach and engagement in one place.", gradient: "from-[#1877f2] to-[#0a4bc0]" },
  { id: "threads", name: "Threads", initials: "TH", description: "Posts and replies.", benefit: "Follow the conversation ROTHME spots for you.", gradient: "from-[#111] to-[#333]" },
  { id: "tiktok", name: "TikTok", initials: "TT", description: "Video views and follows.", benefit: "Know which videos actually work.", gradient: "from-[#25f4ee] via-[#111] to-[#fe2c55]" },
  { id: "linkedin", name: "LinkedIn", initials: "IN", description: "Company page and posts.", benefit: "Grow your professional reach faster.", gradient: "from-[#0a66c2] to-[#004182]" },
  { id: "x", name: "X", initials: "X", description: "Posts and engagement.", benefit: "See which posts drove traffic.", gradient: "from-[#0f0f0f] to-[#2a2a2a]" },
  { id: "pinterest", name: "Pinterest", initials: "PI", description: "Pins and saves.", benefit: "Find evergreen wins.", gradient: "from-[#e60023] to-[#ad0018]" },
  { id: "youtube", name: "YouTube", initials: "YT", description: "Videos and channel data.", benefit: "See how each video performs over time.", gradient: "from-[#ff0000] to-[#b30000]" },
  { id: "google_business", name: "Google Business", initials: "GB", description: "Local listing and reviews.", benefit: "Turn local searches into visits.", gradient: "from-[#4285f4] to-[#0f9d58]" },
  { id: "mailchimp", name: "Mailchimp", initials: "MC", description: "Email campaigns.", benefit: "Attribute revenue to the right send.", gradient: "from-[#ffe01b] to-[#c8b300]" },
  { id: "hubspot", name: "HubSpot", initials: "HS", description: "CRM and contacts.", benefit: "Bring your pipeline into ROTHME.", gradient: "from-[#ff7a59] to-[#c95530]" },
  { id: "shopify", name: "Shopify", initials: "SH", description: "Sales and products.", benefit: "Tie marketing to actual revenue.", gradient: "from-[#96bf48] to-[#5e8e3e]" },
  { id: "google_analytics", name: "Google Analytics", initials: "GA", description: "Website behavior.", benefit: "See what's driving traffic that converts.", gradient: "from-[#f9ab00] to-[#e37400]" },
];

function ConnectionsStep() {
  const navigate = useNavigate();
  const getSession = useServerFn(getOnboardingSession);
  const save = useServerFn(saveOnboardingStep);
  const { data: session, refetch } = useQuery({
    queryKey: ["onboarding-session"],
    queryFn: () => getSession(),
  });

  const conns = session?.connections ?? {};
  const connectedCount = Object.values(conns).filter((v) => v === "connected").length;

  const set = async (id: string, status: "connected" | "skipped") => {
    await save({
      data: {
        connections: { [id]: status },
        checklist: connectedCount + (status === "connected" ? 1 : 0) >= 1 ? { platforms_connected: true } : {},
      },
    }).catch(() => {});
    refetch();
  };

  const next = async () => {
    await save({ data: { step: "configuration" } }).catch(() => {});
    navigate({ to: "/onboarding/configuration" });
  };

  return (
    <OnboardingShell currentStepId="connections" session={session ?? null}>
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Connect the platforms ROTHME should watch.</h1>
        <p className="mt-3 text-muted-foreground">
          Connect one to see real value fast. You can always add more later.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PLATFORMS.map((p) => {
            const status = conns[p.id];
            return (
              <div
                key={p.id}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border p-4 backdrop-blur-xl transition-all",
                  status === "connected"
                    ? "border-primary/50 bg-primary/5"
                    : "border-border/50 bg-card/50 hover:border-border",
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-semibold text-white shadow-lg",
                      p.gradient,
                    )}
                  >
                    {p.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="truncate font-medium">{p.name}</div>
                      {status === "connected" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                          <Check className="h-2.5 w-2.5" /> Connected
                        </span>
                      )}
                      {status === "skipped" && (
                        <span className="text-[10px] text-muted-foreground">Skipped</span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{p.description}</p>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground/90">{p.benefit}</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    variant={status === "connected" ? "secondary" : "default"}
                    className="h-8 flex-1"
                    onClick={() => set(p.id, "connected")}
                  >
                    {status === "connected" ? "Connected" : "Connect"}
                  </Button>
                  {status !== "connected" && (
                    <Button size="sm" variant="ghost" className="h-8" onClick={() => set(p.id, "skipped")}>
                      Skip
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {connectedCount === 0
              ? "You can skip everything and add platforms later."
              : `${connectedCount} platform${connectedCount === 1 ? "" : "s"} connected.`}
          </p>
          <Button size="lg" onClick={next} className="gap-2">
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </OnboardingShell>
  );
}
