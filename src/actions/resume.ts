"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ResumeData } from "@/lib/pdf";
import type { Json } from "@/types/database";
import type { ActionResult } from "@/actions/portfolio";

export async function saveResume(data: ResumeData): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { error } = await supabase.from("resumes").upsert(
    {
      profile_id: user.id,
      template: data.template,
      resume_data: data as unknown as Json,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "profile_id" }
  );

  if (error) return { ok: false, error: error.message };

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  if (profile?.username) {
    revalidatePath(`/u/${profile.username}/resume`);
    revalidatePath("/resume/preview");
  }

  return { ok: true };
}
