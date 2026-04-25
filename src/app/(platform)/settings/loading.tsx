import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <Skeleton className="h-7 w-24" />
        <Skeleton className="mt-1 h-4 w-72" />
      </div>

      {/* GitHub Integration section */}
      <section className="space-y-3">
        <div>
          <Skeleton className="h-5 w-36" />
          <Skeleton className="mt-1 h-4 w-80" />
        </div>
        <div className="rounded-lg border p-4 space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-44" />
            </div>
          </div>
          <div className="h-px bg-border" />
          <Skeleton className="h-9 w-36 rounded-md" />
        </div>
      </section>
    </div>
  );
}
