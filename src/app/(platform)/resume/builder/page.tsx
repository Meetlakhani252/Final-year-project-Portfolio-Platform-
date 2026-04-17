import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { mapPortfolioToResume } from "@/lib/pdf";
import type { ResumeData } from "@/lib/pdf";
import { ResumeBuilder } from "./_components/resume-builder";

export default async function ResumeBuilderPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Load all portfolio data in parallel
  const [
    { data: profile },
    { data: projects },
    { data: skills },
    { data: certifications },
    { data: education },
    { data: socialLinks },
    { data: savedResume },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("projects").select("*").eq("profile_id", user.id).order("display_order"),
    supabase.from("skills").select("*").eq("profile_id", user.id),
    supabase.from("certifications").select("*").eq("profile_id", user.id).order("display_order"),
    supabase.from("education").select("*").eq("profile_id", user.id).order("display_order"),
    supabase.from("social_links").select("*").eq("profile_id", user.id),
    supabase.from("resumes").select("resume_data").eq("profile_id", user.id).maybeSingle(),
  ]);

  if (!profile) redirect("/onboarding");

  // Use saved resume if available, otherwise derive from portfolio
  let initialData: ResumeData;
  if (savedResume?.resume_data) {
    initialData = savedResume.resume_data as unknown as ResumeData;
  } else {
    initialData = mapPortfolioToResume({
      profile,
      projects: projects ?? [],
      skills: skills ?? [],
      certifications: certifications ?? [],
      education: education ?? [],
      socialLinks: socialLinks ?? [],
    });
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <ResumeBuilder initialData={initialData} />
    </div>
  );
}
