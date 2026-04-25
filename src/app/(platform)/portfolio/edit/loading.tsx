import { Skeleton } from "@/components/ui/skeleton";

export default function PortfolioEditLoading() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <Skeleton className="h-7 w-36" />
        <Skeleton className="mt-1 h-4 w-64" />
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto pb-px border-b">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 shrink-0 rounded-t-md rounded-b-none" />
        ))}
      </div>

      {/* Form area — About tab shape */}
      <div className="space-y-5">
        {/* Avatar + name row */}
        <div className="flex items-center gap-4">
          <Skeleton className="size-20 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-24 w-full rounded-md" />
        </div>

        {/* Two-column fields */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          ))}
        </div>

        {/* Save button */}
        <Skeleton className="h-10 w-28 rounded-md" />
      </div>
    </div>
  );
}
