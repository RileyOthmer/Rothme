import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { listMedia, createMedia, deleteMedia } from "@/lib/publishing/publishing.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageIcon, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/publishing/media")({
  component: MediaPage,
});

function MediaPage() {
  const listFn = useServerFn(listMedia);
  const createFn = useServerFn(createMedia);
  const delFn = useServerFn(deleteMedia);
  const qc = useQueryClient();
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["publishing", "media"],
    queryFn: () => listFn(),
  });

  const create = useMutation({
    mutationFn: () =>
      createFn({
        data: {
          kind: /\.(mp4|mov|webm)$/i.test(url) ? "video" : "image",
          url,
          alt_text: alt || undefined,
        },
      }),
    onSuccess: () => {
      toast.success("Media added");
      setUrl("");
      setAlt("");
      qc.invalidateQueries({ queryKey: ["publishing", "media"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Add failed"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["publishing", "media"] }),
  });

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-border p-4">
        <h3 className="mb-3 text-sm font-medium">Add media by URL</h3>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input placeholder="https://…" value={url} onChange={(e) => setUrl(e.target.value)} />
          <Input placeholder="Alt text" value={alt} onChange={(e) => setAlt(e.target.value)} className="sm:max-w-xs" />
          <Button disabled={!url || create.isPending} onClick={() => create.mutate()}>
            <Plus className="mr-1 h-4 w-4" /> Add
          </Button>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">Direct uploads will be wired to storage in a follow-up.</p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading media…</p>
      ) : (data ?? []).length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-10 text-center">
          <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">Your media library is empty</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {(data ?? []).map((m: any) => (
            <div key={m.id} className="group relative overflow-hidden rounded-lg border border-border bg-surface">
              {m.kind === "video" ? (
                <video src={m.url} className="h-32 w-full object-cover" muted />
              ) : (
                <img
                  src={m.thumbnail_url ?? m.url}
                  alt={m.alt_text ?? ""}
                  className="h-32 w-full object-cover"
                  loading="lazy"
                />
              )}
              <button
                type="button"
                onClick={() => remove.mutate(m.id)}
                className="absolute right-1 top-1 rounded bg-background/80 p-1 opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                aria-label="Delete"
              >
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
