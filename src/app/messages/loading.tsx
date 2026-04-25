import { Skeleton } from "@/components/ui/skeleton";

export default function MessagesLoading() {
  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Conversation sidebar */}
      <div className="flex w-full flex-col border-r sm:w-72 lg:w-80 shrink-0">
        <div className="border-b px-4 py-3">
          <Skeleton className="h-5 w-24" />
        </div>

        <div className="flex-1 overflow-y-auto divide-y">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-3">
              <Skeleton className="size-10 rounded-full shrink-0" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-3 w-10 shrink-0" />
                </div>
                <Skeleton className="h-2.5 w-36" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="hidden sm:flex flex-1 flex-col overflow-hidden">
        {/* Chat header */}
        <div className="border-b px-4 py-3 flex items-center gap-3">
          <Skeleton className="size-8 rounded-full shrink-0" />
          <Skeleton className="h-4 w-32" />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {[false, true, false, false, true, false].map((mine, i) => (
            <div key={i} className={`flex ${mine ? "justify-end" : ""}`}>
              <Skeleton
                className={`h-10 rounded-2xl ${mine ? "w-40" : "w-52"}`}
              />
            </div>
          ))}
        </div>

        {/* Input bar */}
        <div className="border-t p-3 flex gap-2">
          <Skeleton className="flex-1 h-10 rounded-md" />
          <Skeleton className="size-10 rounded-md shrink-0" />
        </div>
      </div>
    </div>
  );
}
