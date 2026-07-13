import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Users, Mail, Activity as ActivityIcon, ShieldCheck } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { MembersTable } from "@/features/collab/MembersTable";
import { InvitesPanel } from "@/features/collab/InvitesPanel";
import { ActivityFeed } from "@/features/collab/ActivityFeed";
import { ApprovalsList } from "@/features/collab/ApprovalsList";
import { useActiveOrg } from "@/features/collab/useActiveOrg";

type Tab = "members" | "invites" | "activity" | "approvals";

const TABS: { id: Tab; label: string; Icon: any }[] = [
  { id: "members", label: "Members", Icon: Users },
  { id: "invites", label: "Invites", Icon: Mail },
  { id: "approvals", label: "Approvals", Icon: ShieldCheck },
  { id: "activity", label: "Activity", Icon: ActivityIcon },
];

export const Route = createFileRoute("/_authenticated/team")({
  component: TeamPage,
});

function TeamPage() {
  const [tab, setTab] = useState<Tab>("members");
  const activeOrg = useActiveOrg();
  const org = activeOrg.data;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Team</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {org
              ? org.is_personal
                ? "This is your personal workspace. Create a team workspace to invite others."
                : `Working in ${org.name}. Invite teammates, assign tasks, and approve decisions together.`
              : "Loading workspace…"}
          </p>
        </header>

        {org?.is_personal ? (
          <div className="rounded-xl border border-dashed border-border bg-surface/40 p-6 text-sm text-muted-foreground">
            Switch to a team workspace using the switcher in the header, or create one from the same menu.
          </div>
        ) : org ? (
          <>
            <nav className="mb-6 flex gap-1 border-b border-border" aria-label="Team sections">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={
                    "inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors " +
                    (tab === t.id
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground")
                  }
                >
                  <t.Icon className="h-4 w-4" />
                  {t.label}
                </button>
              ))}
            </nav>

            {tab === "members" ? <MembersTable orgId={org.id} myRole={org.role} /> : null}
            {tab === "invites" ? <InvitesPanel orgId={org.id} myRole={org.role} /> : null}
            {tab === "approvals" ? <ApprovalsList orgId={org.id} myRole={org.role} /> : null}
            {tab === "activity" ? <ActivityFeed orgId={org.id} /> : null}
          </>
        ) : null}
      </main>
    </div>
  );
}
