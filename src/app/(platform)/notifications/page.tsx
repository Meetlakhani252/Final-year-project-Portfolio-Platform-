"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationRow } from "@/components/notifications/notification-row";
import {
  getNotificationPage,
  markNotificationRead,
  markAllNotificationsRead,
  type NotificationItem,
} from "@/actions/notifications";
import { useInvalidateNotifications } from "@/hooks/use-notifications";

type Filter = "all" | "unread";

export default function NotificationsPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [extraItems, setExtraItems] = useState<NotificationItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null | undefined>(
    undefined
  );
  const [isLoadingMore, startLoadMore] = useTransition();
  const [isMarkingAll, startMarkAll] = useTransition();
  const [isMarkingOne, startMarkOne] = useTransition();
  const invalidate = useInvalidateNotifications();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", "page", filter],
    queryFn: () => getNotificationPage(filter),
  });

  // Reset extra items when filter changes
  function handleFilterChange(value: string) {
    setFilter(value as Filter);
    setExtraItems([]);
    setNextCursor(undefined);
  }

  // The cursor to use: if we've loaded more, use our tracked cursor;
  // otherwise fall back to what the first page returned.
  const activeCursor =
    nextCursor !== undefined ? nextCursor : (data?.nextCursor ?? null);

  const displayItems = [...(data?.items ?? []), ...extraItems];
  const hasUnread = displayItems.some((n) => !n.is_read);

  function handleLoadMore() {
    if (!activeCursor) return;
    startLoadMore(async () => {
      const result = await getNotificationPage(filter, activeCursor);
      setExtraItems((prev) => [...prev, ...result.items]);
      setNextCursor(result.nextCursor);
    });
  }

  function handleMarkAll() {
    startMarkAll(async () => {
      await markAllNotificationsRead();
      setExtraItems([]);
      setNextCursor(undefined);
      invalidate();
    });
  }

  function handleMarkOne(notification: NotificationItem) {
    startMarkOne(async () => {
      if (!notification.is_read) {
        await markNotificationRead(notification.id);
        invalidate();
      }
      if (notification.link) {
        router.push(notification.link);
      }
    });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        {hasUnread && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAll}
            disabled={isMarkingAll}
            className="gap-1.5"
          >
            <CheckCheck className="size-4" />
            Mark all read
          </Button>
        )}
      </div>

      <Tabs value={filter} onValueChange={handleFilterChange} className="mb-4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="divide-y rounded-lg border">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3">
              <Skeleton className="size-9 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : displayItems.length === 0 ? (
        <div className="rounded-lg border py-16 text-center">
          <p className="text-muted-foreground">
            {filter === "unread"
              ? "You're all caught up!"
              : "No notifications yet"}
          </p>
        </div>
      ) : (
        <>
          <div className="divide-y rounded-lg border overflow-hidden">
            {displayItems.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleMarkOne(notification)}
                disabled={isMarkingOne}
                className="w-full text-left hover:bg-muted/50 transition-colors disabled:opacity-60"
              >
                <NotificationRow notification={notification} />
              </button>
            ))}
          </div>

          {activeCursor && (
            <div className="mt-4 flex justify-center">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? "Loading…" : "Load more"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
