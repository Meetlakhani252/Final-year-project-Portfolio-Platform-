"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Trash2, MessageSquare, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  getComments,
  addComment,
  deleteComment,
  type CommentWithProfile,
} from "@/actions/comments";

interface CommentSectionProps {
  targetType: "project" | "blog_post";
  targetId: string;
  /** Supabase user.id of the currently logged-in user, or null */
  currentUserId: string | null;
  /** Role of the currently logged-in user, or null */
  currentUserRole: string | null;
  /** profile_id of the portfolio owner */
  portfolioOwnerId: string;
}

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .map((p) => p[0])
      .filter(Boolean)
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?"
  );
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function CommentSection({
  targetType,
  targetId,
  currentUserId,
  currentUserRole,
  portfolioOwnerId,
}: CommentSectionProps) {
  const [comments, setComments] = useState<CommentWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isStudent = currentUserRole === "student";
  const isPortfolioOwner = currentUserId === portfolioOwnerId;

  useEffect(() => {
    getComments(targetType, targetId).then((data) => {
      setComments(data);
      setLoading(false);
    });
  }, [targetType, targetId]);

  function canDelete(comment: CommentWithProfile) {
    if (!currentUserId) return false;
    return comment.profile_id === currentUserId || isPortfolioOwner;
  }

  function handleDelete(id: string) {
    // Optimistic removal
    setComments((prev) => prev.filter((c) => c.id !== id));
    startTransition(async () => {
      const result = await deleteComment(id);
      if (!result.ok) {
        // Reload on failure
        const fresh = await getComments(targetType, targetId);
        setComments(fresh);
      }
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const trimmed = content.trim();
    if (!trimmed) return;

    startTransition(async () => {
      const result = await addComment(targetType, targetId, trimmed);
      if (!result.ok) {
        setFormError(result.error);
        return;
      }
      if (result.data) {
        setComments((prev) => [...prev, result.data!]);
      }
      setContent("");
      textareaRef.current?.focus();
    });
  }

  const remaining = 2000 - content.length;

  return (
    <div className="space-y-4 pt-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-medium text-muted-foreground">
          {comments.length === 0 && !loading
            ? "No comments yet"
            : `${comments.length} comment${comments.length !== 1 ? "s" : ""}`}
        </h3>
      </div>

      {/* Comment list */}
      {loading ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="size-3 animate-spin" />
          Loading comments…
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="size-7 shrink-0">
                {comment.profiles.avatar_url && (
                  <AvatarImage
                    src={comment.profiles.avatar_url}
                    alt={comment.profiles.full_name}
                  />
                )}
                <AvatarFallback className="text-[10px]">
                  {getInitials(comment.profiles.full_name)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium leading-none">
                    {comment.profiles.full_name}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {timeAgo(comment.created_at)}
                  </span>
                  {canDelete(comment) && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      disabled={isPending}
                      className="ml-auto text-muted-foreground/50 transition-colors hover:text-destructive disabled:opacity-50"
                      aria-label="Delete comment"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  )}
                </div>
                <p className="text-xs leading-relaxed text-foreground/80">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comment form — only for logged-in students */}
      {isStudent && (
        <form onSubmit={handleSubmit} className="space-y-2">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a comment…"
            rows={2}
            maxLength={2000}
            className="resize-none text-xs"
            disabled={isPending}
          />
          <div className="flex items-center justify-between gap-3">
            <span
              className={`text-[11px] tabular-nums ${
                remaining < 100 ? "text-destructive" : "text-muted-foreground"
              }`}
            >
              {remaining} chars remaining
            </span>
            <Button
              type="submit"
              size="sm"
              disabled={isPending || content.trim().length === 0}
              className="h-7 text-xs"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-1 size-3 animate-spin" />
                  Posting…
                </>
              ) : (
                "Post"
              )}
            </Button>
          </div>
          {formError && (
            <p className="text-xs text-destructive">{formError}</p>
          )}
        </form>
      )}

      {/* Nudge for non-students viewing the page */}
      {!currentUserId && (
        <p className="text-xs text-muted-foreground">
          <a href="/login" className="underline hover:text-foreground">
            Sign in
          </a>{" "}
          to leave a comment.
        </p>
      )}
    </div>
  );
}
