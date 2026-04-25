import { Skeleton } from "@/components/ui/skeleton";

export default function ForumsLoading() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="mt-1 h-4 w-80" />
      </div>

      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-lg border bg-card p-5"
          >
            {/* Icon */}
            <Skeleton className="size-10 rounded-md shrink-0" />

            {/* Name + description */}
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-64" />
            </div>

            {/* Post count */}
            <div className="shrink-0 space-y-1 text-right">
              <Skeleton className="h-4 w-6 ml-auto" />
              <Skeleton className="h-3 w-8 ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
