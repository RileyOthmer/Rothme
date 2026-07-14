import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { getOnboardingSession, saveOnboardingStep } from "@/lib/onboarding/session.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/onboarding/discovery")({
  head: () => ({ meta: [{ title: "About your business — ROTHME" }, { name: "robots", content: "noindex" }] }),
  component: DiscoveryStep,
});

type SubStep = {
  id: string;
  title: string;
  subtitle: string;
  fields: FieldDef[];
};

type FieldDef = {
  key: string;
  label: string;
  type: "text" | "textarea" | "select" | "multi" | "chips";
  placeholder?: string;
  options?: string[];
  optional?: boolean;
};

const INDUSTRIES = ["Retail & ecommerce","Restaurant & hospitality","Professional services","Health & wellness","Fitness","Beauty","Home services","Real estate","Education","SaaS & tech","Nonprofit","Creator / personal brand","Other"];
const BIZ_TYPES = ["B2C","B2B","D2C","Marketplace","Nonprofit","Agency","Creator"];
const SIZES = ["Just me","2–10","11–50","51–200","200+"];
const EMPLOYEES = ["1","2–5","6–20","21–100","100+"];
const REVENUE = ["<$50k","$50k–$250k","$250k–$1M","$1M–$10M","$10M+","Prefer not to say"];
const EXPERIENCE = ["Complete beginner","Some experience","Comfortable","Advanced"];
const BUDGETS = ["Under $500/mo","$500–2,000/mo","$2,000–10,000/mo","$10,000+/mo","Not sure"];
const GOALS = ["Get more customers","Grow social following","Save time","Understand what's working","Post consistently","Better ROI on ads","Team alignment","Automate reporting"];
const SOCIAL = ["Instagram","Facebook","TikTok","LinkedIn","YouTube","X","Pinterest","Threads","Google Business"];
const CRMS = ["HubSpot","Salesforce","Pipedrive","Zoho","None","Other"];
const EMAILS = ["Mailchimp","Klaviyo","ActiveCampaign","ConvertKit","None","Other"];
const ANALYTICS = ["Google Analytics","Meta insights","Native platform only","None","Other"];
const PAIN = ["Don't know what's working","No time to post","Data everywhere","Reporting takes forever","Writing content","Team not aligned","Feeling behind"];
const AI_LEVELS = ["Just suggest — I'll decide","Draft everything for me","Fully automate when I approve rules"];

const SUB_STEPS: SubStep[] = [
  {
    id: "identity",
    title: "Let's start with the basics.",
    subtitle: "What should we call your business?",
    fields: [
      { key: "businessName", label: "Business name", type: "text", placeholder: "e.g. Northlight Coffee" },
      { key: "website", label: "Website", type: "text", placeholder: "https://…", optional: true },
      { key: "industry", label: "Industry", type: "select", options: INDUSTRIES },
      { key: "businessType", label: "Business type", type: "select", options: BIZ_TYPES },
    ],
  },
  {
    id: "scale",
    title: "Tell us about the shape of your team.",
    subtitle: "This helps ROTHME right-size recommendations.",
    fields: [
      { key: "companySize", label: "Company size", type: "select", options: SIZES },
      { key: "employees", label: "People on marketing", type: "select", options: EMPLOYEES },
      { key: "revenue", label: "Revenue range", type: "select", options: REVENUE, optional: true },
      { key: "country", label: "Country", type: "text", placeholder: "e.g. United States" },
      { key: "timezone", label: "Timezone", type: "text", placeholder: "e.g. America/New_York" },
      { key: "languages", label: "Languages you publish in", type: "chips", options: ["English","Spanish","French","German","Portuguese","Italian","Other"] },
    ],
  },
  {
    id: "goals",
    title: "What are you trying to do?",
    subtitle: "Pick the goals that matter this quarter.",
    fields: [
      { key: "experience", label: "Marketing experience", type: "select", options: EXPERIENCE },
      { key: "budget", label: "Monthly marketing budget", type: "select", options: BUDGETS },
      { key: "goals", label: "Business goals", type: "chips", options: GOALS },
      { key: "successGoals", label: "What would success look like in 90 days?", type: "textarea", placeholder: "In your words — no jargon needed." },
    ],
  },
  {
    id: "audience",
    title: "Who do you serve, and what do you sell?",
    subtitle: "The clearer the picture, the sharper the AI.",
    fields: [
      { key: "targetAudience", label: "Target audience", type: "textarea", placeholder: "Who buys from you? What do they care about?" },
      { key: "primaryProducts", label: "Primary products", type: "textarea", placeholder: "Your top 3 products.", optional: true },
      { key: "primaryServices", label: "Primary services", type: "textarea", placeholder: "Your top 3 services.", optional: true },
      { key: "competitors", label: "Competitors you watch", type: "text", placeholder: "Names or URLs, comma-separated", optional: true },
    ],
  },
  {
    id: "stack",
    title: "What are you using today?",
    subtitle: "We'll only show you what fits.",
    fields: [
      { key: "socialPlatforms", label: "Social platforms you use", type: "chips", options: SOCIAL },
      { key: "crm", label: "CRM", type: "select", options: CRMS },
      { key: "emailPlatform", label: "Email platform", type: "select", options: EMAILS },
      { key: "analyticsPlatform", label: "Analytics", type: "select", options: ANALYTICS },
    ],
  },
  {
    id: "pain",
    title: "Where does it hurt most?",
    subtitle: "This is what ROTHME will attack first.",
    fields: [
      { key: "painPoints", label: "Pain points", type: "chips", options: PAIN },
      { key: "aiLevel", label: "Preferred AI assistance level", type: "select", options: AI_LEVELS },
    ],
  },
];

