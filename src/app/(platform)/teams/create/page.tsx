import { redirect } from "next/navigation";
import { getUser } from "@/lib/get-user";
import { getUpcomingEventsForSelect } from "@/actions/teams";
import { TeamPostForm } from "@/components/teams/team-post-form";

export const metadata = {
  title: "Post Team Listing — Profolio",
};

export default async function CreateTeamPostPage() {
  const user = await getUser();

  if (user.role !== "student") {
    redirect("/dashboard");
  }

  const events = await getUpcomingEventsForSelect();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Post Team Listing</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Let others know you&apos;re looking for teammates.
        </p>
      </div>

      <TeamPostForm events={events} />
    </div>
  );
}
