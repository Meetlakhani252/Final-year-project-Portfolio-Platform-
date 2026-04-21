"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getConversations,
  getMessages,
  getUnreadCount,
} from "@/actions/messages";

export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: () => getConversations(),
    refetchInterval: 30_000,
  });
}

export function useMessages(conversationId: string) {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => getMessages(conversationId),
    refetchInterval: 10_000,
    enabled: !!conversationId,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ["unread-count"],
    queryFn: () => getUnreadCount(),
    refetchInterval: 30_000,
  });
}
