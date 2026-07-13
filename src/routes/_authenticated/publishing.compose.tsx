import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import {
  getPost,
  savePost,
  listPublishTargets,
} from "@/lib/publishing/publishing.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Send, CalendarClock, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

const searchSchema = z.object({ id: z.string().uuid().optional() });

export const Route = createFileRoute("/_authenticated/publishing/compose")({
  validateSearch: (s) => searchSchema.parse(s),
  component: ComposePage,
});

type Variant = { platform_id: string; body: string; media_ids: string[] };
type Schedule = { platform_id: string; scheduled_at: string };

function ComposePage() {
  const { id } = Route.useSearch();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const getFn = useServerFn(getPost);
  const saveFn = useServerFn(savePost);
  const targetsFn = useServerFn(listPublishTargets);

  const { data: targets } = useQuery({
    queryKey: ["publishing", "targets"],
    queryFn: () => targetsFn(),
  });
  const { data: existing } = useQuery({
    queryKey: ["publishing", "post", id],
    queryFn: () => (id ? getFn({ data: { id } }) : Promise.resolve(null)),
    enabled: !!id,
  });

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduleAt, setScheduleAt] = useState("");

  useEffect(() => {
    if (existing) {
      setTitle(existing.title ?? "");
      setBody(existing.body ?? "");
      const variants = (existing.post_variants ?? []) as Variant[];
      setSelectedPlatforms(variants.map((v) => v.platform_id));
      const first = (existing.post_schedules ?? [])[0];
      if (first) setScheduleAt(new Date(first.scheduled_at).toISOString().slice(0, 16));
    }
  }, [existing]);

  const canSchedule = useMemo(
    () => body.trim().length > 0 && selectedPlatforms.length > 0 && !!scheduleAt,
    [body, selectedPlatforms, scheduleAt],
  );

  const save = useMutation({
    mutationFn: (status: "draft" | "scheduled") => {
      const variants: Variant[] = selectedPlatforms.map((p) => ({
        platform_id: p,
        body,
        media_ids: [],
      }));
      const schedules: Schedule[] =
        status === "scheduled" && scheduleAt
          ? selectedPlatforms.map((p) => ({
              platform_id: p,
              scheduled_at: new Date(scheduleAt).toISOString(),
            }))
          : [];
      return saveFn({
        data: {
          id,
          title: title || null,
          body,
          status,
          tags: [],
          variants,
          schedules,
        },
      });
    },
    onSuccess: (res, status) => {
      toast.success(status === "scheduled" ? "Scheduled" : "Draft saved");
      qc.invalidateQueries({ queryKey: ["publishing"] });
      navigate({
        to: status === "scheduled" ? "/publishing/queue" : "/publishing/drafts",
      });
    },
    onError: (e: any) => toast.error(e.message ?? "Save failed"),
  });

  const togglePlatform = (id: string) =>
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <Input
          placeholder="Post title (internal)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Textarea
          placeholder="What do you want to say?"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={12}
          className="resize-none"
        />
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>{body.length} characters</span>
          <Button variant="outline" size="sm" disabled title="AI rewrite coming soon">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" /> AI rewrite
          </Button>
        </div>
      </div>

      <aside className="space-y-6">
        <div>
          <h3 className="mb-2 text-xs font-medium uppercase text-muted-foreground">Platforms</h3>
          <div className="flex flex-wrap gap-2">
            {(targets ?? []).length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No publishing plugins installed yet. Install one from Settings → Plugins.
              </p>
            ) : (
              (targets ?? []).map((t: any) => {
                const active = selectedPlatforms.includes(t.platform_id);
                return (
                  <button
                    key={t.platform_id}
                    type="button"
                    onClick={() => togglePlatform(t.platform_id)}
                    className={
                      "rounded-md border px-2.5 py-1.5 text-xs transition-colors " +
                      (active
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-surface text-muted-foreground hover:text-foreground")
                    }
                  >
                    {t.name}
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-xs font-medium uppercase text-muted-foreground">Schedule</h3>
          <Input
            type="datetime-local"
            value={scheduleAt}
            onChange={(e) => setScheduleAt(e.target.value)}
          />
          <p className="mt-1 text-[11px] text-muted-foreground">
            Leave empty to save as draft.
          </p>
        </div>

        <div className="space-y-2">
          <Button
            className="w-full"
            disabled={!canSchedule || save.isPending}
            onClick={() => save.mutate("scheduled")}
          >
            <CalendarClock className="mr-2 h-4 w-4" /> Schedule
          </Button>
          <Button
            className="w-full"
            variant="outline"
            disabled={!body.trim() || save.isPending}
            onClick={() => save.mutate("draft")}
          >
            <Save className="mr-2 h-4 w-4" /> Save draft
          </Button>
        </div>

        {selectedPlatforms.length > 0 ? (
          <div>
            <h3 className="mb-2 text-xs font-medium uppercase text-muted-foreground">Publishing to</h3>
            <div className="flex flex-wrap gap-1">
              {selectedPlatforms.map((p) => (
                <Badge key={p} variant="secondary" className="text-[10px]">
                  {p}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}
      </aside>
    </section>
  );
}
