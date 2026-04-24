"use client";

import { useState, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { toggleBookmark } from "@/actions/recruiter";

interface BookmarkButtonProps {
  studentId: string;
  initialBookmarked: boolean;
  onToggle?: (bookmarked: boolean) => void;
}

export function BookmarkButton({
  studentId,
  initialBookmarked,
  onToggle,
}: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleBookmark(studentId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setBookmarked(result.bookmarked);
      onToggle?.(result.bookmarked);
      toast.success(
        result.bookmarked ? "Student bookmarked" : "Bookmark removed"
      );
    });
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      aria-label={bookmarked ? "Remove bookmark" : "Bookmark student"}
      className={cn(
        "rounded-md p-1.5 transition-colors",
        bookmarked
          ? "text-amber-500 hover:text-amber-600"
          : "text-muted-foreground hover:text-foreground",
        isPending && "opacity-50 cursor-not-allowed"
      )}
    >
      <Bookmark
        className="size-4"
        fill={bookmarked ? "currentColor" : "none"}
      />
    </button>
  );
}
