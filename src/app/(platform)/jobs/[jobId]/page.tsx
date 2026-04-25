import { notFound } from "next/navigation";
import { getUser } from "@/lib/get-user";
import { getJobPostingDetail, getAppliedJobIds } from "@/actions/jobs";
import { JobDetailClient } from "./_components/job-detail-client";

export const metadata = { title: "Job Detail — Profolio" };

function formatSalary(min: number | null, max: number | null): string | null {
  if (!min && !max) return null;
  const fmt = (n: number) =>
    n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`;
  if (min && max) return `${fmt(min)} – ${fmt(max)} / year`;
  if (min) return `From ${fmt(min)} / year`;
  return `Up to ${fmt(max!)} / year`;
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;

  const [user, job, appliedIds] = await Promise.all([
    getUser(),
    getJobPostingDetail(jobId),
    getAppliedJobIds(),
  ]);

  if (!job) notFound();

  const isOwner = user.role === "recruiter" && user.id === job.recruiter_id;
  const isStudent = user.role === "student";

  return (
    <JobDetailClient
      job={job}
      isOwner={isOwner}
      isStudent={isStudent}
      alreadyApplied={appliedIds.includes(jobId)}
      salary={formatSalary(job.salary_min, job.salary_max)}
      deadline={
        job.application_deadline
          ? new Date(job.application_deadline).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })
          : null
      }
    />
  );
}
