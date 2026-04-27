"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/actions/portfolio";
import type { GitHubRepo } from "@/lib/github";

export async function disconnectGitHub(): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("github_connections")
    .delete()
    .eq("profile_id", user.id);

  if (error) {
    return { ok: false, error: "Failed to disconnect GitHub." };
  }

  revalidatePath("/settings");
  return { ok: true };
}

interface ImportRepoInput {
  id: number; // GitHub repo id
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  techStack: string[]; // derived from languages
}

export async function importGithubRepos(
  repos: ImportRepoInput[]
): Promise<ActionResult<{ imported: number; skipped: number }>> {
  if (repos.length === 0) {
    return { ok: false, error: "No repositories selected." };
  }
  if (repos.length > 20) {
    return { ok: false, error: "You can import at most 20 repositories at once." };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch existing imported repo IDs to skip duplicates
  const { data: existingProjects } = await supabase
    .from("projects")
    .select("github_repo_id")
    .eq("profile_id", user.id)
    .eq("is_imported", true);

  const existingRepoIds = new Set(
    (existingProjects ?? []).map((p) => String(p.github_repo_id))
  );

  // Get current max display_order
  const { data: maxOrderRow } = await supabase
    .from("projects")
    .select("display_order")
    .eq("profile_id", user.id)
    .order("display_order", { ascending: false })
    .limit(1)
    .single();

  let nextOrder = (maxOrderRow?.display_order ?? -1) + 1;

  const toInsert = [];
  let skipped = 0;

  for (const repo of repos) {
    const repoIdStr = String(repo.id);
    if (existingRepoIds.has(repoIdStr)) {
      skipped++;
      continue;
    }

    toInsert.push({
      profile_id: user.id,
      title: repo.name,
      description: repo.description,
      github_url: repo.html_url,
      live_url: repo.homepage || null,
      tech_stack: repo.techStack,
      is_imported: true,
      github_repo_id: repoIdStr,
      display_order: nextOrder++,
    });
  }

  if (toInsert.length === 0) {
    return { ok: true, data: { imported: 0, skipped } };
  }

  const { error } = await supabase.from("projects").insert(toInsert);

  if (error) {
    return { ok: false, error: "Failed to import repositories." };
  }

  // Update last_synced_at
  await supabase
    .from("github_connections")
    .update({ last_synced_at: new Date().toISOString() })
    .eq("profile_id", user.id);

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  revalidatePath("/portfolio/edit");
  if (profile?.username) revalidatePath(`/u/${profile.username}`);

  return { ok: true, data: { imported: toInsert.length, skipped } };
}

export async function addGithubSkills(
  skillNames: string[]
): Promise<ActionResult<{ added: number; skipped: number }>> {
  if (skillNames.length === 0) {
    return { ok: false, error: "No skills provided." };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch existing skills to avoid duplicates
  const { data: existing } = await supabase
    .from("skills")
    .select("name")
    .eq("profile_id", user.id);

  const existingNames = new Set(
    (existing ?? []).map((s) => s.name.toLowerCase())
  );

  const toInsert = skillNames
    .filter((name) => !existingNames.has(name.toLowerCase()))
    .map((name) => ({
      profile_id: user.id,
      name,
      source: "github" as const,
    }));

  const skipped = skillNames.length - toInsert.length;

  if (toInsert.length === 0) {
    return { ok: true, data: { added: 0, skipped } };
  }

  const { error } = await supabase.from("skills").insert(toInsert);

  if (error) {
    return { ok: false, error: "Failed to add skills." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  revalidatePath("/portfolio/edit");
  if (profile?.username) revalidatePath(`/u/${profile.username}`);

  return { ok: true, data: { added: toInsert.length, skipped } };
}
