import { getUser } from "@/lib/get-user";
import { ORGANIZER_NAV } from "@/lib/nav-config";
import { TopNavbar } from "@/components/shared/top-navbar";
import { DesktopSidebar } from "@/components/shared/desktop-sidebar";

export default async function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  return (
    <div className="flex h-screen flex-col">
      <TopNavbar
        items={ORGANIZER_NAV}
        user={{
          fullName: user.fullName,
          email: user.email,
          avatarUrl: user.avatarUrl,
          username: user.username,
        }}
        showMessages={false}
      />
      <div className="flex flex-1 overflow-hidden">
        <DesktopSidebar items={ORGANIZER_NAV} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
