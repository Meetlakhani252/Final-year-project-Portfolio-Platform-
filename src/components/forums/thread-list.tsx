"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, ChevronUp, Loader2, AlertTriangle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getThreads, type ThreadItem } from "@/actions/forums";

interface ThreadListProps {
  categorySlug: string;
  initialThreads: ThreadItem[];
  initialNextCursor: string | null;
}

export function ThreadList({
  categorySlug,
  initialThreads,
  initialNextCursor,
}: ThreadListProps) {
  const [threads, setThreads] = useState<ThreadItem[]>(initialThreads);
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
  const [isPending, startTransition] = useTransition();

  function loadMore() {
    if (!nextCursor) return;
    startTransition(async () => {
      const result = await getThreads(categorySlug, nextCursor);
      setThreads((prev) => [...prev, ...result.threads]);
      setNextCursor(result.nextCursor);
    });
  }

  if (threads.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        No threads yet. Be the first to post!
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {threads.map((thread) => (
        <Link
          key={thread.id}
          href={`/forums/${categorySlug}/${thread.id}`}
          className="flex items-start gap-4 rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors"
        >
          <Avatar className="size-9 shrink-0 mt-0.5">
            <AvatarImage src={thread.author?.avatar_url ?? undefined} />
            <AvatarFallback>
              {thread.author?.full_name?.charAt(0).toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-2 flex-wrap">
              <p className="font-medium leading-snug line-clamp-2">{thread.title}</p>
              {thread.flag_count >= 3 && (
                <span className="flex shrink-0 items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs text-destructive">
                  <AlertTriangle className="size-3" />
                  Flagged
                </span>
              )}
            </div>
            {thread.content_plain && (
              <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">
                {thread.content_plain}
              </p>
            )}
            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
              <span>{thread.author?.full_name ?? "Unknown"}</span>
              <span>·</span>
              <span>
                {formatDistanceToNow(new Date(thread.created_at), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <ChevronUp className="size-3.5" />
              {thread.upvote_count}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="size-3.5" />
              {thread.reply_count}
            </span>
          </div>
        </Link>
      ))}

      {nextCursor && (
        <div className="mt-4 flex justify-center">
          <Button variant="outline" onClick={loadMore} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Loading…
              </>
            ) : (
              "Load more"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
