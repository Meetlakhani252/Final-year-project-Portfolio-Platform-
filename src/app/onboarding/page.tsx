import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingWizard } from "./onboarding-wizard";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Onboarding is student-only; other roles go straight to their dashboard
  const userRole = (user.user_metadata?.role as string) ?? "student";
  if (userRole !== "student") {
    redirect("/dashboard");
  }

  // Skip if already completed
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed, full_name, username")
    .eq("id", user.id)
    .single();

  if (profile?.onboarding_completed) {
    redirect("/dashboard");
  }

  const initialName =
    (user.user_metadata?.full_name as string) ?? profile?.full_name ?? "";
  const initialUsername = profile?.username ?? "";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-lg">
        <OnboardingWizard initialName={initialName} initialUsername={initialUsername} />
      </div>
    </div>
  );
}
