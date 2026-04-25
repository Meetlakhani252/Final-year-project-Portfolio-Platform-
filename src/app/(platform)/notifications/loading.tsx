import { Skeleton } from "@/components/ui/skeleton";

export default function NotificationsLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-8 w-28 rounded-md" />
      </div>

      {/* Tabs */}
      <Skeleton className="h-9 w-40 rounded-md mb-4" />

      {/* Notification rows */}
      <div className="divide-y rounded-lg border overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 px-4 py-3">
            <Skeleton className="size-9 rounded-full shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2 py-0.5">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="size-2 rounded-full mt-2 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
