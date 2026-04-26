"use server";

import { createClient } from "@/lib/supabase/server";

export interface SearchResult {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
  role: string;
}

export async function searchProfiles(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 2) return [];

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url, role")
    .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
    .limit(10);

  if (error) {
    console.error("Search error:", error);
    return [];
  }

  return (data || []).map((p) => ({
    id: p.id,
    username: p.username,
    fullName: p.full_name,
    avatarUrl: p.avatar_url,
    role: p.role,
  }));
}
