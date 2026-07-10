import { createFileRoute, Link } from "@tanstack/react-router";
import { Wordmark } from "@/components/brand/Wordmark";
import {
  useNotifications,
  type NotificationChannel,
  type NotificationFrequency,
} from "@/hooks/use-notifications";
import { CATEGORY_LABEL, type NotificationCategory } from "@/lib/notifications-mock";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/settings/notifications")({
  head: () => ({
    meta: [
      { title: "Notification settings — Northstar" },
      {
        name: "description",
        content: "Choose when and how Northstar reaches out.",
      },
    ],
  }),
  component: NotificationSettingsPage,
});

const FREQUENCY_OPTIONS: {
  value: NotificationFrequency;
  label: string;
  hint: string;
}[] = [
  { value: "realtime", label: "The moment it happens", hint: "For urgent things only." },
  { value: "daily", label: "Once a day", hint: "Bundled into one message." },
  { value: "weekly", label: "Once a week", hint: "A Monday morning digest." },
  { value: "off", label: "Never", hint: "We won't send these at all." },
];

const CHANNELS: {
  key: NotificationChannel;
  label: string;
  hint: string;
  soon?: boolean;
}[] = [
  { key: "inapp", label: "In-app", hint: "In the bell icon and on this page." },
  { key: "email", label: "Email", hint: "Sent to the address on your account." },
  { key: "push", label: "Push notifications", hint: "On your phone and desktop browser." },
  { key: "slack", label: "Slack", hint: "Posted in a channel of your choice.", soon: true },
  { key: "teams", label: "Microsoft Teams", hint: "Posted in a Teams channel.", soon: true },
];

function NotificationSettingsPage() {
  const { prefs, setPrefs } = useNotifications();

  const categories = Object.keys(CATEGORY_LABEL) as NotificationCategory[];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Wordmark />
          <Link
            to="/notifications"
            className="text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            ← Back to notifications
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="eyebrow">Settings · Notifications</p>
        <h1 className="mt-2 font-serif text-4xl leading-tight">
          You decide when we speak up.
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Northstar stays quiet by default. Choose which topics matter to you
          and how often you want to hear about them.
        </p>

        {/* Global */}
        <section className="mt-10 rounded-xl border border-border bg-surface p-6 shadow-xs">
          <h2 className="text-sm font-semibold text-foreground">General</h2>
          <div className="mt-4 space-y-4">
            <RowSwitch
              label="Only important changes"
              hint="Skip routine updates. You'll still hear about anything urgent or unusual."
              checked={prefs.onlyImportant}
              onCheckedChange={(v) =>
                setPrefs((p) => ({ ...p, onlyImportant: v }))
              }
            />
            <RowSwitch
              label="Quiet hours"
              hint={`No notifications between ${prefs.quietHours.from} and ${prefs.quietHours.to}.`}
              checked={prefs.quietHours.enabled}
              onCheckedChange={(v) =>
                setPrefs((p) => ({
                  ...p,
                  quietHours: { ...p.quietHours, enabled: v },
                }))
              }
            />
          </div>
        </section>

        {/* Channels */}
        <section className="mt-6 rounded-xl border border-border bg-surface p-6 shadow-xs">
          <h2 className="text-sm font-semibold text-foreground">Where to reach you</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Turn channels on or off. We'll never send the same alert twice.
          </p>
          <div className="mt-4 space-y-4">
            {CHANNELS.map((c) => (
              <RowSwitch
                key={c.key}
                label={
                  <span className="flex items-center gap-2">
                    {c.label}
                    {c.soon && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        Coming soon
                      </span>
                    )}
                  </span>
                }
                hint={c.hint}
                checked={prefs.channels[c.key]}
                disabled={c.soon}
                onCheckedChange={(v) =>
                  setPrefs((p) => ({
                    ...p,
                    channels: { ...p.channels, [c.key]: v },
                  }))
                }
              />
            ))}
          </div>
        </section>

        {/* Per-category */}
        <section className="mt-6 rounded-xl border border-border bg-surface p-6 shadow-xs">
          <h2 className="text-sm font-semibold text-foreground">
            What to notify me about
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Pick how often you want each topic — right away, once a day, once a
            week, or never.
          </p>
          <ul className="mt-4 divide-y divide-border">
            {categories.map((cat) => {
              const pref = prefs.categories[cat];
              return (
                <li
                  key={cat}
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <Switch
                      checked={pref.enabled}
                      onCheckedChange={(v) =>
                        setPrefs((p) => ({
                          ...p,
                          categories: {
                            ...p.categories,
                            [cat]: { ...p.categories[cat], enabled: v },
                          },
                        }))
                      }
                      aria-label={`${CATEGORY_LABEL[cat]} on`}
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {CATEGORY_LABEL[cat]}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {DESCRIPTIONS[cat]}
                      </p>
                    </div>
                  </div>

                  <Select
                    value={pref.frequency}
                    disabled={!pref.enabled}
                    onValueChange={(v) =>
                      setPrefs((p) => ({
                        ...p,
                        categories: {
                          ...p.categories,
                          [cat]: {
                            ...p.categories[cat],
                            frequency: v as NotificationFrequency,
                          },
                        },
                      }))
                    }
                  >
                    <SelectTrigger className="w-full sm:w-56">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FREQUENCY_OPTIONS.map((f) => (
                        <SelectItem key={f.value} value={f.value}>
                          <div>
                            <p className="text-sm">{f.label}</p>
                            <p className="text-xs text-muted-foreground">
                              {f.hint}
                            </p>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </li>
              );
            })}
          </ul>
        </section>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Changes save automatically.
        </p>
      </main>
    </div>
  );
}

const DESCRIPTIONS: Record<NotificationCategory, string> = {
  sales: "Big swings in daily or weekly revenue.",
  ads: "Budget running out, or costs jumping.",
  campaign: "Campaigns doing much better or worse than usual.",
  seo: "Meaningful changes in search traffic.",
  site: "Errors on your site that block visitors.",
  ai: "New recommendations from your strategist.",
};

function RowSwitch({
  label,
  hint,
  checked,
  disabled,
  onCheckedChange,
}: {
  label: React.ReactNode;
  hint: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <Switch
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}
