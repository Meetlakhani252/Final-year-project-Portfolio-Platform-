import { Bookmark } from "lucide-react";
import { getBookmarks } from "@/actions/recruiter";
import { BookmarksGrid } from "@/components/recruiter/bookmarks-grid";

export const metadata = { title: "Bookmarks — Profolio" };

export default async function BookmarksPage() {
  const bookmarks = await getBookmarks();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-linear-to-r from-amber-500 to-orange-500 p-8 text-white">
        <div className="flex items-center gap-3">
          <Bookmark className="size-6" fill="currentColor" />
          <h1 className="text-2xl font-bold">Bookmarked Students</h1>
        </div>
        <p className="mt-1 text-sm text-white/80 font-sans font-normal">
          {bookmarks.length === 0
            ? "Save students from Discover to review them here."
            : `${bookmarks.length} saved candidate${bookmarks.length !== 1 ? "s" : ""} — newest first.`}
        </p>
      </div>

      <BookmarksGrid initialBookmarks={bookmarks} />
    </div>
  );
}
