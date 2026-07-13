import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { listComments, postComment, deleteComment } from "@/lib/collab/comments.functions";
import { listMembers } from "@/lib/collab/members.functions";
import { useActiveOrg } from "./useActiveOrg";
import type { Member } from "./types";

type SubjectType = "decision" | "report" | "goal" | "dashboard";

function formatTime(iso: string): string {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return d.toLocaleDateString();
}

function renderBody(body: string, members: Member[]) {
  const nameSet = new Set(
    members.map((m) => (m.full_name || "").trim().toLowerCase()).filter(Boolean),
  );
  return body.split(/(\s+)/).map((tok, i) => {
    if (tok.startsWith("@")) {
      const name = tok.slice(1).toLowerCase();
      if (nameSet.has(name)) {
        return (
          <span key={i} className="rounded bg-primary/10 px-1 font-medium text-primary">
            {tok}
          </span>
        );
      }
    }
    return <span key={i}>{tok}</span>;
  });
}

export function CommentThread({
  subjectType,
  subjectId,
}: {
  subjectType: SubjectType;
  subjectId: string;
}) {
  const activeOrg = useActiveOrg();
  const orgId = activeOrg.data?.id;
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");

  const comments = useQuery({
    queryKey: ["collab", "comments", orgId, subjectType, subjectId],
    queryFn: () =>
      listComments({ data: { orgId: orgId!, subjectType, subjectId } }),
    enabled: !!orgId && open,
    staleTime: 5_000,
  });

  const members = useQuery({
    queryKey: ["collab", "members", orgId],
    queryFn: () => listMembers({ data: { orgId: orgId! } }),
    enabled: !!orgId && open,
  });

  const post = useMutation({
    mutationFn: () => {
      const mentioned = extractMentions(body, members.data ?? []);
      return postComment({
        data: {
          orgId: orgId!,
          subjectType,
          subjectId,
          body: body.trim(),
          mentionUserIds: mentioned,
        },
      });
    },
    onSuccess: () => {
      setBody("");
      qc.invalidateQueries({ queryKey: ["collab", "comments", orgId, subjectType, subjectId] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed to post"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteComment({ data: { id } }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["collab", "comments", orgId, subjectType, subjectId] }),
  });

  const count = comments.data?.length ?? 0;
  const disabled = !orgId;

  return (
    <div className="mt-4 border-t border-border pt-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
      >
        <MessageCircle className="h-3.5 w-3.5" />
        {open ? "Hide comments" : count > 0 ? `${count} comment${count === 1 ? "" : "s"}` : "Comment"}
      </button>

      {open && orgId ? (
        <div className="mt-3 space-y-3">
          {comments.isLoading ? (
            <p className="text-xs text-muted-foreground">Loading…</p>
          ) : (comments.data ?? []).length === 0 ? (
            <p className="text-xs text-muted-foreground">No comments yet.</p>
          ) : (
            <ul className="space-y-3">
              {(comments.data ?? []).map((c) => (
                <li key={c.id} className="rounded-lg border border-border bg-surface/50 p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">{c.author_name ?? "Member"}</span>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span>{formatTime(c.created_at)}</span>
                      <button
                        onClick={() => remove.mutate(c.id)}
                        className="text-muted-foreground/70 hover:text-destructive"
                        aria-label="Delete comment"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-1.5 whitespace-pre-wrap text-sm text-foreground/90">
                    {renderBody(c.body, members.data ?? [])}
                  </p>
                </li>
              ))}
            </ul>
          )}

          <div className="space-y-2">
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write a comment. Type @ to mention a teammate."
              rows={2}
              className="text-sm"
            />
            <div className="flex items-center justify-between">
              <MentionHint members={members.data ?? []} />
              <Button
                size="sm"
                disabled={!body.trim() || post.isPending}
                onClick={() => post.mutate()}
              >
                <Send className="mr-1.5 h-3.5 w-3.5" />
                Post
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MentionHint({ members }: { members: Member[] }) {
  if (members.length <= 1) return <span className="text-xs text-muted-foreground">Invite teammates to mention them</span>;
  return (
    <span className="truncate text-xs text-muted-foreground">
      Mention: {members.slice(0, 3).map((m) => `@${m.full_name ?? "member"}`).join(" ")}
    </span>
  );
}

function extractMentions(body: string, members: Member[]): string[] {
  const byName = new Map<string, string>();
  for (const m of members) {
    if (m.full_name) byName.set(m.full_name.trim().toLowerCase(), m.user_id);
  }
  const out = new Set<string>();
  const tokens = body.match(/@[\w\s]+/g) ?? [];
  for (const t of tokens) {
    const name = t.slice(1).trim().toLowerCase();
    // try progressively shorter matches
    for (let i = name.length; i > 0; i--) {
      const trial = name.slice(0, i).trim();
      const uid = byName.get(trial);
      if (uid) {
        out.add(uid);
        break;
      }
    }
  }
  return Array.from(out);
}
