"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { aboutSchema, avatarFileSchema, type AboutInput } from "@/validations/portfolio";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

export async function updateProfile(
  input: AboutInput
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const parsed = aboutSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const data = parsed.data;

  const { data: profile, error } = await supabase
    .from("profiles")
    .update({
      full_name: data.full_name,
      bio: data.bio || null,
      university: data.university || null,
      program: data.program || null,
      graduation_year: data.graduation_year ?? null,
      gpa: data.gpa ?? null,
      gpa_public: data.gpa_public ?? false,
    })
    .eq("id", user.id)
    .select("username")
    .single();

  if (error) {
    return { ok: false, error: "Failed to update profile. Please try again." };
  }

  revalidatePath("/portfolio/edit");
  if (profile?.username) {
    revalidatePath(`/u/${profile.username}`);
  }

  return { ok: true };
}

export async function uploadAvatar(
  formData: FormData
): Promise<ActionResult<{ url: string }>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "No file provided" };
  }

  const parsed = avatarFileSchema.safeParse(file);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filePath = `${user.id}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) {
    return { ok: false, error: "Failed to upload avatar. Please try again." };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(filePath);

  // Cache-bust so the new image shows immediately
  const url = `${publicUrl}?v=${Date.now()}`;

  const { data: profile, error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: url })
    .eq("id", user.id)
    .select("username")
    .single();

  if (updateError) {
    return { ok: false, error: "Failed to save avatar URL." };
  }

  await supabase.auth.updateUser({ data: { avatar_url: url } });

  revalidatePath("/portfolio/edit");
  if (profile?.username) {
    revalidatePath(`/u/${profile.username}`);
  }

  return { ok: true, data: { url } };
}
