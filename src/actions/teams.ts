"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/get-user";
import {
  createTeamPostSchema,
  teamCommentSchema,
  type CreateTeamPostInput,
} from "@/validations/teams";
import { createNotification } from "@/lib/create-notification";

export type TeamPost = {
  id: string;
  profile_id: string;
  event_id: string | null;
  title: string;
  description: string;
  required_skills: string[];
  team_size_needed: number;
  contact_preference: "dm" | "comment" | "both";
  is_open: boolean;
  created_at: string;
  updated_at: string;
  author: {
    id: string;
    full_name: string;
    username: string | null;
    avatar_url: string | null;
  } | null;
  event: {
    id: string;
    title: string;
  } | null;
};

export type TeamPostComment = {
  id: string;
  team_post_id: string;
  profile_id: string;
  content: string;
  created_at: string;
  author: {
    id: string;
    full_name: string;
    username: string | null;
    avatar_url: string | null;
  } | null;
};

export type TeamPostFilters = {
  skills?: string[];
  event_id?: string;
  standalone_only?: boolean;
};

export type EventOption = { id: string; title: string };

function normalizeAuthor(raw: unknown): TeamPost["author"] {
  if (!raw) return null;
  const arr = Array.isArray(raw) ? raw : [raw];
  const first = arr[0];
  if (!first) return null;
  return first as TeamPost["author"];
}

function normalizeEvent(raw: unknown): TeamPost["event"] {
  if (!raw) return null;
  const arr = Array.isArray(raw) ? raw : [raw];
  const first = arr[0];
  if (!first) return null;
  return first as TeamPost["event"];
}

export async function createTeamPost(
  data: CreateTeamPostInput
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const user = await getUser();

  if (user.role !== "student") {
    return { ok: false, error: "Only students can create team posts." };
  }

  const parsed = createTeamPostSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();

  const { data: post, error } = await supabase
    .from("team_posts")
    .insert({
      profile_id: user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      required_skills: parsed.data.required_skills,
      team_size_needed: parsed.data.team_size_needed,
      contact_preference: parsed.data.contact_preference,
      event_id: parsed.data.event_id ?? null,
    })
    .select("id")
    .single();

  if (error || !post) {
    return { ok: false, error: "Failed to create post. Please try again." };
  }

  revalidatePath("/teams");

  return { ok: true, id: post.id };
}

export async function getTeamPosts(
  filters: TeamPostFilters = {}
): Promise<TeamPost[]> {
  const supabase = await createClient();

  let query = supabase
    .from("team_posts")
    .select(
      `
      id, profile_id, event_id, title, description, required_skills,
      team_size_needed, contact_preference, is_open, created_at, updated_at,
      author:profiles!team_posts_profile_id_fkey(id, full_name, username, avatar_url),
      event:events!team_posts_event_id_fkey(id, title)
    `
    )
    .eq("is_open", true)
    .order("created_at", { ascending: false });

  if (filters.skills && filters.skills.length > 0) {
    query = query.overlaps("required_skills", filters.skills);
  }

  if (filters.event_id) {
    query = query.eq("event_id", filters.event_id);
  }

  if (filters.standalone_only) {
    query = query.is("event_id", null);
  }

  const { data, error } = await query;

  if (error || !data) return [];

  return data.map((row) => ({
    ...row,
    author: normalizeAuthor(row.author),
    event: normalizeEvent(row.event),
  }));
}

export async function getTeamPost(postId: string): Promise<TeamPost | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("team_posts")
    .select(
      `
      id, profile_id, event_id, title, description, required_skills,
      team_size_needed, contact_preference, is_open, created_at, updated_at,
      author:profiles!team_posts_profile_id_fkey(id, full_name, username, avatar_url),
      event:events!team_posts_event_id_fkey(id, title)
    `
    )
    .eq("id", postId)
    .single();

  if (error || !data) return null;

  return {
    ...data,
    author: normalizeAuthor(data.author),
    event: normalizeEvent(data.event),
  };
}

