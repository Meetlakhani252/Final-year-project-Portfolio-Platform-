import Link from "next/link";
import { Suspense } from "react";
import { Building2, PlusCircle } from "lucide-react";
import { getUser } from "@/lib/get-user";
import {
  getMyJobPostings,
  getActiveJobPostings,
  getAppliedJobIds,
  type JobFilters,
} from "@/actions/jobs";
import { RecruiterJobsList } from "@/components/jobs/recruiter-jobs-list";
import { JobCard } from "@/components/jobs/job-card";
import { JobsFilter } from "@/components/jobs/jobs-filter";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Jobs — Profolio" };

async function RecruiterView() {
  const jobs = await getMyJobPostings();
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="glass-card p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 transition-transform group-hover:scale-110">
          <Building2 className="size-24 text-primary" />
        </div>
        <div className="flex items-start justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-mono text-3xl font-bold tracking-tight text-white">
                <span className="text-primary">Pipeline:</span> Job Postings
              </h1>
            </div>
            <p className="mt-2 text-muted-foreground font-sans font-normal max-w-lg">
              {jobs.length === 0
                ? "Post available positions to attract top-tier student talent to your organization."
                : `${jobs.length} active posting${jobs.length !== 1 ? "s" : ""} — manage recruitment below.`}
            </p>
          </div>
          <Link
            href="/jobs/new"
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-mono font-bold text-sm hover:opacity-90 transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)]"
          >
            <PlusCircle className="size-4" />
            New Deployment
          </Link>
        </div>
      </div>

      <RecruiterJobsList initialJobs={jobs} />
    </div>
  );
}

async function StudentView({
  filters,
}: {
  filters: JobFilters;
}) {
  const [jobs, appliedIds] = await Promise.all([
    getActiveJobPostings(filters),
    getAppliedJobIds(),
  ]);
  const appliedSet = new Set(appliedIds);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="glass-card p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 transition-transform group-hover:scale-110">
          <Building2 className="size-24 text-primary" />
        </div>
        <div className="flex items-start justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-mono text-3xl font-bold tracking-tight text-white">
                <span className="text-primary">Market:</span> Job Board
              </h1>
            </div>
            <p className="mt-2 text-muted-foreground font-sans font-normal max-w-lg">
              Explore open career opportunities and internships from top-tier organizations.
            </p>
          </div>
          <Button
            render={<Link href="/jobs/applications" />}
            variant="outline"
            className="shrink-0 border-primary/30 text-primary hover:bg-primary/10"
          >
            Track Applications
          </Button>
        </div>
      </div>

      <Suspense fallback={null}>
        <JobsFilter />
      </Suspense>

      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-primary/20 bg-primary/5 py-16 text-center">
          <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Building2 className="size-6 text-primary/40" />
          </div>
          <p className="text-muted-foreground font-mono text-sm uppercase tracking-wider">
            Zero active job sequences found
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Protocol: Check back later or adjust filters.
          </p>
        </div>
      ) : (
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
      )}
    </div>
  );
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [user, params] = await Promise.all([getUser(), searchParams]);

  if (user.role === "recruiter") return <RecruiterView />;

  const filters: JobFilters = {
    type:
      typeof params.type === "string" && (params.type === "job" || params.type === "internship")
        ? params.type
        : undefined,
    location_type:
      typeof params.location_type === "string" &&
      ["onsite", "remote", "hybrid"].includes(params.location_type)
        ? (params.location_type as JobFilters["location_type"])
        : undefined,
    skill: typeof params.skill === "string" ? params.skill : undefined,
  };

  return <StudentView filters={filters} />;
}
