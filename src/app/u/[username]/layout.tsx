import { createClient } from "@/lib/supabase/server";
import { STUDENT_NAV, RECRUITER_NAV } from "@/lib/nav-config";
import { TopNavbar } from "@/components/shared/top-navbar";
import { DesktopSidebar } from "@/components/shared/desktop-sidebar";
import type { AppUser } from "@/lib/get-user";

async function getOptionalUser(): Promise<AppUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return {
    id: user.id,
    email: user.email ?? "",
    fullName: (user.user_metadata?.full_name as string) ?? "User",
    username: (user.user_metadata?.username as string) ?? null,
    avatarUrl: (user.user_metadata?.avatar_url as string) ?? null,
    role: (user.user_metadata?.role as AppUser["role"]) ?? "student",
  };
}

export default async function PublicProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
