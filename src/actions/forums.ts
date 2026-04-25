"use server";

import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/get-user";
import { forumPostSchema } from "@/validations/forum";
import type { JSONContent } from "novel";
import { createNotification } from "@/lib/create-notification";

type AuthorProfile = {
  id: string;
  full_name: string;
  username: string | null;
  avatar_url: string | null;
};

export type ThreadDetail = {
  id: string;
  title: string;
  content: JSONContent;
  created_at: string;
  flag_count: number;
  flagReason: string | null;
  upvote_count: number;
  reply_count: number;
  category: { id: string; name: string; slug: string };
  author: AuthorProfile | null;
  currentUserVoted: boolean;
  currentUserFlagged: boolean;
};

export type ReplyItem = {
  id: string;
  content: JSONContent;
  created_at: string;
  flag_count: number;
  is_flagged: boolean;
  flagReason: string | null;
  author: AuthorProfile | null;
  currentUserFlagged: boolean;
};

export type CategoryWithCount = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
  postCount: number;
};

export type ThreadItem = {
  id: string;
  title: string;
  content_plain: string | null;
  created_at: string;
  flag_count: number;
  upvote_count: number;
  reply_count: number;
  author: {
    id: string;
    full_name: string;
    username: string | null;
    avatar_url: string | null;
  } | null;
};

export async function getCategories(): Promise<CategoryWithCount[]> {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("forum_categories")
    .select("id, name, slug, description, display_order")
    .order("display_order");

  if (!categories) return [];

  const { data: postRows } = await supabase
    .from("forum_posts")
    .select("category_id");

  const countMap = new Map<string, number>();
  postRows?.forEach((row) => {
    countMap.set(row.category_id, (countMap.get(row.category_id) ?? 0) + 1);
  });

  return categories.map((cat) => ({
    ...cat,
    postCount: countMap.get(cat.id) ?? 0,
  }));
}

