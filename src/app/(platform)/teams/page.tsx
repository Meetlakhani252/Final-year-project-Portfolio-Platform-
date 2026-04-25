import { Suspense } from "react";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { getUser } from "@/lib/get-user";
import { getTeamPosts, getUpcomingEventsForSelect, type TeamPostFilters } from "@/actions/teams";
import { TeamPostCard } from "@/components/teams/team-post-card";
import { TeamsFilter } from "@/components/teams/teams-filter";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Teams — Profolio",
};

export default async function TeamsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getUser();
  const params = await searchParams;

  const isStudent = user.role === "student";

  const skills = params.skill
    ? Array.isArray(params.skill)
      ? params.skill
      : [params.skill]
    : [];

  const filters: TeamPostFilters = {
    skills: skills.length > 0 ? skills : undefined,
    event_id: typeof params.event_id === "string" ? params.event_id : undefined,
    standalone_only: params.standalone === "1",
  };

  const [posts, events] = await Promise.all([
    getTeamPosts(filters),
    getUpcomingEventsForSelect(),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="rounded-2xl bg-linear-to-r from-indigo-600 to-purple-600 p-8 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Team Formation</h1>
            <p className="mt-1 text-sm text-white/80 font-sans font-normal">
              Find teammates for hackathons and projects, or post your own listing.
            </p>
          </div>
          {isStudent && (
            <Link
              href="/teams/create"
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors"
            >
              <PlusCircle className="size-4" />
              Post listing
            </Link>
          )}
        </div>
      </div>

      <Suspense fallback={null}>
        <TeamsFilter events={events} />
      </Suspense>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white py-16 text-center shadow-sm">
          <p className="text-muted-foreground text-sm">
            No open team listings found.
          </p>
          {isStudent && (
            <Button
              render={<Link href="/teams/create" />}
              variant="outline"
              size="sm"
              className="mt-4"
            >
              Create the first listing
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <TeamPostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
