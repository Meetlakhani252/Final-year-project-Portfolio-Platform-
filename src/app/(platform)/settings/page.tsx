import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getGitHubAuthUrl } from "@/lib/github";
import { GitHubConnectSection } from "@/components/github/github-connect-section";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch GitHub connection (if any)
  const { data: githubConnection } = await supabase
    .from("github_connections")
    .select("github_username, last_synced_at")
    .eq("profile_id", user.id)
    .single();

  // Fetch existing skills so the suggestion panel can exclude them
  const { data: skillsData } = await supabase
    .from("skills")
    .select("name")
    .eq("profile_id", user.id);

  const existingSkills = (skillsData ?? []).map((s) => s.name);

  // Build the GitHub OAuth URL server-side (includes client_id from env)
  const connectUrl = getGitHubAuthUrl(user.id);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account integrations and preferences.
        </p>
      </div>

      {/* GitHub Integration */}
      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold">GitHub Integration</h2>
          <p className="text-sm text-muted-foreground">
            Connect GitHub to import repositories and get skill suggestions.
          </p>
        </div>
        <GitHubConnectSection
          userId={user.id}
          connectUrl={connectUrl}
          connection={githubConnection ?? null}
          existingSkills={existingSkills}
        />
      </section>
    </div>
  );
}
