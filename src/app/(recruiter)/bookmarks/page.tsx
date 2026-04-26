import { Bookmark } from "lucide-react";
import { getBookmarks } from "@/actions/recruiter";
import { BookmarksGrid } from "@/components/recruiter/bookmarks-grid";

export const metadata = { title: "Bookmarks — Profolio" };

export default async function BookmarksPage() {
  const bookmarks = await getBookmarks();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="glass-card p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 transition-transform group-hover:scale-110">
          <Bookmark className="size-24 text-primary" />
        </div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
            <Bookmark className="size-6 text-primary" fill="currentColor" />
          </div>
          <div>
            <h1 className="font-mono text-3xl font-bold tracking-tight text-white">
              <span className="text-primary">Vault:</span> Bookmarked Students
            </h1>
            <p className="mt-1 text-muted-foreground font-sans font-normal">
              {bookmarks.length === 0
                ? "Secure vault for saved candidates is currently empty."
                : `${bookmarks.length} candidate protocol${bookmarks.length !== 1 ? "s" : ""} secured — newest first.`}
            </p>
          </div>
        </div>
      </div>

      <BookmarksGrid initialBookmarks={bookmarks} />
    </div>
  );
}
