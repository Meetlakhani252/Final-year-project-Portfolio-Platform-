import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { exchangeCodeForToken, fetchGitHubUser } from "@/lib/github";
import { APP_URL } from "@/lib/constants";

/**
 * GitHub OAuth callback.
 *
 * Flow:
 *  1. GitHub redirects here with ?code=...&state=<userId>
 *  2. Exchange code for access token
 *  3. Fetch the GitHub username for the token
 *  4. Upsert into github_connections
 *  5. Redirect back to /settings?github=connected (or ?github=error)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // userId passed as state

  const errorRedirect = `${APP_URL}/settings?github=error`;

  // ── Validate params ──────────────────────────────────────────────────────
  if (!code || !state) {
    return NextResponse.redirect(errorRedirect);
  }

  // ── Validate session — user must be logged in ────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${APP_URL}/login`);
  }

  // State must match the logged-in user's id to prevent cross-account linking
  if (user.id !== state) {
    return NextResponse.redirect(errorRedirect);
  }

  try {
    // ── Exchange code for access token ───────────────────────────────────
    const accessToken = await exchangeCodeForToken(code);

    // ── Fetch GitHub username ────────────────────────────────────────────
    const githubUser = await fetchGitHubUser(accessToken);

    // ── Upsert connection ────────────────────────────────────────────────
    const { error } = await supabase
      .from("github_connections")
      .upsert(
        {
          profile_id: user.id,
          github_username: githubUser.login,
          access_token: accessToken,
          last_synced_at: new Date().toISOString(),
        },
        { onConflict: "profile_id" }
      );

    if (error) {
      console.error("Failed to save GitHub connection:", error);
      return NextResponse.redirect(errorRedirect);
    }

    return NextResponse.redirect(`${APP_URL}/settings?github=connected`);
  } catch (err) {
    console.error("GitHub OAuth error:", err);
    return NextResponse.redirect(errorRedirect);
  }
}
