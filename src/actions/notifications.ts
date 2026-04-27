"use server";

import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export type NotificationItem = {
  id: string;
  type: "comment" | "dm" | "team_match" | "event_new" | "forum_reply" | "application" | "job_post";
  title: string;
  body: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
};

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

export async function getUnreadNotificationCount(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", user.id)
    .eq("is_read", false);

  return count ?? 0;
}

export async function getRecentNotifications(): Promise<NotificationItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("notifications")
    .select("id, type, title, body, link, is_read, created_at")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  return (data as NotificationItem[] | null) ?? [];
}

export async function getNotificationPage(
  filter: "all" | "unread" = "all",
  cursor?: string
): Promise<{ items: NotificationItem[]; nextCursor: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let query = supabase
    .from("notifications")
    .select("id, type, title, body, link, is_read, created_at")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false })
    .limit(21);

  if (filter === "unread") {
    query = query.eq("is_read", false);
  }

  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data } = await query;
  const rows = (data as NotificationItem[] | null) ?? [];

  const hasMore = rows.length === 21;
  const items = hasMore ? rows.slice(0, 20) : rows;

  return {
    items,
    nextCursor: hasMore ? items[items.length - 1].created_at : null,
  };
}

export async function markNotificationRead(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id)
    .eq("profile_id", user.id);

  if (error) return { ok: false, error: "Failed to mark notification as read." };
  return { ok: true };
}

export async function markAllNotificationsRead(): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("profile_id", user.id)
    .eq("is_read", false);

  if (error) return { ok: false, error: "Failed to mark all as read." };
  return { ok: true };
}

export async function createNotification(
  profileId: string,
  data: Pick<NotificationItem, "type" | "title" | "body" | "link">
): Promise<ActionResult> {
  const supabase = await createAdminClient();

  const { error } = await supabase.from("notifications").insert({
    profile_id: profileId,
    type: data.type,
    title: data.title,
    body: data.body,
    link: data.link,
  });

  if (error) {
    console.error("Failed to create notification:", error);
    return { ok: false, error: "Failed to create notification." };
  }

  return { ok: true };
}
