import { Skeleton } from "@/components/ui/skeleton";

export default function ForumsCategoryLoading() {
  return (
    <div className="mx-auto max-w-3xl">
      {/* Header row */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-28 rounded-md shrink-0" />
      </div>

      {/* Thread list */}
      <div className="flex flex-col divide-y rounded-lg border overflow-hidden">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="p-4 space-y-2">
            <Skeleton className="h-5 w-4/5" />
            <div className="flex items-center gap-2.5">
              <Skeleton className="size-5 rounded-full" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-3" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-3" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
