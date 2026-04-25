import { getUser } from "@/lib/get-user";
import { STUDENT_NAV, RECRUITER_NAV } from "@/lib/nav-config";
import { TopNavbar } from "@/components/shared/top-navbar";
import { DesktopSidebar } from "@/components/shared/desktop-sidebar";

export const metadata = {
  title: "Forums — Profolio",
};

export default async function ForumsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
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
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
