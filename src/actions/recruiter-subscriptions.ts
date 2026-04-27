"use server";

import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/get-user";

export async function checkRecruiterSubscription(recruiterId: string): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("recruiter_subscriptions")
    .select("id")
    .eq("student_id", user.id)
    .eq("recruiter_id", recruiterId)
    .maybeSingle();

  return !!data;
}

export async function toggleRecruiterSubscription(
  recruiterId: string
): Promise<{ ok: true; subscribed: boolean } | { ok: false; error: string }> {
  const user = await getUser();
  if (user.role !== "student")
    return { ok: false, error: "Only students can connect to recruiters." };
  if (user.id === recruiterId)
    return { ok: false, error: "Cannot connect to yourself." };

  const supabase = await createClient();
  const isSubscribed = await checkRecruiterSubscription(recruiterId);

  if (isSubscribed) {
    const { error } = await supabase
      .from("recruiter_subscriptions")
      .delete()
      .eq("student_id", user.id)
      .eq("recruiter_id", recruiterId);

    if (error) return { ok: false, error: "Failed to disconnect." };
    return { ok: true, subscribed: false };
  }

  const { error } = await supabase
    .from("recruiter_subscriptions")
    .insert({ student_id: user.id, recruiter_id: recruiterId });

  if (error) return { ok: false, error: "Failed to connect." };
  return { ok: true, subscribed: true };
}
