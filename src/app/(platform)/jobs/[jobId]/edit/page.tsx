import { redirect, notFound } from "next/navigation";
import { getUser } from "@/lib/get-user";
import { getMyJobPosting } from "@/actions/jobs";
import { JobForm } from "@/components/jobs/job-form";

export const metadata = { title: "Edit Job Posting — Profolio" };

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const [user, { jobId }] = await Promise.all([getUser(), params]);
  if (user.role !== "recruiter") redirect("/jobs");

  const job = await getMyJobPosting(jobId);
  if (!job) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit job posting</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update the details for <span className="font-medium">{job.title}</span>.
        </p>
      </div>
      <JobForm initialData={job} />
    </div>
  );
}
