import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export interface AppUser {
  id: string;
  email: string;
  fullName: string;
  username: string | null;
  avatarUrl: string | null;
  role: "student" | "recruiter" | "organizer";
}

export async function getUser(): Promise<AppUser> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return {
    id: user.id,
    email: user.email ?? "",
    fullName: (user.user_metadata?.full_name as string) ?? "User",
    username: (user.user_metadata?.username as string) ?? null,
    avatarUrl: (user.user_metadata?.avatar_url as string) ?? null,
    role: (user.user_metadata?.role as AppUser["role"]) ?? "student",
  };
}
