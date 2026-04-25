"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { POLL_INTERVAL_NOTIFICATIONS } from "@/lib/constants";
import {
  getUnreadNotificationCount,
  getRecentNotifications,
} from "@/actions/notifications";

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => getUnreadNotificationCount(),
    refetchInterval: POLL_INTERVAL_NOTIFICATIONS,
  });
}

export function useRecentNotifications() {
  return useQuery({
    queryKey: ["notifications", "recent"],
    queryFn: () => getRecentNotifications(),
    refetchInterval: POLL_INTERVAL_NOTIFICATIONS,
  });
}

export function useInvalidateNotifications() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };
}
