import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Circle } from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/layout/AppHeader";
import { listMyTasks, updateTaskStatus } from "@/lib/collab/tasks.functions";

export const Route = createFileRoute("/_authenticated/tasks")({
  component: TasksPage,
});

function TasksPage() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["collab", "myTasks"],
    queryFn: () => listMyTasks(),
  });
  const complete = useMutation({
    mutationFn: (id: string) => updateTaskStatus({ data: { id, status: "done" } }),
    onSuccess: () => {
      toast.success("Nice — one less thing.");
      qc.invalidateQueries({ queryKey: ["collab"] });
    },
  });

  const assignedToMe = q.data?.assignedToMe ?? [];
  const assignedByMe = q.data?.assignedByMe ?? [];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Your tasks</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Everything on your plate. Check things off as you go.
          </p>
        </header>

        <Section title="Assigned to you" empty="Nothing on your plate. Enjoy the calm.">
          {assignedToMe.map((t) => (
            <li key={t.id} className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
              <button
                onClick={() => complete.mutate(t.id)}
                className={
                  "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border " +
                  (t.status === "done"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:border-primary")
                }
                aria-label="Mark done"
              >
                {t.status === "done" ? <Check className="h-3 w-3" /> : <Circle className="hidden" />}
              </button>
              <div className="min-w-0 flex-1">
                <p
                  className={
                    "text-sm font-medium " +
                    (t.status === "done" ? "text-muted-foreground line-through" : "text-foreground")
                  }
                >
                  {t.title}
                </p>
                {t.description ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">{t.description}</p>
                ) : null}
                <p className="mt-1 text-xs text-muted-foreground">
                  From {t.assigner_name ?? "you"}
                  {t.due_date ? ` · due ${new Date(t.due_date).toLocaleDateString()}` : ""}
                </p>
              </div>
            </li>
          ))}
        </Section>

        <Section title="Assigned by you" empty="You haven't assigned anything to teammates yet.">
          {assignedByMe.map((t) => (
            <li key={t.id} className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-border">
                {t.status === "done" ? <Check className="h-3 w-3" /> : null}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{t.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t.assignee_name ? `Waiting on ${t.assignee_name}` : "Unassigned"}
                  {t.due_date ? ` · due ${new Date(t.due_date).toLocaleDateString()}` : ""}
                </p>
              </div>
            </li>
          ))}
        </Section>
      </main>
    </div>
  );
}

function Section({
  title,
  empty,
  children,
}: {
  title: string;
  empty: string;
  children: React.ReactNode;
}) {
  const items = Array.isArray(children) ? children : [children];
  const hasItems = items.length > 0 && items.some(Boolean);
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      {hasItems ? (
        <ul className="space-y-2">{children}</ul>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          {empty}
        </div>
      )}
    </section>
  );
}
