import { redirect } from "next/navigation";
import { ClipboardList } from "lucide-react";
import { getUser } from "@/lib/get-user";
import { getMyApplications } from "@/actions/jobs";
import { MyApplicationsList } from "@/components/jobs/my-applications-list";

export const metadata = { title: "My Applications — Profolio" };

export default async function MyApplicationsPage() {
  const user = await getUser();
  if (user.role !== "student") redirect("/jobs");

  const applications = await getMyApplications();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-2xl bg-linear-to-r from-teal-600 to-emerald-600 p-8 text-white">
        <div className="flex items-center gap-3">
          <ClipboardList className="size-6" />
          <h1 className="text-2xl font-bold">My Applications</h1>
        </div>
        <p className="mt-1 text-sm text-white/80 font-sans font-normal">
          {applications.length === 0
            ? "You haven't applied to any positions yet."
            : `${applications.length} application${applications.length !== 1 ? "s" : ""} — track your status below.`}
        </p>
      </div>

      <MyApplicationsList applications={applications} />
    </div>
  );
}
