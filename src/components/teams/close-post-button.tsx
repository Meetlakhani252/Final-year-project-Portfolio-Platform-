"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { closeTeamPost, reopenTeamPost } from "@/actions/teams";

export function ClosePostButton({
  postId,
  isOpen,
}: {
  postId: string;
  isOpen: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = isOpen
        ? await closeTeamPost(postId)
        : await reopenTeamPost(postId);

      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(isOpen ? "Post marked as filled." : "Post reopened.");
    });
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isPending}
      variant={isOpen ? "destructive" : "outline"}
      size="sm"
    >
      {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
      {isOpen ? "Mark as filled" : "Reopen post"}
    </Button>
  );
}
