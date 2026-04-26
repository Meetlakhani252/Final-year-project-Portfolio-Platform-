import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Briefcase, Layers } from "lucide-react";
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

  const { data: certifications } = await supabase
    .from("certifications")
    .select("*")
    .eq("profile_id", user.id)
    .order("display_order");

  const { data: education } = await supabase
    .from("education")
    .select("*")
    .eq("profile_id", user.id)
    .order("display_order");

  const { data: blogPosts } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });

  const { data: photos } = await supabase
    .from("portfolio_photos")
    .select("*")
    .eq("profile_id", user.id)
    .order("display_order");

  const { data: socialLinks } = await supabase
    .from("social_links")
    .select("*")
    .eq("profile_id", user.id);

  return (
    <div className="mx-auto w-full max-w-6xl py-8 space-y-10">
      <div className="glass-card p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 transition-transform group-hover:scale-110">
          <Briefcase className="size-24 text-primary" />
        </div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
            <Layers className="size-6 text-primary" />
          </div>
          <div>
            <h1 className="font-mono text-3xl font-bold tracking-tight text-foreground">
              <span className="text-primary">Workspace:</span> Portfolio Editor
            </h1>
            <p className="mt-1 text-muted-foreground font-sans font-normal">
              Modify your digital identity sequences at /u/{profile.username}
            </p>
          </div>
        </div>
      </div>

      <Suspense fallback={<div className="h-96 flex items-center justify-center font-mono text-primary animate-pulse">Initializing Editor Protocol...</div>}>
        <PortfolioEditTabs
          profile={profile}
          projects={projects ?? []}
          skills={skills ?? []}
          certifications={certifications ?? []}
          education={education ?? []}
          blogPosts={blogPosts ?? []}
          photos={photos ?? []}
          socialLinks={socialLinks ?? []}
        />
      </Suspense>
    </div>
  );
}
