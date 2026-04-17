import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  fetchUserRepos,
  fetchAggregatedLanguages,
  languagesToSkillSuggestions,
} from "@/lib/github";

/**
 * GET /api/github/languages
 *
 * Aggregates language bytes across the user's GitHub repos and returns
 * both the raw bytes map and the derived skill suggestions.
 */
export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: connection } = await supabase
    .from("github_connections")
    .select("access_token")
    .eq("profile_id", user.id)
    .single();

  if (!connection) {
    return NextResponse.json(
      { error: "GitHub not connected" },
      { status: 404 }
    );
  }

  try {
    const repos = await fetchUserRepos(connection.access_token);
    const languages = await fetchAggregatedLanguages(connection.access_token, repos);
    const suggestions = languagesToSkillSuggestions(languages);

    return NextResponse.json({ languages, suggestions });
  } catch (err) {
    console.error("Failed to fetch GitHub languages:", err);
    return NextResponse.json(
      { error: "Failed to fetch language data from GitHub" },
      { status: 502 }
    );
  }
}
