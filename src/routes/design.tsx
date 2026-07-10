import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  Check,
  Inbox,
  Loader2,
  Plus,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Wordmark } from "@/components/brand/Wordmark";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const Route = createFileRoute("/design")({
  head: () => ({
    meta: [
      { title: "Design system — Velora" },
      {
        name: "description",
        content:
          "Living reference for the Velora design system: tokens, typography, and every reusable component in light and dark mode.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DesignPage,
});

function DesignPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <Link to="/" aria-label="Home" className="flex items-center gap-3">
            <Wordmark />
            <span className="text-xs text-muted-foreground">Design system</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-16 px-4 py-12 sm:px-6">
        <Intro />
        <Section id="tokens" title="Tokens" description="The whole system, in eight surfaces and one accent.">
          <Tokens />
        </Section>
        <Section id="typography" title="Typography" description="Two families, six sizes, honest hierarchy.">
          <Typography />
        </Section>
        <Section id="buttons" title="Buttons" description="One primitive, five variants, four sizes.">
          <Buttons />
        </Section>
        <Section id="cards" title="Cards" description="Hairline border + soft elevation. Never a shadow alone.">
          <Cards />
        </Section>
        <Section id="inputs" title="Inputs" description="Predictable focus ring, aligned to the accent.">
          <Inputs />
        </Section>
        <Section id="dropdowns" title="Selects & Menus" description="Same surface as popovers, same rhythm as buttons.">
          <SelectsAndMenus />
        </Section>
        <Section id="charts" title="Charts" description="Sparklines earn their place. Anything else must justify a pixel.">
          <Charts />
        </Section>
        <Section id="tables" title="Tables" description="Left-align text, right-align numbers, always tabular figures.">
          <Tables />
        </Section>
        <Section id="navigation" title="Navigation" description="Three items max. Tabs for switching, not for structure.">
          <Navigation />
        </Section>
        <Section id="dialogs" title="Dialogs & Tooltips" description="Interruptive UI reserved for confirmations and destructive intents.">
          <Dialogs />
        </Section>
        <Section id="notifications" title="Notifications" description="Toasts + inline alerts. No banners users have to dismiss.">
          <Notifications />
        </Section>
        <Section id="empty" title="Empty states" description="Explain what's missing. Offer the one action that unlocks value.">
          <EmptyStates />
        </Section>
        <Section id="loading" title="Loading states" description="Skeletons match final layout. Spinners only when we truly can't.">
          <LoadingStates />
        </Section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-6xl px-4 text-xs text-muted-foreground sm:px-6">
          Velora design system · Living reference
        </div>
      </footer>
    </div>
  );
}

/* ---------- Layout primitives ---------- */

function Intro() {
  return (
    <div className="space-y-4">
      <span className="eyebrow">Design system</span>
      <h1 className="font-serif text-5xl leading-[1.05] tracking-tight sm:text-6xl">
        Calm, premium, unopinionated where it matters.
      </h1>
      <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
        Every component is built on a small set of tokens defined in{" "}
        <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-xs">src/styles.css</code>.
        Change a token, and the entire product moves with it — in both light and dark.
      </p>
    </div>
  );
}

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 space-y-6">
      <div className="space-y-1.5">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-3">{children}</div>;
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={
        "rounded-xl border border-border bg-surface p-6 shadow-sm " + className
      }
    >
      {children}
    </div>
  );
}

/* ---------- Sections ---------- */

