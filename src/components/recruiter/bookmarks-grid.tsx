"use client";

import { useState } from "react";
import { StudentCard } from "./student-card";
import { BookmarkNotes } from "./bookmark-notes";
import type { BookmarkResult } from "@/actions/recruiter";

interface BookmarksGridProps {
  initialBookmarks: BookmarkResult[];
}

export function BookmarksGrid({ initialBookmarks }: BookmarksGridProps) {
  const [bookmarks, setBookmarks] = useState(initialBookmarks);

  function handleRemoved(studentId: string) {
    setBookmarks((prev) => prev.filter((b) => b.student.id !== studentId));
  }

  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card py-24 text-center">
        <p className="font-medium text-foreground">No bookmarks yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Bookmark students from the Discover page to save them here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {bookmarks.map((bookmark) => (
        <div key={bookmark.bookmarkId} className="flex flex-col gap-2">
          <StudentCard
            student={bookmark.student}
            isBookmarked={true}
            onBookmarkToggle={(bookmarked) => {
              if (!bookmarked) handleRemoved(bookmark.student.id);
            }}
          />
          <BookmarkNotes
            bookmarkId={bookmark.bookmarkId}
            initialNotes={bookmark.notes}
          />
        </div>
      ))}
    </div>
  );
}
