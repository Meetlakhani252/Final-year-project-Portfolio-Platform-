"use client";

import { useState, useTransition } from "react";
import { Flag, Loader2 } from "lucide-react";
import { flagContent } from "@/actions/forums";
import { cn } from "@/lib/utils";

interface FlagButtonProps {
  targetType: "post" | "reply";
  targetId: string;
  initialFlagged: boolean;
  canFlag: boolean;
}

export function FlagButton({
  targetType,
  targetId,
  initialFlagged,
  canFlag,
}: FlagButtonProps) {
  const [flagged, setFlagged] = useState(initialFlagged);
  const [isPending, startTransition] = useTransition();

  function handleFlag() {
    if (!canFlag || flagged || isPending) return;

    startTransition(async () => {
      try {
        await flagContent(targetType, targetId);
        setFlagged(true);
      } catch {
        // silently ignore
      }
    });
  }

  return (
    <button
      onClick={handleFlag}
      disabled={!canFlag || flagged || isPending}
      className={cn(
        "flex items-center gap-1 rounded px-1.5 py-1 text-xs transition-colors",
        flagged
          ? "text-destructive cursor-default"
          : "text-muted-foreground hover:text-destructive",
        (!canFlag || flagged) && "opacity-70"
      )}
      title={
        !canFlag
          ? "Only students can flag content"
          : flagged
          ? "Already flagged"
          : "Flag as inappropriate"
      }
    >
      {isPending ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <Flag className="size-3.5" />
      )}
      <span>{flagged ? "Flagged" : "Flag"}</span>
    </button>
  );
}
