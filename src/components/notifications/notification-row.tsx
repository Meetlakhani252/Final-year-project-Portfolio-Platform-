"use client";

import {
  MessageSquare,
  Mail,
  Users,
  CalendarDays,
  MessagesSquare,
  Bell,
  Briefcase,
  Rss,
} from "lucide-react";
import type { NotificationItem } from "@/actions/notifications";

const TYPE_ICON: Record<NotificationItem["type"], React.ElementType> = {
  comment: MessageSquare,
  dm: Mail,
  team_match: Users,
  event_new: CalendarDays,
  forum_reply: MessagesSquare,
  application: Briefcase,
  job_post: Rss,
};

function timeAgo(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diff = Math.floor((now - then) / 1000);

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateString).toLocaleDateString();
}

interface NotificationRowProps {
  notification: NotificationItem;
  compact?: boolean;
}

export function NotificationRow({
  notification,
  compact = false,
}: NotificationRowProps) {
  const Icon = TYPE_ICON[notification.type] ?? Bell;

  return (
    <div
      className={`flex items-start gap-3 w-full ${compact ? "px-3 py-2.5" : "px-4 py-3"} ${
        notification.is_read ? "opacity-70" : ""
      }`}
    >
      <span
        className={`mt-0.5 flex shrink-0 items-center justify-center rounded-full ${compact ? "size-8" : "size-9"} bg-muted text-muted-foreground`}
      >
        <Icon className={compact ? "size-4" : "size-4.5"} />
      </span>

      <div className="flex-1 min-w-0">
        <p
          className={`${compact ? "text-xs" : "text-sm"} font-medium leading-snug line-clamp-2 ${
            notification.is_read ? "text-muted-foreground" : "text-foreground"
          }`}
        >
          {notification.title}
        </p>
        {notification.body && (
          <p className={`mt-0.5 ${compact ? "text-[11px]" : "text-xs"} text-muted-foreground line-clamp-1`}>
            {notification.body}
          </p>
        )}
        <p className={`mt-1 ${compact ? "text-[10px]" : "text-xs"} text-muted-foreground`}>
          {timeAgo(notification.created_at)}
        </p>
      </div>

      {!notification.is_read && (
        <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
      )}
    </div>
  );
}
