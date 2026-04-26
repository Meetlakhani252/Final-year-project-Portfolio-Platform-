import { Skeleton } from "@/components/ui/skeleton";

export default function MessagesLoading() {
  return (
    <div className="flex h-full w-full overflow-hidden">

      {/* ── Left: conversation list ── */}
      <div className="flex w-full flex-col border-r bg-background sm:w-80 lg:w-96 shrink-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <div className="flex items-center gap-2">
            <Skeleton className="size-5 rounded" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-4 w-12 rounded-full" />
        </div>

        {/* Search bar */}
        <div className="px-4 py-3 border-b bg-muted/30">
          <Skeleton className="h-9 w-full rounded-full" />
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto divide-y">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3.5">
              <Skeleton className="size-11 rounded-full shrink-0" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Skeleton className="h-3.5 w-28 rounded-full" />
                  <Skeleton className="h-3 w-10 rounded-full shrink-0" />
                </div>
                <Skeleton className="h-2.5 w-40 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: chat area ── */}
      <div className="hidden sm:flex flex-1 flex-col overflow-hidden bg-muted/10">
        {/* Chat header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-background shadow-sm">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full shrink-0" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-32 rounded-full" />
              <Skeleton className="h-3 w-14 rounded-full" />
            </div>
          </div>
          <div className="flex gap-1">
            <Skeleton className="size-9 rounded-md" />
            <Skeleton className="size-9 rounded-md" />
            <Skeleton className="size-9 rounded-md" />
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {[
            { mine: false, width: "w-52" },
            { mine: false, width: "w-40" },
            { mine: true,  width: "w-44" },
            { mine: true,  width: "w-32" },
            { mine: false, width: "w-60" },
            { mine: true,  width: "w-48" },
          ].map(({ mine, width }, i) => (
            <div key={i} className={`flex items-end gap-2 ${mine ? "flex-row-reverse" : "flex-row"}`}>
              {!mine && <Skeleton className="size-7 rounded-full shrink-0" />}
              <div className={`flex flex-col gap-1 ${mine ? "items-end" : "items-start"}`}>
                <Skeleton className={`h-10 rounded-2xl ${width}`} />
                <Skeleton className="h-2.5 w-12 rounded-full" />
              </div>
            </div>
          ))}
        </div>

        {/* Input area */}
        <div className="border-t bg-background px-4 py-3">
          <div className="flex items-end gap-3">
            <Skeleton className="flex-1 h-11 rounded-2xl" />
            <Skeleton className="size-11 rounded-full shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
}
