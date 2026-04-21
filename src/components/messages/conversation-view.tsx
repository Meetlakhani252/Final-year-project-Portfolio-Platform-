"use client";

import {
  useEffect,
  useRef,
  useState,
  useTransition,
  useCallback,
} from "react";
import Link from "next/link";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { format, isToday, isYesterday, isSameDay } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMessages } from "@/hooks/use-messages";
import { sendMessage, markMessagesRead } from "@/actions/messages";
import type { MessageItem } from "@/actions/messages";

interface ConversationViewProps {
  conversationId: string;
  currentUserId: string;
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

function dateSeparatorLabel(date: Date) {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMMM d, yyyy");
}

export function ConversationView({
  conversationId,
  currentUserId,
}: ConversationViewProps) {
  const { data: messages = [], isLoading } = useMessages(conversationId);
  const [content, setContent] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark as read when conversation opens or new messages arrive
  const markRead = useCallback(() => {
    markMessagesRead(conversationId);
  }, [conversationId]);

  useEffect(() => {
    markRead();
  }, [markRead, messages.length]);

  // Determine other participant for the header
  const otherParticipant = messages.find(
    (m) => m.sender_id !== currentUserId
  )?.sender;

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitMessage();
    }
  }

  function submitMessage() {
    const trimmed = content.trim();
    if (!trimmed || isPending) return;
    setSendError(null);

    startTransition(async () => {
      const result = await sendMessage(conversationId, trimmed);
      if (!result.ok) {
        setSendError(result.error);
        return;
      }
      setContent("");
      textareaRef.current?.focus();
    });
  }

  // Group messages by date for separators
  const grouped: Array<{ date: Date; messages: MessageItem[] }> = [];
  for (const msg of messages) {
    const d = new Date(msg.created_at);
    const last = grouped[grouped.length - 1];
    if (!last || !isSameDay(last.date, d)) {
      grouped.push({ date: d, messages: [msg] });
    } else {
      last.messages.push(msg);
    }
  }

  // Find the first unread message index (from other person)
  const firstUnreadIndex = messages.findIndex(
    (m) => m.sender_id !== currentUserId && m.read_at === null
  );

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <Link
          href="/messages"
          className="shrink-0 text-muted-foreground hover:text-foreground sm:hidden"
        >
          <ArrowLeft className="size-5" />
        </Link>
        {otherParticipant ? (
          <>
            <Avatar className="size-8 shrink-0">
              {otherParticipant.avatar_url && (
                <AvatarImage
                  src={otherParticipant.avatar_url}
                  alt={otherParticipant.full_name}
                />
              )}
              <AvatarFallback className="text-xs">
                {getInitials(otherParticipant.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {otherParticipant.full_name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                @{otherParticipant.username}
              </p>
            </div>
          </>
        ) : (
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        )}
      </div>

      {/* Message list */}
      <div className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">
              No messages yet. Say hello!
            </p>
          </div>
        ) : (
          <>
            {grouped.map(({ date, messages: dayMsgs }) => (
              <div key={date.toISOString()}>
                {/* Date separator */}
                <div className="my-4 flex items-center gap-3">
                  <div className="flex-1 border-t" />
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {dateSeparatorLabel(date)}
                  </span>
                  <div className="flex-1 border-t" />
                </div>

                <div className="space-y-1">
                  {dayMsgs.map((msg) => {
                    const isMine = msg.sender_id === currentUserId;
                    const globalIndex = messages.indexOf(msg);
                    const isFirstUnread = globalIndex === firstUnreadIndex;

                    return (
                      <div key={msg.id}>
                        {isFirstUnread && (
                          <div className="my-3 flex items-center gap-3">
                            <div className="flex-1 border-t border-primary/30" />
                            <span className="shrink-0 text-[11px] font-medium text-primary">
                              New messages
                            </span>
                            <div className="flex-1 border-t border-primary/30" />
                          </div>
                        )}

                        <div
                          className={`flex items-end gap-2 ${
                            isMine ? "flex-row-reverse" : "flex-row"
                          }`}
                        >
                          {!isMine && (
                            <Avatar className="mb-1 size-6 shrink-0">
                              {msg.sender?.avatar_url && (
                                <AvatarImage
                                  src={msg.sender.avatar_url}
                                  alt={msg.sender.full_name}
                                />
                              )}
                              <AvatarFallback className="text-[9px]">
                                {msg.sender
                                  ? getInitials(msg.sender.full_name)
                                  : "?"}
                              </AvatarFallback>
                            </Avatar>
                          )}

                          <div
                            className={`group max-w-[70%] space-y-0.5 ${
                              isMine ? "items-end" : "items-start"
                            } flex flex-col`}
                          >
                            <div
                              className={`rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                                isMine
                                  ? "rounded-br-sm bg-primary text-primary-foreground"
                                  : "rounded-bl-sm bg-muted text-foreground"
                              }`}
                            >
                              {msg.content}
                            </div>
                            <span className="px-1 text-[10px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                              {format(new Date(msg.created_at), "h:mm a")}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input area */}
      <div className="border-t p-3">
        {sendError && (
          <p className="mb-2 text-xs text-destructive">{sendError}</p>
        )}
        <div className="flex items-end gap-2">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
            rows={1}
            maxLength={5000}
            className="max-h-32 min-h-[2.5rem] resize-none text-sm"
            disabled={isPending}
          />
          <Button
            size="icon"
            onClick={submitMessage}
            disabled={isPending || content.trim().length === 0}
            className="shrink-0"
            aria-label="Send message"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
