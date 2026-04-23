"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addTeamComment } from "@/actions/teams";

export function TeamCommentForm({ postId }: { postId: string }) {
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    startTransition(async () => {
      const result = await addTeamComment(postId, content.trim());
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setContent("");
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Leave a comment to express interest or ask a question..."
        rows={3}
        disabled={isPending}
      />
      <Button
        type="submit"
        size="sm"
        disabled={isPending || !content.trim()}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Posting...
          </>
        ) : (
          "Post comment"
        )}
      </Button>
    </form>
  );
}
