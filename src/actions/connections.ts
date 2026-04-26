"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleConnection(targetProfileId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  if (user.id === targetProfileId) {
    return { error: "You cannot connect with yourself." };
  }

  // Check if already connected
  const { data: existing } = await supabase
    .from("connections")
    .select("id")
    .eq("follower_id", user.id)
    .eq("following_id", targetProfileId)
    .maybeSingle();

  if (existing) {
    // Disconnect
    const { error } = await supabase
      .from("connections")
      .delete()
      .eq("id", existing.id);

    if (error) return { error: error.message };
  } else {
    // Connect
    const { error } = await supabase
      .from("connections")
      .insert({
        follower_id: user.id,
        following_id: targetProfileId,
      });

    if (error) return { error: error.message };
  }

  revalidatePath("/dashboard");
  // We'll also need to revalidate the profile page, but we don't know the username here easily.
  // We can use revalidatePath("/u/[username]", "page") but it's better to revalidate the specific path.
  
  return { ok: true, connected: !existing };
}

export async function checkConnection(targetProfileId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("connections")
    .select("id")
    .eq("follower_id", user.id)
    .eq("following_id", targetProfileId)
    .maybeSingle();

  return !!data;
}
