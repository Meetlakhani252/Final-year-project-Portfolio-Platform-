"use client";

import { useState, useTransition, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { Loader2, AlertTriangle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { NovelEditor } from "@/components/forums/novel-editor";
import { FlagButton } from "@/components/forums/flag-button";
import { BlogContentRenderer } from "@/components/portfolio/blog-content-renderer";
import { getReplies, replyToPost, type ReplyItem } from "@/actions/forums";
import { StarterKit } from "novel";
import type { JSONContent } from "novel";

interface ReplyListProps {
  postId: string;
  initialReplies: ReplyItem[];
  initialNextCursor: string | null;
  currentUserId: string;
  canReply: boolean;
}

export function ReplyList({
  postId,
  initialReplies,
  initialNextCursor,
  currentUserId,
  canReply,
}: ReplyListProps) {
  const [replies, setReplies] = useState<ReplyItem[]>(initialReplies);
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
  const [isLoadingMore, startLoadMore] = useTransition();
  const [replyContent, setReplyContent] = useState<JSONContent | null>(null);
  const [isSubmitting, startSubmit] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const editorKey = useRef(0);

  function loadMore() {
    if (!nextCursor) return;
    startLoadMore(async () => {
      const result = await getReplies(postId, nextCursor);
      setReplies((prev) => [...prev, ...result.replies]);
      setNextCursor(result.nextCursor);
    });
  }

  function handleSubmitReply(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (!replyContent) {
      setSubmitError("Reply cannot be empty.");
      return;
    }

    startSubmit(async () => {
      try {
        const newReply = await replyToPost(postId, replyContent);
        setReplies((prev) => [...prev, newReply]);
        setReplyContent(null);
        editorKey.current += 1;
      } catch (err) {
        setSubmitError(
          err instanceof Error ? err.message : "Failed to post reply."
        );
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {replies.length === 0 && !canReply ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No replies yet.
        </p>
      ) : null}

      {replies.map((reply) => (
        <div key={reply.id} className="flex gap-3">
          <Avatar className="size-8 shrink-0 mt-0.5">
            <AvatarImage src={reply.author?.avatar_url ?? undefined} />
            <AvatarFallback>
              {reply.author?.full_name?.charAt(0).toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium">
                {reply.author?.full_name ?? "Unknown"}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(reply.created_at), {
                  addSuffix: true,
                })}
              </span>
              {reply.flag_count >= 3 && (
                <span
                  className="flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs text-destructive"
                  title={reply.flagReason ?? undefined}
                >
                  <AlertTriangle className="size-3" />
                  Flagged by community
                  {reply.flagReason && (
                    <span className="text-destructive/70">· {reply.flagReason}</span>
                  )}
                </span>
              )}
            </div>

            <div className="mt-1.5">
              <BlogContentRenderer content={reply.content} />
            </div>

            <div className="mt-2">
              <FlagButton
                targetType="reply"
                targetId={reply.id}
                initialFlagged={reply.currentUserFlagged}
                canFlag={canReply && reply.author?.id !== currentUserId}
              />
            </div>
          </div>
        </div>
      ))}

      {nextCursor && (
        <div className="flex justify-center">
          <Button variant="outline" size="sm" onClick={loadMore} disabled={isLoadingMore}>
            {isLoadingMore ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Loading…
              </>
            ) : (
              "Load more replies"
            )}
          </Button>
        </div>
      )}

      {canReply && (
        <form onSubmit={handleSubmitReply} className="flex flex-col gap-3 border-t pt-6">
          <p className="text-sm font-medium">Write a reply</p>
          <NovelEditor
            key={editorKey.current}
            onChange={setReplyContent}
            noHeadings
          />
          {submitError && (
            <p className="text-sm text-destructive">{submitError}</p>
          )}
          <div>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Posting…
                </>
              ) : (
                "Post Reply"
              )}
            </Button>
          </div>
        </form>
      )}

      {!canReply && (
        <p className="border-t pt-4 text-sm text-muted-foreground">
          Only students can reply to threads.
        </p>
      )}
    </div>
  );
}
