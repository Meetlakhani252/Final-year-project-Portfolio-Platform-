import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PortfolioEditTabs } from "@/components/portfolio/portfolio-edit-tabs";

export default async function PortfolioEditPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/onboarding");
  }

  const { data: projects } = await supabase
    .from("projects")
    .select("*, screenshots:project_screenshots(*)")
    .eq("profile_id", user.id)
    .order("display_order");

  const { data: skills } = await supabase
    .from("skills")
    .select("*")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: true });

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Edit Portfolio</h1>
        <p className="text-sm text-muted-foreground">
          Update the sections that appear on your public portfolio at /u/
          {profile.username}
        </p>
      </header>
      <PortfolioEditTabs
        profile={profile}
        projects={projects ?? []}
        skills={skills ?? []}
      />
    </div>
  );
}
