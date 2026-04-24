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
  const user = await getOptionalUser();

  if (!user) {
    return <>{children}</>;
  }

  const nav = user.role === "recruiter" ? RECRUITER_NAV : STUDENT_NAV;

  return (
    <div className="flex h-screen flex-col">
      <TopNavbar
        items={nav}
        user={{
          fullName: user.fullName,
          email: user.email,
          avatarUrl: user.avatarUrl,
          username: user.username,
        }}
      />
      <div className="flex flex-1 overflow-hidden">
        <DesktopSidebar items={nav} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
