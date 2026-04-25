import { Skeleton } from "@/components/ui/skeleton";

export default function ResumeBuilderLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="flex gap-6 items-start">
        {/* Form panel */}
        <div className="w-full max-w-sm lg:max-w-md xl:max-w-lg shrink-0 space-y-6">
          {/* Header info */}
          <div className="space-y-4">
            <Skeleton className="h-5 w-28" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            </div>
          </div>

          {/* Experience section */}
          <div className="space-y-3">
            <Skeleton className="h-5 w-24" />
            <div className="rounded-lg border p-3 space-y-2">
              <div className="flex justify-between items-center">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="size-6 rounded" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-9 w-full rounded-md" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
              <Skeleton className="h-14 w-full rounded-md" />
            </div>
            <Skeleton className="h-9 w-full rounded-md" />
          </div>

          {/* Skills section */}
          <div className="space-y-3">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>

          {/* Action button */}
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>

        {/* Preview panel — hidden on small screens */}
        <div className="hidden lg:block flex-1">
          <Skeleton className="w-full rounded-lg" style={{ aspectRatio: "8.5/11" }} />
        </div>
      </div>
    </div>
  );
}
