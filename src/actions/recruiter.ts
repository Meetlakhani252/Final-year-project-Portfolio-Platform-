"use server";

import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/get-user";
import { PAGE_SIZE_DISCOVER } from "@/lib/constants";

const DISCOVER_PAGE_SIZE = PAGE_SIZE_DISCOVER;

export type DiscoverFilters = {
  skills?: string[];
  graduation_year?: number;
  university?: string;
  min_gpa?: number;
  available_for?: string;
  page?: number;
};

export type StudentResult = {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  university: string | null;
  program: string | null;
  graduation_year: number | null;
  gpa: number | null;
  gpa_public: boolean;
  available_for: string[];
  skills: string[];
};

// ─── discoverStudents ─────────────────────────────────────────────────────────

export async function discoverStudents(filters: DiscoverFilters): Promise<{
  students: StudentResult[];
  total: number;
}> {
  const hasFilters = Boolean(
    (filters.skills && filters.skills.length > 0) ||
      filters.graduation_year ||
      filters.university ||
      filters.min_gpa !== undefined ||
      filters.available_for
  );

  if (!hasFilters) return { students: [], total: 0 };

  const supabase = await createClient();
  const page = filters.page ?? 0;
  const from = page * DISCOVER_PAGE_SIZE;
  const to = from + DISCOVER_PAGE_SIZE - 1;

  // Resolve profile IDs matching the skill filter (case-insensitive)
  let profileIdConstraint: string[] | null = null;
  if (filters.skills && filters.skills.length > 0) {
    const orClause = filters.skills
      .map((s) => `name.ilike.${s}`)
      .join(",");

    const { data: skillRows } = await supabase
      .from("skills")
      .select("profile_id")
      .or(orClause);

    if (!skillRows || skillRows.length === 0) {
      return { students: [], total: 0 };
    }
    profileIdConstraint = [...new Set(skillRows.map((r) => r.profile_id))];
  }

  let query = supabase
    .from("profiles")
    .select(
      "id, username, full_name, avatar_url, university, program, graduation_year, gpa, gpa_public, available_for",
      { count: "exact" }
    )
    .eq("role", "student")
    .eq("onboarding_completed", true);

  if (profileIdConstraint) {
    query = query.in("id", profileIdConstraint);
  }

  if (filters.graduation_year) {
    query = query.eq("graduation_year", filters.graduation_year);
  }

  if (filters.university) {
    query = query.ilike("university", `%${filters.university}%`);
  }

  if (filters.min_gpa !== undefined) {
    query = query.eq("gpa_public", true).gte("gpa", filters.min_gpa);
  }

  if (filters.available_for) {
    query = query.contains("available_for", [filters.available_for]);
  }

  const { data: profiles, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error || !profiles) return { students: [], total: 0 };

  if (profiles.length === 0) return { students: [], total: count ?? 0 };

  // Fetch skills for the returned profiles
  const profileIds = profiles.map((p) => p.id);
  const { data: skillsData } = await supabase
    .from("skills")
    .select("profile_id, name")
    .in("profile_id", profileIds);

  const skillsByProfile = new Map<string, string[]>();
  for (const s of skillsData ?? []) {
    if (!skillsByProfile.has(s.profile_id)) {
      skillsByProfile.set(s.profile_id, []);
    }
    skillsByProfile.get(s.profile_id)!.push(s.name);
  }

  const students: StudentResult[] = profiles.map((p) => ({
    id: p.id,
    username: p.username ?? "",
    full_name: p.full_name,
    avatar_url: p.avatar_url,
    university: p.university,
    program: p.program,
    graduation_year: p.graduation_year,
    gpa: p.gpa,
    gpa_public: p.gpa_public,
    available_for: p.available_for ?? [],
    skills: skillsByProfile.get(p.id) ?? [],
  }));

  return { students, total: count ?? 0 };
}

// ─── getBookmarks ─────────────────────────────────────────────────────────────

export type BookmarkResult = {
  bookmarkId: string;
  notes: string | null;
  createdAt: string;
  student: StudentResult;
};

export async function getBookmarks(): Promise<BookmarkResult[]> {
  const user = await getUser();
  if (user.role !== "recruiter") return [];

  const supabase = await createClient();

  const { data: bookmarks } = await supabase
    .from("recruiter_bookmarks")
    .select("id, student_id, notes, created_at")
    .eq("recruiter_id", user.id)
    .order("created_at", { ascending: false });

  if (!bookmarks || bookmarks.length === 0) return [];

  const studentIds = bookmarks.map((b) => b.student_id);

  const [{ data: profiles }, { data: skillsData }] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id, username, full_name, avatar_url, university, program, graduation_year, gpa, gpa_public, available_for"
      )
      .in("id", studentIds),
    supabase
      .from("skills")
      .select("profile_id, name")
      .in("profile_id", studentIds),
  ]);

  if (!profiles) return [];

  const skillsByProfile = new Map<string, string[]>();
  for (const s of skillsData ?? []) {
    if (!skillsByProfile.has(s.profile_id)) skillsByProfile.set(s.profile_id, []);
    skillsByProfile.get(s.profile_id)!.push(s.name);
  }

  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  return bookmarks
    .filter((b) => profileMap.has(b.student_id))
    .map((b) => {
      const p = profileMap.get(b.student_id)!;
      return {
        bookmarkId: b.id,
        notes: b.notes,
        createdAt: b.created_at,
        student: {
          id: p.id,
          username: p.username ?? "",
          full_name: p.full_name,
          avatar_url: p.avatar_url,
          university: p.university,
          program: p.program,
          graduation_year: p.graduation_year,
          gpa: p.gpa,
          gpa_public: p.gpa_public,
          available_for: p.available_for ?? [],
          skills: skillsByProfile.get(p.id) ?? [],
        },
      };
    });
}

// ─── updateBookmarkNotes ──────────────────────────────────────────────────────

export async function updateBookmarkNotes(
  bookmarkId: string,
  notes: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await getUser();
  if (user.role !== "recruiter") return { ok: false, error: "Unauthorized." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("recruiter_bookmarks")
    .update({ notes: notes.trim() || null })
    .eq("id", bookmarkId)
    .eq("recruiter_id", user.id);

  if (error) return { ok: false, error: "Failed to save notes." };
  return { ok: true };
}

// ─── toggleBookmark ───────────────────────────────────────────────────────────

export async function toggleBookmark(
  studentId: string
): Promise<{ ok: true; bookmarked: boolean } | { ok: false; error: string }> {
  const user = await getUser();
  if (user.role !== "recruiter") {
    return { ok: false, error: "Only recruiters can bookmark students." };
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("recruiter_bookmarks")
    .select("id")
    .eq("recruiter_id", user.id)
    .eq("student_id", studentId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("recruiter_bookmarks")
      .delete()
      .eq("id", existing.id);
    return { ok: true, bookmarked: false };
  }

  const { error } = await supabase
    .from("recruiter_bookmarks")
    .insert({ recruiter_id: user.id, student_id: studentId });

  if (error) return { ok: false, error: "Failed to bookmark student." };
  return { ok: true, bookmarked: true };
}

// ─── getBookmarkedStudentIds ──────────────────────────────────────────────────

export async function getBookmarkedStudentIds(): Promise<string[]> {
  const user = await getUser();
  if (user.role !== "recruiter") return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("recruiter_bookmarks")
    .select("student_id")
    .eq("recruiter_id", user.id);

  return (data ?? []).map((r) => r.student_id);
}
