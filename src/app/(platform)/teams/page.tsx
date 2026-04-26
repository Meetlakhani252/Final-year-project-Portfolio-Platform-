import { Suspense } from "react";
import Link from "next/link";
import { PlusCircle, Users } from "lucide-react";
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
      <div className="glass-card p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 transition-transform group-hover:scale-110">
          <Users className="size-24 text-primary" />
        </div>
        <div className="flex items-start justify-between gap-4 relative z-10">
          <div>
            <h1 className="font-mono text-3xl font-bold tracking-tight text-white">
              <span className="text-primary">Registry:</span> Team Formation
            </h1>
            <p className="mt-2 text-muted-foreground font-sans font-normal max-w-lg">
              Find collaborators for your next big project or post your own listing to recruit teammates.
            </p>
          </div>
          {isStudent && (
            <Link
              href="/teams/create"
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-mono font-bold text-sm hover:opacity-90 transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)]"
            >
              <PlusCircle className="size-4" />
              Post Listing
            </Link>
          )}
        </div>
      </div>

      <Suspense fallback={null}>
        <TeamsFilter events={events} />
      </Suspense>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-primary/20 bg-primary/5 py-16 text-center">
          <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Users className="size-6 text-primary/40" />
          </div>
          <p className="text-muted-foreground font-mono text-sm uppercase tracking-wider">
            No open team listings found in registry
          </p>
          {isStudent && (
            <Button
              render={<Link href="/teams/create" />}
              variant="outline"
              size="sm"
              className="mt-6 border-primary/30 text-primary hover:bg-primary/10"
            >
              Create first listing
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
