import { Skeleton } from "@/components/ui/skeleton";

export default function ForumsThreadLoading() {
  return (
    <div className="mx-auto max-w-3xl">
      {/* Breadcrumb */}
      <Skeleton className="mb-4 h-4 w-56" />

      {/* Original post card */}
      <div className="rounded-lg border bg-card p-6 space-y-4">
        <Skeleton className="h-6 w-4/5" />

        {/* Author row */}
        <div className="flex items-center gap-3">
          <Skeleton className="size-8 rounded-full shrink-0" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>

        {/* Post body */}
        <div className="space-y-2 pt-1">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* Vote / flag row */}
        <div className="flex items-center gap-3 border-t pt-4">
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="ml-auto h-4 w-16" />
        </div>
      </div>

      {/* Replies section */}
      <div className="mt-8 space-y-4">
        <Skeleton className="h-5 w-24" />

        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="size-7 rounded-full shrink-0" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
