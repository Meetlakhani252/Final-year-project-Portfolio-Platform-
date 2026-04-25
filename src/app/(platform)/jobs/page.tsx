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

// ─── Recruiter view ───────────────────────────────────────────────────────────

async function RecruiterView() {
  const jobs = await getMyJobPostings();
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-2xl bg-linear-to-r from-teal-600 to-emerald-600 p-8 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <Building2 className="size-6" />
              <h1 className="text-2xl font-bold">Job Postings</h1>
            </div>
            <p className="mt-1 text-sm text-white/80 font-sans font-normal">
              {jobs.length === 0
                ? "Post jobs and internships to attract top student talent."
                : `${jobs.length} posting${jobs.length !== 1 ? "s" : ""} — manage them below.`}
            </p>
          </div>
          <Link
            href="/jobs/new"
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-white text-teal-700 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors"
          >
            <PlusCircle className="size-4" />
            New posting
          </Link>
        </div>
      </div>

      <RecruiterJobsList initialJobs={jobs} />
    </div>
  );
}

// ─── Student view ─────────────────────────────────────────────────────────────

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
      <div className="rounded-2xl bg-linear-to-r from-teal-600 to-emerald-600 p-8 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <Building2 className="size-6" />
              <h1 className="text-2xl font-bold">Job Board</h1>
            </div>
            <p className="mt-1 text-sm text-white/80 font-sans font-normal">
              Browse open jobs and internships posted by recruiters.
            </p>
          </div>
          <Button
            render={<Link href="/jobs/applications" />}
            variant="outline"
            className="shrink-0 border-white/40 text-white bg-white/10 hover:bg-white/20 hover:text-white"
          >
            My applications
          </Button>
        </div>
      </div>

      <Suspense fallback={null}>
        <JobsFilter />
      </Suspense>

      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card py-20 text-center">
          <Building2 className="size-10 text-muted-foreground/30 mb-4" />
          <p className="font-medium text-foreground">No open positions found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Check back later or try different filters.
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

// ─── Page ─────────────────────────────────────────────────────────────────────

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
