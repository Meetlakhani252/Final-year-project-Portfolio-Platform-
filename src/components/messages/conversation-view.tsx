"use client";

import {
  useEffect,
  useRef,
  useState,
  useTransition,
  useCallback,
} from "react";
import Link from "next/link";
import { ArrowLeft, Send, Loader2, Phone, Video, MoreVertical } from "lucide-react";
import { format, isToday, isYesterday, isSameDay } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMessages } from "@/hooks/use-messages";
import { sendMessage, markMessagesRead } from "@/actions/messages";
import type { MessageItem, ParticipantProfile } from "@/actions/messages";

interface ConversationViewProps {
  conversationId: string;
  currentUserId: string;
  initialOtherParticipant?: ParticipantProfile | null;
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

/* ── Message bubble ── */
function MessageBubble({
  msg,
  isMine,
  showAvatar,
}: {
  msg: MessageItem;
  isMine: boolean;
  showAvatar: boolean;
}) {
  return (
    <div
      className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Other person's avatar — only on last message in a group */}
      <div className="size-7 shrink-0">
        {!isMine && showAvatar ? (
          <Avatar className="size-7">
            {msg.sender?.avatar_url && (
              <AvatarImage
                src={msg.sender.avatar_url}
                alt={msg.sender.full_name}
              />
            )}
            <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
              {msg.sender ? getInitials(msg.sender.full_name) : "?"}
            </AvatarFallback>
          </Avatar>
        ) : null}
      </div>

      {/* Bubble */}
      <div
        className={`group max-w-[65%] flex flex-col gap-0.5 ${
          isMine ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
            isMine
              ? "rounded-2xl rounded-br-md bg-primary text-primary-foreground"
              : "rounded-2xl rounded-bl-md bg-card text-card-foreground border border-border/60"
          }`}
        >
          {msg.content}
        </div>
        {/* Timestamp — always visible, subtle */}
        <span className={`text-[10px] text-muted-foreground px-1 ${isMine ? "text-right" : "text-left"}`}>
          {format(new Date(msg.created_at), "h:mm a")}
          {isMine && (
            <span className="ml-1 text-primary/60">✓</span>
          )}
        </span>
      </div>
    </div>
  );
}

export function ConversationView({
  conversationId,
  currentUserId,
  initialOtherParticipant,
}: ConversationViewProps) {
  const { data: messages = [], isLoading } = useMessages(conversationId);
  const [content, setContent] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark as read
  const markRead = useCallback(() => {
    markMessagesRead(conversationId);
  }, [conversationId]);

  useEffect(() => {
    markRead();
  }, [markRead, messages.length]);

  // Determine other participant — prefer a profile from received messages,
  // fall back to the prop passed from the conversation list (handles the case
  // where the current user sent the only message so far).
  const otherParticipant =
    messages.find((m) => m.sender_id !== currentUserId)?.sender ??
    initialOtherParticipant ??
    null;

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

  // Group messages by date
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

  // Find first unread
  const firstUnreadIndex = messages.findIndex(
    (m) => m.sender_id !== currentUserId && m.read_at === null
  );

  return (
    <div className="flex h-full flex-col">

      {/* ── Chat header ── */}
      <div className="flex items-center justify-between gap-3 border-b bg-background px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          {/* Back button (mobile only) */}
          <Link
            href="/messages"
            className="shrink-0 text-muted-foreground hover:text-foreground sm:hidden"
          >
            <ArrowLeft className="size-5" />
          </Link>

          {otherParticipant ? (
            <>
              <div className="relative shrink-0">
                <Avatar className="size-10 ring-2 ring-border">
                  {otherParticipant.avatar_url && (
                    <AvatarImage
                      src={otherParticipant.avatar_url}
                      alt={otherParticipant.full_name}
                    />
                  )}
                  <AvatarFallback className="text-sm bg-primary/10 text-primary">
                    {getInitials(otherParticipant.full_name)}
                  </AvatarFallback>
                </Avatar>
                {/* Online dot */}
                <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-green-500 ring-2 ring-background" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold leading-tight">
                  {otherParticipant.full_name}
                </p>
                <p className="text-xs text-green-600 font-medium">Online</p>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <div className="size-10 animate-pulse rounded-full bg-muted" />
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            </div>
          )}
        </div>

        {/* Header actions */}
        <div className="flex items-center gap-1 shrink-0">
          {otherParticipant && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground hidden sm:flex"
              render={<Link href={`/u/${otherParticipant.username}`} />}
            >
              View Profile
            </Button>
          )}
          <Button variant="ghost" size="icon" className="size-9 text-muted-foreground" aria-label="Voice call">
            <Phone className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="size-9 text-muted-foreground" aria-label="Video call">
            <Video className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="size-9 text-muted-foreground" aria-label="More options">
            <MoreVertical className="size-4" />
          </Button>
        </div>
      </div>

      {/* ── Message list ── */}
      <div
        className="flex-1 overflow-y-auto px-4 py-5 space-y-4"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, hsl(var(--border)/0.3) 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      >
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="size-6 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">Loading messages…</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl">👋</span>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground/70">
                Start the conversation
              </p>
              <p className="text-xs text-muted-foreground">
                Say hello to {otherParticipant?.full_name ?? "your contact"}!
              </p>
            </div>
          </div>
        ) : (
          <>
            {grouped.map(({ date, messages: dayMsgs }) => (
              <div key={date.toISOString()} className="space-y-2">
                {/* Date separator */}
                <div className="flex items-center gap-3 my-2">
                  <div className="flex-1 border-t border-border/50" />
                  <span className="shrink-0 text-[11px] text-muted-foreground bg-background/80 px-2 py-0.5 rounded-full border border-border/40">
                    {dateSeparatorLabel(date)}
                  </span>
                  <div className="flex-1 border-t border-border/50" />
                </div>

                <div className="space-y-1.5">
                  {dayMsgs.map((msg, idx) => {
                    const isMine = msg.sender_id === currentUserId;
                    const globalIndex = messages.indexOf(msg);
                    const isFirstUnread = globalIndex === firstUnreadIndex;
                    // Show avatar only on last message of a group from same sender
                    const nextMsg = dayMsgs[idx + 1];
                    const isLastInGroup =
                      !nextMsg || nextMsg.sender_id !== msg.sender_id;

                    return (
                      <div key={msg.id}>
                        {isFirstUnread && (
                          <div className="flex items-center gap-3 my-3">
                            <div className="flex-1 border-t border-primary/30" />
                            <span className="shrink-0 text-[11px] font-medium text-primary bg-primary/10 px-3 py-0.5 rounded-full">
                              New messages
                            </span>
                            <div className="flex-1 border-t border-primary/30" />
                          </div>
                        )}
                        <MessageBubble
                          msg={msg}
                          isMine={isMine}
                          showAvatar={isLastInGroup}
                        />
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

      {/* ── Input area ── */}
      <div className="border-t bg-background px-4 py-3">
        {sendError && (
          <p className="mb-2 text-xs text-destructive bg-destructive/10 px-3 py-1.5 rounded-lg">
            {sendError}
          </p>
        )}
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message…"
              rows={1}
              maxLength={5000}
              className="max-h-32 min-h-[2.75rem] resize-none text-sm rounded-2xl pr-4 border-border/60 bg-muted/30 focus-visible:ring-primary/30 focus-visible:bg-background transition-colors"
              disabled={isPending}
            />
          </div>
          <Button
            size="icon"
            onClick={submitMessage}
            disabled={isPending || content.trim().length === 0}
            className="shrink-0 size-11 rounded-full shadow-md"
            aria-label="Send message"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </div>
        <p className="mt-1.5 text-[10px] text-muted-foreground text-center">
          Press <kbd className="font-mono bg-muted px-1 rounded text-[9px]">Enter</kbd> to send · <kbd className="font-mono bg-muted px-1 rounded text-[9px]">Shift+Enter</kbd> for new line
        </p>
      </div>
    </div>
  );
}
