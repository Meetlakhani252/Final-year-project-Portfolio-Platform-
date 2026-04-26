"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateUsername(username: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not authenticated" };
  }

  // Update profile
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ username })
    .eq("id", user.id);

  if (profileError) {
    if (profileError.message.includes("unique")) {
      return { ok: false, error: "This username is already taken." };
    }
    return { ok: false, error: profileError.message };
  }

  // Update auth metadata
  await supabase.auth.updateUser({
    data: { username },
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  revalidatePath(`/u/${username}`);

  return { ok: true };
}