function Tokens() {
  const surfaces: Array<{ name: string; className: string; note: string }> = [
    { name: "background", className: "bg-background", note: "Canvas" },
    { name: "surface", className: "bg-surface", note: "Cards" },
    { name: "surface-2", className: "bg-surface-2", note: "Insets, hovers" },
    { name: "muted", className: "bg-muted", note: "Deemphasized" },
    { name: "primary", className: "bg-primary", note: "Accent" },
    { name: "success", className: "bg-success", note: "Positive" },
    { name: "warning", className: "bg-warning", note: "Attention" },
    { name: "destructive", className: "bg-destructive", note: "Danger" },
  ];
  return (
    <Panel>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {surfaces.map((s) => (
          <div key={s.name} className="space-y-2">
            <div
              className={
                "h-16 w-full rounded-lg border border-border " + s.className
              }
            />
            <div className="space-y-0.5">
              <div className="font-mono text-xs text-foreground">{s.name}</div>
              <div className="text-xs text-muted-foreground">{s.note}</div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function Typography() {
  return (
    <Panel className="space-y-6">
      <div className="space-y-1">
        <div className="eyebrow">Display · Instrument Serif</div>
        <p className="font-serif text-6xl leading-[1.02] tracking-tight">Marketing, in plain English.</p>
      </div>
      <div className="space-y-1">
        <div className="eyebrow">H1 · Inter 600</div>
        <p className="text-3xl font-semibold tracking-tight">Weekly performance is stable.</p>
      </div>
      <div className="space-y-1">
        <div className="eyebrow">H2 · Inter 600</div>
        <p className="text-xl font-semibold tracking-tight">Three things worth your attention</p>
      </div>
      <div className="space-y-1">
        <div className="eyebrow">Body · Inter 400</div>
        <p className="max-w-prose text-base leading-relaxed text-foreground">
          Revenue held steady week over week. Meta ads are pulling their weight — reactivating the
          Spring Sale creative could add about $1,200 next week with high confidence.
        </p>
      </div>
      <div className="space-y-1">
        <div className="eyebrow">Small · Inter 400</div>
        <p className="text-sm text-muted-foreground">
          Based on 8 weeks of data. Last synced 2 minutes ago.
        </p>
      </div>
      <div className="space-y-1">
        <div className="eyebrow">Mono · JetBrains Mono</div>
        <p className="font-mono text-sm text-foreground">$18,420.00 · +4.2% WoW</p>
      </div>
    </Panel>
  );
}

function Buttons() {
  return (
    <Panel className="space-y-6">
      <Row>
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
        <Button variant="destructive">Destructive</Button>
      </Row>
      <Row>
        <Button size="sm">Small</Button>
        <Button>Default</Button>
        <Button size="lg">Large</Button>
        <Button size="icon" aria-label="Add">
          <Plus />
        </Button>
      </Row>
      <Row>
        <Button>
          Continue <ArrowRight />
        </Button>
        <Button variant="secondary">
          <Sparkles /> Ask the AI
        </Button>
        <Button disabled>
          <Loader2 className="animate-spin" /> Saving
        </Button>
      </Row>
    </Panel>
  );
}

function Cards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardDescription>Weekly revenue</CardDescription>
          <CardTitle className="text-3xl">$18,420</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-success">
            <TrendingUp className="h-4 w-4" />
            +4.2% vs last week
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Recommendation</CardDescription>
          <CardTitle className="text-lg">Reactivate the Spring Sale ad</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            It drove your best week in the last two months. Turning it back on could add about
            $1,200 in revenue over the next 7 days.
          </p>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">High confidence</Badge>
            <Badge variant="outline">Meta Ads</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Inputs() {
  return (
    <Panel className="grid gap-6 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="email">Work email</Label>
        <Input id="email" type="email" placeholder="you@company.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="search">Search</Label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input id="search" placeholder="Search reports…" className="pl-9" />
        </div>
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="notes">Notes for your team</Label>
        <Textarea id="notes" rows={4} placeholder="What did you change this week?" />
      </div>
      <div className="flex items-center justify-between rounded-md border border-border bg-surface-2 px-3 py-2">
        <div className="space-y-0.5">
          <Label className="text-sm">Weekly email digest</Label>
          <p className="text-xs text-muted-foreground">Sundays at 8am, your local time.</p>
        </div>
        <Switch defaultChecked />
      </div>
      <div className="flex items-start gap-3 rounded-md border border-border bg-surface-2 px-3 py-2">
        <Checkbox id="tos" defaultChecked className="mt-0.5" />
        <div className="space-y-0.5">
          <Label htmlFor="tos" className="text-sm">
            I've read the terms
          </Label>
          <p className="text-xs text-muted-foreground">You can revoke access anytime.</p>
        </div>
      </div>
    </Panel>
  );
}

function SelectsAndMenus() {
  return (
    <Panel className="grid gap-6 sm:grid-cols-2">
      <div className="space-y-2">
        <Label>Time range</Label>
        <Select defaultValue="7d">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="4w">Last 4 weeks</SelectItem>
            <SelectItem value="12w">Last 12 weeks</SelectItem>
            <SelectItem value="ytd">Year to date</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Provider</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Choose a provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ga4">Google Analytics 4</SelectItem>
            <SelectItem value="meta">Meta Ads</SelectItem>
            <SelectItem value="google_ads">Google Ads</SelectItem>
            <SelectItem value="shopify">Shopify</SelectItem>
            <SelectItem value="mailchimp">Mailchimp</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </Panel>
  );
}

/* Tiny sparkline — no chart library needed for the reference. */
function Sparkline({ points, up = true }: { points: number[]; up?: boolean }) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const w = 220;
  const h = 60;
  const step = w / (points.length - 1);
  const d = points
    .map((p, i) => {
      const x = i * step;
      const y = h - ((p - min) / (max - min || 1)) * h;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-14 w-full">
      <path
        d={d}
        fill="none"
        stroke={up ? "var(--color-success)" : "var(--color-danger)"}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Charts() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardDescription>Revenue · last 8 weeks</CardDescription>
          <CardTitle className="text-2xl">$142,180</CardTitle>
        </CardHeader>
        <CardContent>
          <Sparkline points={[80, 88, 92, 85, 96, 104, 110, 118]} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Ad spend efficiency</CardDescription>
          <CardTitle className="text-2xl">2.4× return</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Meta Ads</span>
              <span>3.1×</span>
            </div>
            <Progress value={78} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Google Ads</span>
              <span>1.8×</span>
            </div>
            <Progress value={45} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Tables() {
  const rows = [
    { campaign: "Spring Sale — Meta", spend: 1240, revenue: 3844, roas: "3.1×", status: "Active" },
    { campaign: "Brand — Google", spend: 820, revenue: 1476, roas: "1.8×", status: "Active" },
    { campaign: "Retargeting — Meta", spend: 410, revenue: 902, roas: "2.2×", status: "Paused" },
    { campaign: "Newsletter — Mailchimp", spend: 0, revenue: 610, roas: "—", status: "Sent" },
  ];
  return (
    <Panel className="p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Campaign</TableHead>
            <TableHead className="text-right">Spend</TableHead>
            <TableHead className="text-right">Revenue</TableHead>
            <TableHead className="text-right">Return</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.campaign}>
              <TableCell className="font-medium">{r.campaign}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                ${r.spend.toLocaleString()}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                ${r.revenue.toLocaleString()}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">{r.roas}</TableCell>
              <TableCell>
                <Badge variant={r.status === "Active" ? "default" : "secondary"}>
                  {r.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Panel>
  );
}

function Navigation() {
  const [tab, setTab] = useState("summary");
  return (
    <Panel>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="signals">Signals</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>
        <TabsContent value="summary" className="pt-4 text-sm text-muted-foreground">
          A one-paragraph read on the week, written by the AI.
        </TabsContent>
        <TabsContent value="signals" className="pt-4 text-sm text-muted-foreground">
          Every observed change worth attention, with evidence.
        </TabsContent>
        <TabsContent value="actions" className="pt-4 text-sm text-muted-foreground">
          Ranked recommendations with estimated impact and confidence.
        </TabsContent>
      </Tabs>
    </Panel>
  );
}

function Dialogs() {
  return (
    <Panel className="flex flex-wrap gap-3">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Open dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disconnect Meta Ads?</DialogTitle>
            <DialogDescription>
              We'll stop pulling data. Your existing reports stay intact.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost">Cancel</Button>
            <Button variant="destructive">Disconnect</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="secondary">
              <Sparkles /> Hover for tooltip
            </Button>
          </TooltipTrigger>
          <TooltipContent>Explains the AI's reasoning in one line.</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </Panel>
  );
}

function Notifications() {
  return (
    <div className="space-y-4">
      <Panel className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          onClick={() => toast.success("Recommendation applied", { description: "We'll track the impact." })}
        >
          Success toast
        </Button>
        <Button
          variant="outline"
          onClick={() => toast.error("Couldn't reach Meta Ads", { description: "We'll retry automatically." })}
        >
          Error toast
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast("Weekly report ready", {
              description: "Sunday, October 20",
              action: { label: "Open", onClick: () => {} },
            })
          }
        >
          Info toast
        </Button>
      </Panel>
      <Alert>
        <Check className="h-4 w-4" />
        <AlertTitle>All providers synced</AlertTitle>
        <AlertDescription>Data is fresh as of a moment ago.</AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertTitle>Meta Ads token expired</AlertTitle>
        <AlertDescription>Reconnect to keep this week's numbers accurate.</AlertDescription>
      </Alert>
    </div>
  );
}

function EmptyStates() {
  return (
    <Panel className="flex flex-col items-center justify-center gap-4 py-12 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full border border-border bg-surface-2 text-muted-foreground">
        <Inbox className="h-5 w-5" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-semibold">No reports yet</h3>
        <p className="max-w-xs text-sm text-muted-foreground">
          Connect at least one marketing account and we'll write your first weekly report by Sunday.
        </p>
      </div>
      <Button>
        <Plus /> Connect an account
      </Button>
    </Panel>
  );
}

function LoadingStates() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-2 h-8 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-14 w-full" />
        </CardContent>
      </Card>
      <Panel className="flex items-center justify-center py-16">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Analyzing your last 8 weeks…
        </div>
      </Panel>
    </div>
  );
}
