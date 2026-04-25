"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { messageSchema } from "@/validations/message";
import { createNotification } from "@/lib/create-notification";

// ─── Types ──────────────────────────────────────────────────────────────────

export type ParticipantProfile = {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
};

export type ConversationItem = {
  id: string;
  lastMessageAt: string;
  otherParticipant: ParticipantProfile | null;
  lastMessage: {
    content: string;
    created_at: string;
    sender_id: string;
  } | null;
  unreadCount: number;
};

export type MessageItem = {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  read_at: string | null;
  sender: ParticipantProfile | null;
};

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

// ─── startConversation ───────────────────────────────────────────────────────

/**
 * Find or create a conversation with recipientId.
 * Enforces: students cannot initiate DMs with recruiters.
 */
export async function startConversation(
  recipientId: string
): Promise<ActionResult<{ conversationId: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (user.id === recipientId) {
    return { ok: false, error: "You cannot message yourself." };
  }

  const [{ data: senderProfile }, { data: recipientProfile }] =
    await Promise.all([
      supabase.from("profiles").select("role").eq("id", user.id).single(),
      supabase
        .from("profiles")
        .select("id, role")
        .eq("id", recipientId)
        .single(),
    ]);

  if (!recipientProfile) {
    return { ok: false, error: "User not found." };
  }

  // Enforce participant_one < participant_two constraint
  const p1 = user.id < recipientId ? user.id : recipientId;
  const p2 = user.id < recipientId ? recipientId : user.id;

  const isStudentToRecruiter =
    senderProfile?.role === "student" && recipientProfile.role === "recruiter";

  if (isStudentToRecruiter) {
    // Only allowed if the recruiter already started the conversation
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("participant_one", p1)
      .eq("participant_two", p2)
      .maybeSingle();

    if (!existing) {
      return {
        ok: false,
        error: "Students cannot initiate conversations with recruiters.",
      };
    }
    return { ok: true, data: { conversationId: existing.id } };
  }

  // ignoreDuplicates: true → ON CONFLICT DO NOTHING (preserves last_message_at)
  await supabase
    .from("conversations")
    .upsert(
      { participant_one: p1, participant_two: p2 },
      { onConflict: "participant_one,participant_two", ignoreDuplicates: true }
    );

  const { data: conv } = await supabase
    .from("conversations")
    .select("id")
    .eq("participant_one", p1)
    .eq("participant_two", p2)
    .single();

  if (!conv) return { ok: false, error: "Could not create conversation." };
  return { ok: true, data: { conversationId: conv.id } };
}

// ─── sendMessage ─────────────────────────────────────────────────────────────

export async function sendMessage(
  conversationId: string,
  content: string
): Promise<ActionResult<MessageItem>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const parsed = messageSchema.safeParse({ content });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  // Verify user is a participant and get the other participant's id
  const { data: conv } = await supabase
    .from("conversations")
    .select("id, participant_one, participant_two")
    .eq("id", conversationId)
    .or(`participant_one.eq.${user.id},participant_two.eq.${user.id}`)
    .single();

  if (!conv) return { ok: false, error: "Conversation not found." };

  const { data: message, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: parsed.data.content,
    })
    .select("id, content, created_at, sender_id, read_at")
    .single();

  if (error || !message) return { ok: false, error: "Failed to send message." };

  const { data: senderProfile } = await supabase
    .from("profiles")
    .select("id, full_name, username, avatar_url")
    .eq("id", user.id)
    .single();

  // Notify the recipient
  const recipientId =
    conv.participant_one === user.id ? conv.participant_two : conv.participant_one;

  const senderName = senderProfile?.full_name ?? "Someone";
  await createNotification(
    supabase,
    recipientId,
    "dm",
    `New message from ${senderName}`,
    parsed.data.content.slice(0, 120),
    `/messages`
  );

  return { ok: true, data: { ...message, sender: senderProfile ?? null } };
}

// ─── markMessagesRead ────────────────────────────────────────────────────────

export async function markMessagesRead(conversationId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .neq("sender_id", user.id)
    .is("read_at", null);
}

// ─── getConversations ────────────────────────────────────────────────────────

export async function getConversations(): Promise<ConversationItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: convos } = await supabase
    .from("conversations")
    .select("id, last_message_at, participant_one, participant_two")
    .or(`participant_one.eq.${user.id},participant_two.eq.${user.id}`)
    .order("last_message_at", { ascending: false });

  if (!convos || convos.length === 0) return [];

  const convoIds = convos.map((c) => c.id);
  const otherIds = [
    ...new Set(
      convos.map((c) =>
        c.participant_one === user.id ? c.participant_two : c.participant_one
      )
    ),
  ];

  const [{ data: profiles }, { data: allMessages }, { data: unreadMessages }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url")
        .in("id", otherIds),
      supabase
        .from("messages")
        .select("conversation_id, content, created_at, sender_id")
        .in("conversation_id", convoIds)
        .order("created_at", { ascending: false }),
      supabase
        .from("messages")
        .select("conversation_id")
        .in("conversation_id", convoIds)
        .neq("sender_id", user.id)
        .is("read_at", null),
    ]);

  // Last message per conversation (DESC ordered, take first seen per id)
  const lastMsgMap = new Map<
    string,
    { content: string; created_at: string; sender_id: string }
  >();
  for (const msg of allMessages ?? []) {
    if (!lastMsgMap.has(msg.conversation_id)) {
      lastMsgMap.set(msg.conversation_id, msg);
    }
  }

  const unreadMap = new Map<string, number>();
  for (const msg of unreadMessages ?? []) {
    unreadMap.set(
      msg.conversation_id,
      (unreadMap.get(msg.conversation_id) ?? 0) + 1
    );
  }

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  return convos.map((c) => {
    const otherId =
      c.participant_one === user.id ? c.participant_two : c.participant_one;
    return {
      id: c.id,
      lastMessageAt: c.last_message_at,
      otherParticipant: profileMap.get(otherId) ?? null,
      lastMessage: lastMsgMap.get(c.id) ?? null,
      unreadCount: unreadMap.get(c.id) ?? 0,
    };
  });
}

// ─── getMessages ─────────────────────────────────────────────────────────────

export async function getMessages(
  conversationId: string
): Promise<MessageItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: conv } = await supabase
    .from("conversations")
    .select("id")
    .eq("id", conversationId)
    .or(`participant_one.eq.${user.id},participant_two.eq.${user.id}`)
    .single();

  if (!conv) return [];

  const { data: messages } = await supabase
    .from("messages")
    .select("id, content, created_at, sender_id, read_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(100);

  if (!messages || messages.length === 0) return [];

  const senderIds = [...new Set(messages.map((m) => m.sender_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, username, avatar_url")
    .in("id", senderIds);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  return messages.map((m) => ({
    ...m,
    sender: profileMap.get(m.sender_id) ?? null,
  }));
}

// ─── getUnreadCount ───────────────────────────────────────────────────────────

export async function getUnreadCount(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { data: convos } = await supabase
    .from("conversations")
    .select("id")
    .or(`participant_one.eq.${user.id},participant_two.eq.${user.id}`);

  if (!convos || convos.length === 0) return 0;

  const { count } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .in(
      "conversation_id",
      convos.map((c) => c.id)
    )
    .neq("sender_id", user.id)
    .is("read_at", null);

  return count ?? 0;
}
