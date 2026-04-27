import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Rss, Building2 } from "lucide-react";
import { getUser } from "@/lib/get-user";
import { getActiveJobPostings, getAppliedJobIds, type JobFilters } from "@/actions/jobs";
import { JobCard } from "@/components/jobs/job-card";
import { JobsFilter } from "@/components/jobs/jobs-filter";

export const metadata = { title: "Feed — Profolio" };

async function FeedContent({ filters }: { filters: JobFilters }) {
  const [jobs, appliedIds] = await Promise.all([
    getActiveJobPostings(filters),
    getAppliedJobIds(),
  ]);
  const appliedSet = new Set(appliedIds);

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-primary/20 bg-primary/5 py-16 text-center">
        <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Building2 className="size-6 text-primary/40" />
        </div>
        <p className="text-muted-foreground font-mono text-sm uppercase tracking-wider">
          No active job postings right now
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Connect with recruiters on their profiles to get notified when they post.
        </p>
      </div>
    );
  }

  return (
    <>
      <p className="text-sm text-muted-foreground">
        {jobs.length} open position{jobs.length !== 1 ? "s" : ""}
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            applied={appliedSet.has(job.id)}
            href={`/jobs/${job.id}`}
          />
        ))}
      </div>
    </>
  );
}

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [user, params] = await Promise.all([getUser(), searchParams]);

  if (user.role !== "student") redirect("/dashboard");

  const filters: JobFilters = {
    type:
      typeof params.type === "string" &&
      (params.type === "job" || params.type === "internship")
        ? params.type
        : undefined,
    location_type:
      typeof params.location_type === "string" &&
      ["onsite", "remote", "hybrid"].includes(params.location_type)
        ? (params.location_type as JobFilters["location_type"])
        : undefined,
    skill: typeof params.skill === "string" ? params.skill : undefined,
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="glass-card p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 transition-transform group-hover:scale-110">
          <Rss className="size-24 text-primary" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-3xl font-bold tracking-tight text-white">
              <span className="text-primary">Feed:</span> Job Postings
            </h1>
          </div>
          <p className="mt-2 text-muted-foreground font-sans font-normal max-w-lg">
            All active job opportunities and internships from recruiters on the platform. Connect with recruiters on their profiles to get notified of new posts.
          </p>
        </div>
      </div>

      <Suspense fallback={null}>
        <JobsFilter />
      </Suspense>

      <Suspense fallback={
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      }>
        <FeedContent filters={filters} />
      </Suspense>
    </div>
  );
}
