"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { commentSchema } from "@/validations/comment";
import { createNotification } from "@/lib/create-notification";

export type CommentWithProfile = {
  id: string;
  content: string;
  created_at: string;
  profile_id: string;
  profiles: {
    full_name: string;
    username: string;
    avatar_url: string | null;
  };
};

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

export async function getComments(
  targetType: "project" | "blog_post",
  targetId: string
): Promise<CommentWithProfile[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("comments")
    .select("id, content, created_at, profile_id, profiles(full_name, username, avatar_url)")
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .order("created_at", { ascending: true });

  return (data as CommentWithProfile[] | null) ?? [];
}

export async function addComment(
  targetType: "project" | "blog_post",
  targetId: string,
  content: string
): Promise<ActionResult<CommentWithProfile>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "student") {
    return { ok: false, error: "Only students can comment." };
  }

  const parsed = commentSchema.safeParse({
    content,
    target_type: targetType,
    target_id: targetId,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const { data: comment, error } = await supabase
    .from("comments")
    .insert({
      profile_id: user.id,
      target_type: targetType,
      target_id: targetId,
      content: parsed.data.content,
    })
    .select("id, content, created_at, profile_id, profiles(full_name, username, avatar_url)")
    .single();

  if (error || !comment) {
    return { ok: false, error: "Failed to post comment." };
  }

  await revalidatePortfolioPath(supabase, targetType, targetId);

  // Notify the portfolio owner (skip if the owner is the commenter)
  const ownerTable = targetType === "project" ? "projects" : "blog_posts";
  const { data: ownerRow } = await supabase
    .from(ownerTable)
    .select("profile_id, profiles(username)")
    .eq("id", targetId)
    .single();

  const ownerId = ownerRow?.profile_id;
  if (ownerId && ownerId !== user.id) {
    const ownerUsername =
      (ownerRow?.profiles as { username: string } | null)?.username ?? "";
    const itemLabel = targetType === "project" ? "project" : "blog post";
    const link =
      targetType === "project"
        ? `/u/${ownerUsername}`
        : `/u/${ownerUsername}/blog`;

    const commenterName =
      (comment as CommentWithProfile).profiles?.full_name ?? "Someone";

    await createNotification(
      supabase,
      ownerId,
      "comment",
      `${commenterName} commented on your ${itemLabel}`,
      comment.content.slice(0, 120),
      link
    );
  }

  return { ok: true, data: comment as CommentWithProfile };
}

export async function deleteComment(id: string): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: comment } = await supabase
    .from("comments")
    .select("id, profile_id, target_type, target_id")
    .eq("id", id)
    .single();

  if (!comment) return { ok: false, error: "Comment not found." };

  const isAuthor = comment.profile_id === user.id;

  if (!isAuthor) {
    // Check if the current user owns the portfolio content the comment is on
    const isOwner = await isPortfolioOwner(
      supabase,
      comment.target_type,
      comment.target_id,
      user.id
    );
    if (!isOwner) return { ok: false, error: "Not authorized." };
  }

  const { error } = await supabase.from("comments").delete().eq("id", id);

  if (error) return { ok: false, error: "Failed to delete comment." };

  await revalidatePortfolioPath(supabase, comment.target_type, comment.target_id);

  return { ok: true };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

async function isPortfolioOwner(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  targetType: string,
  targetId: string,
  userId: string
): Promise<boolean> {
  const table = targetType === "project" ? "projects" : "blog_posts";
  const { data } = await supabase
    .from(table)
    .select("profile_id")
    .eq("id", targetId)
    .single();
  return data?.profile_id === userId;
}

async function revalidatePortfolioPath(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  targetType: string,
  targetId: string
): Promise<void> {
  const table = targetType === "project" ? "projects" : "blog_posts";
  const { data } = await supabase
    .from(table)
    .select("profiles(username)")
    .eq("id", targetId)
    .single();

  const username = (data?.profiles as { username: string } | null)?.username;
  if (username) {
    revalidatePath(`/u/${username}`);
    if (targetType === "blog_post") {
      revalidatePath(`/u/${username}/blog`);
    }
  }
}