export async function getTeamPostComments(
  postId: string
): Promise<TeamPostComment[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("team_post_comments")
    .select(
      `
      id, team_post_id, profile_id, content, created_at,
      author:profiles!team_post_comments_profile_id_fkey(id, full_name, username, avatar_url)
    `
    )
    .eq("team_post_id", postId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  return data.map((row) => ({
    ...row,
    author: normalizeAuthor(row.author),
  }));
}

export async function addTeamComment(
  postId: string,
  content: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await getUser();

  const parsed = teamCommentSchema.safeParse({ content });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("team_post_comments").insert({
    team_post_id: postId,
    profile_id: user.id,
    content: parsed.data.content,
  });

  if (error) {
    return { ok: false, error: "Failed to post comment. Please try again." };
  }

  // Notify the team post author (skip if they're commenting on their own post)
  const [{ data: teamPost }, { data: commenterProfile }] = await Promise.all([
    supabase
      .from("team_posts")
      .select("profile_id, title")
      .eq("id", postId)
      .single(),
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single(),
  ]);

  if (teamPost && teamPost.profile_id !== user.id) {
    const commenterName = commenterProfile?.full_name ?? "Someone";
    await createNotification(
      supabase,
      teamPost.profile_id,
      "team_match",
      `${commenterName} is interested in joining your team`,
      teamPost.title,
      `/teams/${postId}`
    );
  }

  revalidatePath(`/teams/${postId}`);
  return { ok: true };
}

export async function deleteTeamComment(
  commentId: string,
  postId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await getUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("team_post_comments")
    .delete()
    .eq("id", commentId)
    .eq("profile_id", user.id);

  if (error) {
    return { ok: false, error: "Failed to delete comment." };
  }

  revalidatePath(`/teams/${postId}`);
  return { ok: true };
}

export async function closeTeamPost(
  postId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await getUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("team_posts")
    .update({ is_open: false })
    .eq("id", postId)
    .eq("profile_id", user.id);

  if (error) {
    return { ok: false, error: "Failed to close post." };
  }

  revalidatePath(`/teams/${postId}`);
  revalidatePath("/teams");
  return { ok: true };
}

export async function reopenTeamPost(
  postId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await getUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("team_posts")
    .update({ is_open: true })
    .eq("id", postId)
    .eq("profile_id", user.id);

  if (error) {
    return { ok: false, error: "Failed to reopen post." };
  }

  revalidatePath(`/teams/${postId}`);
  revalidatePath("/teams");
  return { ok: true };
}

export type MatchedStudent = {
  profile_id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  university: string | null;
  matching_skills: string[];
  total_skills: number;
};

export async function getMatchedStudents(
  requiredSkills: string[],
  authorId: string
): Promise<MatchedStudent[]> {
  if (requiredSkills.length === 0) return [];

  const supabase = await createClient();

  const lowered = requiredSkills.map((s) => s.toLowerCase());

  const { data: matchingRows, error } = await supabase
    .from("skills")
    .select(
      "profile_id, name, profiles!inner(id, full_name, username, avatar_url, university, role)"
    )
    .neq("profile_id", authorId);

  if (error || !matchingRows) return [];

  const profileMap = new Map<
    string,
    {
      profile_id: string;
      full_name: string;
      username: string;
      avatar_url: string | null;
      university: string | null;
      matching_skills: string[];
      total_skills: number;
    }
  >();

  for (const row of matchingRows) {
    const profile = Array.isArray(row.profiles)
      ? (row.profiles[0] as {
          id: string;
          full_name: string;
          username: string;
          avatar_url: string | null;
          university: string | null;
          role: string;
        } | undefined)
      : (row.profiles as {
          id: string;
          full_name: string;
          username: string;
          avatar_url: string | null;
          university: string | null;
          role: string;
        } | null);

    if (!profile || profile.role !== "student") continue;

    if (!profileMap.has(row.profile_id)) {
      profileMap.set(row.profile_id, {
        profile_id: row.profile_id,
        full_name: profile.full_name,
        username: profile.username,
        avatar_url: profile.avatar_url,
        university: profile.university,
        matching_skills: [],
        total_skills: 0,
      });
    }

    const entry = profileMap.get(row.profile_id)!;
    entry.total_skills += 1;

    if (lowered.includes(row.name.toLowerCase())) {
      entry.matching_skills.push(row.name);
    }
  }

  return Array.from(profileMap.values())
    .filter((p) => p.matching_skills.length > 0)
    .sort((a, b) => b.matching_skills.length - a.matching_skills.length)
    .slice(0, 20);
}

export async function getUpcomingEventsForSelect(): Promise<EventOption[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .select("id, title")
    .gte("event_date", new Date().toISOString())
    .order("event_date", { ascending: true })
    .limit(50);

  if (error || !data) return [];

  return data;
}
