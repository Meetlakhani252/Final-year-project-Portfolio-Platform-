import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchUserRepos } from "@/lib/github";

/**
 * GET /api/github/repos
 *
 * Returns the authenticated user's GitHub repositories.
 * Proxied server-side so the access token is never exposed to the client.
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
    .select("access_token, github_username")
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
    return NextResponse.json({ repos, github_username: connection.github_username });
  } catch (err) {
    console.error("Failed to fetch GitHub repos:", err);
    return NextResponse.json(
      { error: "Failed to fetch repositories from GitHub" },
      { status: 502 }
    );
  }
}
