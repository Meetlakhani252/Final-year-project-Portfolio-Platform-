import { getUser } from "@/lib/get-user";
import { STUDENT_NAV, RECRUITER_NAV } from "@/lib/nav-config";
import { TopNavbar } from "@/components/shared/top-navbar";

export const metadata = {
  title: "Messages — StudentPortfolio",
};

export default async function MessagesLayout({
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
      <div className="flex flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
