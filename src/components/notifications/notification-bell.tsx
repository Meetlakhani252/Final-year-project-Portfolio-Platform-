"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useUnreadNotificationCount,
  useRecentNotifications,
  useInvalidateNotifications,
} from "@/hooks/use-notifications";
import {
  markNotificationRead,
  markAllNotificationsRead,
} from "@/actions/notifications";
import type { NotificationItem } from "@/actions/notifications";
import { NotificationRow } from "@/components/notifications/notification-row";

export function NotificationBell() {
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const { data: notifications, isLoading } = useRecentNotifications();
  const invalidate = useInvalidateNotifications();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleMarkAll() {
    startTransition(async () => {
      await markAllNotificationsRead();
      invalidate();
    });
  }

  function handleClick(notification: NotificationItem) {
    startTransition(async () => {
      if (!notification.is_read) {
        await markNotificationRead(notification.id);
        invalidate();
      }
      if (notification.link) {
        router.push(notification.link);
      }
    });
  }

  const displayCount = unreadCount > 99 ? "99+" : unreadCount;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="relative flex min-h-11 min-w-11 items-center justify-center rounded-md hover:bg-accent transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Notifications"
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
            {displayCount}
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between py-2">
          <span className="text-sm font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAll}
              disabled={isPending}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              <CheckCheck className="size-3.5" />
              Mark all read
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {isLoading ? (
          <div className="p-2 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-2 p-2">
                <Skeleton className="size-8 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : !notifications || notifications.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No notifications yet
          </p>
        ) : (
          notifications.map((n) => (
            <DropdownMenuItem
              key={n.id}
              onClick={() => handleClick(n)}
              className="cursor-pointer focus:bg-accent p-0"
            >
              <NotificationRow notification={n} compact />
            </DropdownMenuItem>
          ))
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/notifications" />} className="justify-center text-xs text-muted-foreground">
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
