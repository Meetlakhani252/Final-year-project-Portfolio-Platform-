import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { sendNotificationEmail } from "@/lib/resend";
import type { NotificationType } from "@/emails/notification";

// Maps notification type to notification_preferences key
const EMAIL_PREF_KEY: Record<NotificationType, string> = {
  comment: "email_comments",
  dm: "email_dms",
  team_match: "email_team_match",
  event_new: "email_events",
  forum_reply: "email_forum_replies",
};

export async function createNotification(
  supabase: SupabaseClient<Database>,
  profileId: string,
  type: NotificationType,
  title: string,
  body: string | null,
  link: string | null
): Promise<void> {
  // Fetch recipient profile (email + preferences + name)
  const { data: profile } = await supabase
    .from("profiles")
    .select("email, full_name, notification_preferences")
    .eq("id", profileId)
    .single();

  if (!profile) return;

  // Insert in-app notification
  const { data: notification } = await supabase
    .from("notifications")
    .insert({ profile_id: profileId, type, title, body, link })
    .select("id")
    .single();

  if (!notification) return;

  // Check email preference for this type
  const prefs = (profile.notification_preferences ?? {}) as Record<string, boolean>;
  const emailEnabled = prefs[EMAIL_PREF_KEY[type]] !== false;
  if (!emailEnabled) return;

  // Rate limit: skip email if one of this type was already sent in the last hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", profileId)
    .eq("type", type)
    .eq("email_sent", true)
    .gte("created_at", oneHourAgo);

  if (count && count > 0) return;

  // Build absolute link
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const absoluteLink = link ? `${appUrl}${link}` : appUrl;

  const sent = await sendNotificationEmail(profile.email, {
    type,
    recipientName: profile.full_name,
    title,
    body: body ?? title,
    link: absoluteLink,
  });

  if (sent) {
    await supabase
      .from("notifications")
      .update({ email_sent: true })
      .eq("id", notification.id);
  }
}
