"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useConversations } from "@/hooks/use-messages";
import { ConversationView } from "@/components/messages/conversation-view";
import type { ConversationItem } from "@/actions/messages";

interface MessagesShellProps {
  activeConversationId: string | null;
  currentUserId: string;
  initError?: string;
}

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .map((p) => p[0])
      .filter(Boolean)
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?"
  );
}

function timeLabel(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays === 0)
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  if (diffDays < 7)
    return d.toLocaleDateString("en-US", { weekday: "short" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function ConversationListItem({
  conv,
  isActive,
  currentUserId,
}: {
  conv: ConversationItem;
  isActive: boolean;
  currentUserId: string;
}) {
  const other = conv.otherParticipant;
  const lastMsg = conv.lastMessage;
  const isMine = lastMsg?.sender_id === currentUserId;

  return (
    <Link
      href={`/messages/${conv.id}`}
      className={`flex items-center gap-3 px-3 py-3 transition-colors hover:bg-muted/60 ${
        isActive ? "bg-muted" : ""
      }`}
    >
      <div className="relative shrink-0">
        <Avatar className="size-10">
          {other?.avatar_url && (
            <AvatarImage src={other.avatar_url} alt={other.full_name} />
          )}
          <AvatarFallback className="text-xs">
            {other ? getInitials(other.full_name) : "?"}
          </AvatarFallback>
        </Avatar>
        {conv.unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
            {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`truncate text-sm ${
              conv.unreadCount > 0 ? "font-semibold" : "font-medium"
            }`}
          >
            {other?.full_name ?? "Unknown"}
          </span>
          {lastMsg && (
            <span className="shrink-0 text-[11px] text-muted-foreground">
              {timeLabel(lastMsg.created_at)}
            </span>
          )}
        </div>
        {lastMsg && (
          <p
            className={`truncate text-xs ${
              conv.unreadCount > 0
                ? "font-medium text-foreground"
                : "text-muted-foreground"
            }`}
          >
            {isMine ? "You: " : ""}
            {lastMsg.content}
          </p>
        )}
      </div>
    </Link>
  );
}

export function MessagesShell({
  activeConversationId,
  currentUserId,
  initError,
}: MessagesShellProps) {
  const { data: conversations = [], isLoading } = useConversations();

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Left sidebar — conversation list */}
      <aside
        className={`flex w-full flex-col border-r sm:w-72 lg:w-80 ${
          activeConversationId ? "hidden sm:flex" : "flex"
        }`}
      >
        <div className="border-b px-4 py-3">
          <h1 className="text-base font-semibold">Messages</h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-1 p-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-md px-3 py-3"
                >
                  <div className="size-10 animate-pulse rounded-full bg-muted" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                    <div className="h-2.5 w-36 animate-pulse rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <MessageSquare className="size-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No conversations yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {conversations.map((conv) => (
                <ConversationListItem
                  key={conv.id}
                  conv={conv}
                  isActive={conv.id === activeConversationId}
                  currentUserId={currentUserId}
                />
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Right panel */}
      <div
        className={`flex flex-1 flex-col overflow-hidden ${
          activeConversationId ? "flex" : "hidden sm:flex"
        }`}
      >
        {initError ? (
          <div className="flex flex-1 items-center justify-center p-8 text-center">
            <div className="space-y-2">
              <p className="text-sm font-medium text-destructive">{initError}</p>
              <Link
                href="/messages"
                className="text-xs text-muted-foreground underline hover:text-foreground"
              >
                Back to messages
              </Link>
            </div>
          </div>
        ) : activeConversationId ? (
          <ConversationView
            conversationId={activeConversationId}
            currentUserId={currentUserId}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center p-8 text-center">
            <div className="space-y-2">
              <MessageSquare className="mx-auto size-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                Select a conversation to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
