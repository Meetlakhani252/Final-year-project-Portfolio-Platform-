"use client";

import { useState, useTransition } from "react";
import { ChevronUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { votePost } from "@/actions/forums";
import { cn } from "@/lib/utils";

interface VoteButtonProps {
  postId: string;
  initialCount: number;
  initialVoted: boolean;
  canVote: boolean;
}

export function VoteButton({
  postId,
  initialCount,
  initialVoted,
  canVote,
}: VoteButtonProps) {
  const [voted, setVoted] = useState(initialVoted);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  function handleVote() {
    if (!canVote || isPending) return;

    const nextVoted = !voted;
    setVoted(nextVoted);
    setCount((c) => (nextVoted ? c + 1 : c - 1));

    startTransition(async () => {
      try {
        await votePost(postId);
      } catch {
        // Revert optimistic update on failure
        setVoted(voted);
        setCount(count);
      }
    });
  }

  return (
    <button
      onClick={handleVote}
      disabled={!canVote || isPending}
      className={cn(
        "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
        voted
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
        !canVote && "cursor-default opacity-70"
      )}
      title={!canVote ? "Only students can upvote" : voted ? "Remove upvote" : "Upvote"}
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <ChevronUp className={cn("size-4", voted && "text-primary")} />
      )}
      <span>{count}</span>
    </button>
  );
}
