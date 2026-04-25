import { Skeleton } from "@/components/ui/skeleton";

export default function TeamPostDetailLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Back link */}
      <Skeleton className="h-4 w-36" />

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
        <Skeleton className="h-8 w-3/4" />
        <div className="flex items-center gap-2">
          <Skeleton className="size-6 rounded-full" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      {/* Meta row */}
      <div className="flex flex-col gap-3 rounded-lg border bg-card p-4">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-44" />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>

      {/* Required skills */}
      <div className="space-y-2">
        <Skeleton className="h-5 w-28" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-14 rounded-full" />
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 pt-2">
        <Skeleton className="h-10 w-28 rounded-md" />
      </div>

      {/* Separator */}
      <div className="h-px bg-border" />

      {/* Comments */}
      <div className="space-y-4">
        <Skeleton className="h-5 w-28" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="size-8 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