function DiscoveryStep() {
  const navigate = useNavigate();
  const getSession = useServerFn(getOnboardingSession);
  const save = useServerFn(saveOnboardingStep);
  const { data: session, refetch } = useQuery({
    queryKey: ["onboarding-session"],
    queryFn: () => getSession(),
  });

  const [subIdx, setSubIdx] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [local, setLocal] = useState<Record<string, any>>({});

  // Hydrate from server after first read
  useEffect(() => {
    if (session?.answers) setLocal((prev) => ({ ...session.answers, ...prev }));
  }, [session?.answers]);

  const current = SUB_STEPS[subIdx];
  const isLast = subIdx === SUB_STEPS.length - 1;

  const requiredFilled = useMemo(
    () => current.fields.filter((f) => !f.optional).every((f) => {
      const v = local[f.key];
      return f.type === "chips" ? Array.isArray(v) && v.length > 0 : !!v;
    }),
    [current, local],
  );

  const persist = async (patch: Record<string, unknown>) => {
    setLocal((p) => ({ ...p, ...patch }));
    await save({ data: { step: "discovery", answers: { ...local, ...patch } } }).catch(() => {});
  };

  const next = async () => {
    await save({ data: { step: "discovery", answers: local } }).catch(() => {});
    if (isLast) {
      await save({ data: { step: "analysis" } }).catch(() => {});
      await refetch();
      navigate({ to: "/onboarding/analysis" });
    } else {
      setSubIdx((i) => i + 1);
    }
  };

  const back = async () => {
    if (subIdx === 0) navigate({ to: "/onboarding/welcome" });
    else setSubIdx((i) => i - 1);
  };

  return (
    <OnboardingShell currentStepId="discovery" session={session ?? null}>
      <div className="mx-auto max-w-2xl">
        <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
          <span>Section {subIdx + 1} of {SUB_STEPS.length}</span>
          <div className="ml-2 flex gap-1">
            {SUB_STEPS.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1 w-6 rounded-full transition-colors",
                  i <= subIdx ? "bg-primary" : "bg-muted",
                )}
              />
            ))}
          </div>
        </div>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{current.title}</h1>
        <p className="mt-2 text-muted-foreground">{current.subtitle}</p>

        <div className="mt-8 space-y-6">
          {current.fields.map((f) => (
            <FieldRenderer key={f.key} field={f} value={local[f.key]} onChange={(v) => persist({ [f.key]: v })} />
          ))}
        </div>

        <div className="mt-10 flex items-center justify-between">
          <Button variant="ghost" onClick={back} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <Button onClick={next} disabled={!requiredFilled} size="lg" className="gap-2">
            {isLast ? "Analyze my business" : "Continue"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </OnboardingShell>
  );
}

function FieldRenderer({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (v: any) => void;
}) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-sm font-medium">
        {field.label}
        {field.optional && <span className="text-xs font-normal text-muted-foreground">(optional)</span>}
      </label>
      {field.type === "text" && (
        <Input
          placeholder={field.placeholder}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="h-11"
        />
      )}
      {field.type === "textarea" && (
        <Textarea
          placeholder={field.placeholder}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
        />
      )}
      {field.type === "select" && (
        <div className="flex flex-wrap gap-2">
          {field.options?.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm transition-all",
                value === opt
                  ? "border-primary bg-primary/10 text-foreground shadow-sm"
                  : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground",
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
      {field.type === "chips" && (
        <div className="flex flex-wrap gap-2">
          {field.options?.map((opt) => {
            const arr: string[] = Array.isArray(value) ? value : [];
            const on = arr.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onChange(on ? arr.filter((x) => x !== opt) : [...arr, opt])}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all",
                  on
                    ? "border-primary bg-primary/10 text-foreground shadow-sm"
                    : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground",
                )}
              >
                {on && <Check className="h-3 w-3 text-primary" />}
                {opt}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
