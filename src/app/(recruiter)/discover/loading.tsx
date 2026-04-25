import { Skeleton } from "@/components/ui/skeleton";

export default function DiscoverLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Gradient header */}
      <div className="rounded-2xl bg-muted/60 p-8 space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Filter panel */}
      <div className="rounded-lg border bg-card p-4 flex flex-wrap gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-32 rounded-md" />
        ))}
        <Skeleton className="h-9 w-24 rounded-md ml-auto" />
      </div>

      {/* Results grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-5 space-y-3">
            {/* Avatar + name */}
            <div className="flex items-center gap-3">
              <Skeleton className="size-12 rounded-full shrink-0" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>

            {/* Bio */}
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />

            {/* Skill badges */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-5 w-18 rounded-full" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>

            {/* Action row */}
            <div className="flex items-center justify-between pt-1">
              <Skeleton className="h-8 w-24 rounded-md" />
              <Skeleton className="size-8 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