export async function getThreads(
  categorySlug: string,
  cursor?: string
): Promise<{ threads: ThreadItem[]; nextCursor: string | null }> {
  const supabase = await createClient();

  const { data: category } = await supabase
    .from("forum_categories")
    .select("id")
    .eq("slug", categorySlug)
    .single();

  if (!category) return { threads: [], nextCursor: null };

  let query = supabase
    .from("forum_posts")
    .select("id, title, content_plain, created_at, flag_count, upvote_count, reply_count, profile_id")
    .eq("category_id", category.id)
    .order("created_at", { ascending: false })
    .limit(21);

  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data: posts } = await query;
  if (!posts) return { threads: [], nextCursor: null };

  const hasMore = posts.length === 21;
  const items = hasMore ? posts.slice(0, 20) : posts;

  const profileIds = [...new Set(items.map((p) => p.profile_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, username, avatar_url")
    .in("id", profileIds);

  const profileMap = new Map(profiles?.map((p) => [p.id, p]) ?? []);

  const threads: ThreadItem[] = items.map((post) => {
    const profile = profileMap.get(post.profile_id);
    return {
      id: post.id,
      title: post.title,
      content_plain: post.content_plain,
      created_at: post.created_at,
      flag_count: post.flag_count,
      upvote_count: post.upvote_count,
      reply_count: post.reply_count,
      author: profile
        ? {
            id: profile.id,
            full_name: profile.full_name,
            username: profile.username,
            avatar_url: profile.avatar_url,
          }
        : null,
    };
  });

  return {
    threads,
    nextCursor: hasMore ? items[items.length - 1].created_at : null,
  };
}

export async function getCategoryBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("forum_categories")
    .select("id, name, slug, description")
    .eq("slug", slug)
    .single();
  return data;
}

function extractPlainText(node: JSONContent): string {
  if (node.type === "text") return node.text ?? "";
  return (node.content ?? []).map(extractPlainText).join(" ");
}

export async function createForumPost(
  categoryId: string,
  title: string,
  content: JSONContent
) {
  const supabase = await createClient();
  const user = await getUser();

  if (user.role !== "student") {
    throw new Error("Only students can create forum posts.");
  }

  const validated = forumPostSchema.parse({ categoryId, title, content });

  const content_plain = extractPlainText(content).trim().slice(0, 500);

  const { data, error } = await supabase
    .from("forum_posts")
    .insert({
      profile_id: user.id,
      category_id: validated.categoryId,
      title: validated.title,
      content,
      content_plain,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getThread(postId: string): Promise<ThreadDetail | null> {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  const { data: post } = await supabase
    .from("forum_posts")
    .select("id, title, content, created_at, flag_count, upvote_count, reply_count, profile_id, category_id")
    .eq("id", postId)
    .single();

  if (!post) return null;

  const [{ data: category }, { data: author }, { data: vote }, { data: flag }, { data: flagReasonRow }] =
    await Promise.all([
      supabase
        .from("forum_categories")
        .select("id, name, slug")
        .eq("id", post.category_id)
        .single(),
      supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url")
        .eq("id", post.profile_id)
        .single(),
      authUser
        ? supabase
            .from("forum_post_votes")
            .select("id")
            .eq("post_id", postId)
            .eq("profile_id", authUser.id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      authUser
        ? supabase
            .from("forum_post_flags")
            .select("id")
            .eq("target_type", "post")
            .eq("target_id", postId)
            .eq("profile_id", authUser.id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      supabase
        .from("forum_post_flags")
        .select("reason")
        .eq("target_type", "post")
        .eq("target_id", postId)
        .not("reason", "is", null)
        .limit(1)
        .maybeSingle(),
    ]);

  if (!category) return null;

  return {
    id: post.id,
    title: post.title,
    content: post.content as JSONContent,
    created_at: post.created_at,
    flag_count: post.flag_count,
    flagReason: flagReasonRow?.reason ?? null,
    upvote_count: post.upvote_count,
    reply_count: post.reply_count,
    category,
    author: author
      ? { id: author.id, full_name: author.full_name, username: author.username, avatar_url: author.avatar_url }
      : null,
    currentUserVoted: !!vote,
    currentUserFlagged: !!flag,
  };
}

export async function getReplies(
  postId: string,
  cursor?: string
): Promise<{ replies: ReplyItem[]; nextCursor: string | null }> {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  let query = supabase
    .from("forum_replies")
    .select("id, content, created_at, flag_count, is_flagged, profile_id")
    .eq("post_id", postId)
    .order("created_at", { ascending: true })
    .limit(51);

  if (cursor) {
    query = query.gt("created_at", cursor);
  }

  const { data: rows } = await query;
  if (!rows) return { replies: [], nextCursor: null };

  const hasMore = rows.length === 51;
  const items = hasMore ? rows.slice(0, 50) : rows;

  const profileIds = [...new Set(items.map((r) => r.profile_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, username, avatar_url")
    .in("id", profileIds);

  const profileMap = new Map(profiles?.map((p) => [p.id, p]) ?? []);

  let userFlaggedIds = new Set<string>();
  const flagReasonMap = new Map<string, string>();

  if (items.length > 0) {
    const replyIds = items.map((r) => r.id);

    const [userFlagsResult, reasonsResult] = await Promise.all([
      authUser
        ? supabase
            .from("forum_post_flags")
            .select("target_id")
            .eq("target_type", "reply")
            .eq("profile_id", authUser.id)
            .in("target_id", replyIds)
        : Promise.resolve({ data: null }),
      supabase
        .from("forum_post_flags")
        .select("target_id, reason")
        .eq("target_type", "reply")
        .in("target_id", replyIds)
        .not("reason", "is", null),
    ]);

    userFlaggedIds = new Set(userFlagsResult.data?.map((f) => f.target_id) ?? []);
    for (const row of reasonsResult.data ?? []) {
      if (row.reason && !flagReasonMap.has(row.target_id)) {
        flagReasonMap.set(row.target_id, row.reason);
      }
    }
  }

  const replies: ReplyItem[] = items.map((row) => {
    const profile = profileMap.get(row.profile_id);
    return {
      id: row.id,
      content: row.content as JSONContent,
      created_at: row.created_at,
      flag_count: row.flag_count,
      is_flagged: row.is_flagged,
      flagReason: flagReasonMap.get(row.id) ?? null,
      author: profile
        ? { id: profile.id, full_name: profile.full_name, username: profile.username, avatar_url: profile.avatar_url }
        : null,
      currentUserFlagged: userFlaggedIds.has(row.id),
    };
  });

  return {
    replies,
    nextCursor: hasMore ? items[items.length - 1].created_at : null,
  };
}

export async function replyToPost(
  postId: string,
  content: JSONContent
): Promise<ReplyItem> {
  const supabase = await createClient();
  const user = await getUser();

  if (user.role !== "student") {
    throw new Error("Only students can reply to posts.");
  }

  const plainText = extractPlainText(content).trim();
  if (!plainText) throw new Error("Reply cannot be empty.");

  const { data: reply, error } = await supabase
    .from("forum_replies")
    .insert({ post_id: postId, profile_id: user.id, content })
    .select("id, created_at")
    .single();

  if (error) throw new Error(error.message);

  const [{ data: profile }, { data: post }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, username, avatar_url")
      .eq("id", user.id)
      .single(),
    supabase
      .from("forum_posts")
      .select("profile_id, title, category_id")
      .eq("id", postId)
      .single(),
  ]);

  // Notify the thread author (skip if they replied to their own post)
  if (post && post.profile_id !== user.id) {
    const { data: category } = await supabase
      .from("forum_categories")
      .select("slug")
      .eq("id", post.category_id)
      .single();

    const link = category
      ? `/forums/${category.slug}/${postId}`
      : `/forums`;

    const replierName = profile?.full_name ?? "Someone";
    await createNotification(
      supabase,
      post.profile_id,
      "forum_reply",
      `${replierName} replied to your post`,
      post.title,
      link
    );
  }

  return {
    id: reply.id,
    content,
    created_at: reply.created_at,
    flag_count: 0,
    is_flagged: false,
    flagReason: null,
    author: profile
      ? { id: profile.id, full_name: profile.full_name, username: profile.username, avatar_url: profile.avatar_url }
      : null,
    currentUserFlagged: false,
  };
}

export async function votePost(
  postId: string
): Promise<{ voted: boolean }> {
  const supabase = await createClient();
  const user = await getUser();

  if (user.role !== "student") {
    throw new Error("Only students can vote.");
  }

  const { data: existing } = await supabase
    .from("forum_post_votes")
    .select("id")
    .eq("post_id", postId)
    .eq("profile_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from("forum_post_votes").delete().eq("id", existing.id);
    return { voted: false };
  }

  await supabase
    .from("forum_post_votes")
    .insert({ post_id: postId, profile_id: user.id });
  return { voted: true };
}

export async function flagContent(
  targetType: "post" | "reply",
  targetId: string,
  reason?: string
): Promise<void> {
  const supabase = await createClient();
  const user = await getUser();

  if (user.role !== "student") {
    throw new Error("Only students can flag content.");
  }

  const { error } = await supabase.from("forum_post_flags").insert({
    target_type: targetType,
    target_id: targetId,
    profile_id: user.id,
    reason: reason ?? null,
  });

  // Ignore duplicate flag errors (UNIQUE constraint)
  if (error && !error.message.includes("duplicate") && !error.code?.includes("23505")) {
    throw new Error(error.message);
  }
}
