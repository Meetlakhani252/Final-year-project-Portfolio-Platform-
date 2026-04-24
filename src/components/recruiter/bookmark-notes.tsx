"use client";

import { useState, useTransition } from "react";
import { Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { updateBookmarkNotes } from "@/actions/recruiter";

interface BookmarkNotesProps {
  bookmarkId: string;
  initialNotes: string | null;
}

export function BookmarkNotes({ bookmarkId, initialNotes }: BookmarkNotesProps) {
  const [editing, setEditing] = useState(false);
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [draft, setDraft] = useState(notes);
  const [isPending, startTransition] = useTransition();

  function handleEdit() {
    setDraft(notes);
    setEditing(true);
  }

  function handleCancel() {
    setEditing(false);
  }

  function handleSave() {
    startTransition(async () => {
      const result = await updateBookmarkNotes(bookmarkId, draft);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setNotes(draft);
      setEditing(false);
      toast.success("Notes saved");
    });
  }

  return (
    <div className="rounded-lg border bg-muted/40 px-3 py-2 text-sm">
      {editing ? (
        <div className="flex flex-col gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add private notes about this candidate…"
            rows={3}
            className="w-full resize-none rounded border bg-background px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
            autoFocus
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={isPending}
              className={cn(
                "flex items-center gap-1 rounded px-2 py-1 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
                isPending && "opacity-50 cursor-not-allowed"
              )}
            >
              <Check className="size-3" />
              Save
            </button>
            <button
              onClick={handleCancel}
              disabled={isPending}
              className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="size-3" />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={handleEdit}
          className="flex w-full items-start gap-1.5 text-left group"
        >
          <Pencil className="size-3 mt-0.5 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
          <span
            className={cn(
              "leading-snug",
              notes
                ? "text-foreground"
                : "text-muted-foreground italic"
            )}
          >
            {notes || "Add private notes…"}
          </span>
        </button>
      )}
    </div>
  );
}
