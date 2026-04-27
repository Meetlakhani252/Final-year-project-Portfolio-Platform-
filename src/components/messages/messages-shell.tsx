"use client";

import Link from "next/link";
import { MessageSquare, Search } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
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
  const hasUnread = conv.unreadCount > 0;

  return (
    <Link
      href={`/messages/${conv.id}`}
      className={`flex items-center gap-3 px-4 py-3.5 transition-all duration-150 hover:bg-accent/10 cursor-pointer ${
        isActive
          ? "bg-primary/10 border-r-2 border-primary"
          : "border-r-2 border-transparent"
      }`}
    >
      {/* Avatar with online dot */}
      <div className="relative shrink-0">
        <Avatar className="size-11 ring-2 ring-border">
          {other?.avatar_url && (
            <AvatarImage src={other.avatar_url} alt={other.full_name} />
          )}
          <AvatarFallback className="text-sm font-medium bg-primary/10 text-primary">
            {other ? getInitials(other.full_name) : "?"}
          </AvatarFallback>
        </Avatar>
        {/* Online indicator dot */}
        <span className="absolute bottom-0 right-0 size-3 rounded-full bg-green-500 ring-2 ring-background" />
      </div>

      {/* Text content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span
            className={`truncate text-sm ${
              hasUnread ? "font-bold text-foreground" : "font-semibold text-foreground/90"
            }`}
          >
            {other?.full_name ?? "Unknown"}
          </span>
          {lastMsg && (
            <span
              className={`shrink-0 text-[11px] ${
                hasUnread ? "text-primary font-medium" : "text-muted-foreground"
              }`}
            >
              {timeLabel(lastMsg.created_at)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <p
            className={`truncate text-xs leading-relaxed ${
              hasUnread
                ? "font-medium text-foreground/80"
                : "text-muted-foreground"
            }`}
          >
            {lastMsg ? (
              <>
                {isMine && (
                  <span className="text-muted-foreground">You: </span>
                )}
                {lastMsg.content}
              </>
            ) : (
              <span className="italic text-muted-foreground/60">No messages yet</span>
            )}
          </p>
          {hasUnread && (
            <span className="shrink-0 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function SkeletonListItem() {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className="size-11 animate-pulse rounded-full bg-muted shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex justify-between">
          <div className="h-3.5 w-28 animate-pulse rounded-full bg-muted" />
          <div className="h-3 w-10 animate-pulse rounded-full bg-muted" />
        </div>
        <div className="h-2.5 w-40 animate-pulse rounded-full bg-muted" />
      </div>
    </div>
  );
}

export function MessagesShell({
  activeConversationId,
  currentUserId,
  initError,
}: MessagesShellProps) {
  const { data: conversations = [], isLoading } = useConversations();
  const [search, setSearch] = useState("");

  const filtered = conversations.filter((c) =>
    (c.lastMessage !== null || c.id === activeConversationId) &&
    c.otherParticipant?.full_name
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* ── Left panel: conversation list ── */}
      <aside
        className={`flex flex-col border-r bg-background shrink-0 w-full sm:w-80 lg:w-96 ${
          activeConversationId ? "hidden sm:flex" : "flex"
        }`}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between gap-2 border-b px-4 py-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="size-5 text-primary" />
            <h1 className="text-base font-bold">Messages</h1>
          </div>
          {conversations.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {conversations.length} chat{conversations.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Search bar */}
        <div className="px-4 py-3 border-b bg-muted/30">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 text-sm bg-background rounded-full border-border/60 focus-visible:ring-primary/30"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="divide-y">
              {[...Array(6)].map((_, i) => (
                <SkeletonListItem key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center px-6">
              <div className="size-16 rounded-full bg-muted flex items-center justify-center">
                <MessageSquare className="size-7 text-muted-foreground/50" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground/70">
                  {search ? "No results found" : "No conversations yet"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {search
                    ? "Try a different name"
                    : "Start messaging by visiting a student's profile"}
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {filtered.map((conv) => (
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

      {/* ── Right panel: chat or empty state ── */}
      <div
        className={`flex flex-1 flex-col overflow-hidden bg-muted/10 ${
          activeConversationId ? "flex" : "hidden sm:flex"
        }`}
      >
        {initError ? (
          <div className="flex flex-1 items-center justify-center p-8 text-center">
            <div className="space-y-3 max-w-xs">
              <div className="size-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                <MessageSquare className="size-6 text-destructive" />
              </div>
              <p className="text-sm font-medium text-destructive">{initError}</p>
              <Link
                href="/messages"
                className="text-xs text-muted-foreground underline hover:text-foreground"
              >
                ← Back to messages
              </Link>
            </div>
          </div>
        ) : activeConversationId ? (
          <ConversationView
            conversationId={activeConversationId}
            currentUserId={currentUserId}
            initialOtherParticipant={
              conversations.find((c) => c.id === activeConversationId)
                ?.otherParticipant
            }
          />
        ) : (
          /* Empty state — no chat selected */
          <div className="flex flex-1 items-center justify-center p-8 text-center">
            <div className="space-y-4 max-w-xs">
              <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <MessageSquare className="size-9 text-primary/60" />
              </div>
              <div className="space-y-2">
                <p className="text-base font-semibold text-foreground/80">
                  Your Messages
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Select a conversation from the list to start chatting, or visit a student&apos;s profile to start a new one.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
