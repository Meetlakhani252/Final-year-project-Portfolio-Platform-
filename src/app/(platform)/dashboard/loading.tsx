import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="section-container space-y-8">
      <div>
        <Skeleton className="h-9 w-64" />
        <Skeleton className="mt-2 h-4 w-72" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between pb-4">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="size-4 rounded" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="mt-1.5 h-4 w-3/4" />
            <Skeleton className="mt-4 h-8 w-28 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
