import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database";

export type SnapshotTriggerType =
  | "monthly"
  | "project_added"
  | "certification_added"
  | "manual";

export interface SnapshotData {
  profile: {
    full_name: string;
    bio: string | null;
    university: string | null;
    program: string | null;
  };
  projects: Array<{ title: string; tech_stack: string[] }>;
  skills: string[];
  certifications: Array<{ name: string; issuer: string }>;
  education: Array<{ institution: string; degree: string }>;
  blog_post_count: number;
  snapshot_date: string;
}

/**
 * Collects the current portfolio state and inserts it into portfolio_snapshots.
 * Pass the caller's supabase client — use the server client from Server Actions,
 * or createAdminClient() from the cron endpoint (bypasses RLS for bulk inserts).
 */
export async function createPortfolioSnapshot(
  supabase: SupabaseClient<Database>,
  profileId: string,
  triggerType: SnapshotTriggerType,
  triggerDescription: string
): Promise<void> {
  const [
    { data: profile },
    { data: projects },
    { data: skills },
    { data: certifications },
    { data: education },
    { count: blogPostCount },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, bio, university, program")
      .eq("id", profileId)
      .single(),
    supabase
      .from("projects")
      .select("title, tech_stack")
      .eq("profile_id", profileId),
    supabase.from("skills").select("name").eq("profile_id", profileId),
    supabase
      .from("certifications")
      .select("name, issuer")
      .eq("profile_id", profileId),
    supabase
      .from("education")
      .select("institution, degree")
      .eq("profile_id", profileId),
    supabase
      .from("blog_posts")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profileId)
      .eq("status", "published"),
  ]);

  if (!profile) return;

  const snapshotData: SnapshotData = {
    profile: {
      full_name: profile.full_name,
      bio: profile.bio ?? null,
      university: profile.university ?? null,
      program: profile.program ?? null,
    },
    projects: (projects ?? []).map((p) => ({
      title: p.title,
      tech_stack: p.tech_stack,
    })),
    skills: (skills ?? []).map((s) => s.name),
    certifications: (certifications ?? []).map((c) => ({
      name: c.name,
      issuer: c.issuer,
    })),
    education: (education ?? []).map((e) => ({
      institution: e.institution,
      degree: e.degree,
    })),
    blog_post_count: blogPostCount ?? 0,
    snapshot_date: new Date().toISOString(),
  };

  await supabase.from("portfolio_snapshots").insert({
    profile_id: profileId,
    snapshot_data: snapshotData as unknown as Json,
    trigger_type: triggerType,
    trigger_description: triggerDescription,
  });
}
