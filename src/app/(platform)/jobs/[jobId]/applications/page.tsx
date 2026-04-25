import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getUser } from "@/lib/get-user";
import { getMyJobPosting, getJobApplications } from "@/actions/jobs";
import { RecruiterApplicationsList } from "@/components/jobs/recruiter-applications-list";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Applications — Profolio" };

export default async function JobApplicationsPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const [user, { jobId }] = await Promise.all([getUser(), params]);
  if (user.role !== "recruiter") redirect("/jobs");

  const [job, applications] = await Promise.all([
    getMyJobPosting(jobId),
    getJobApplications(jobId),
  ]);

  if (!job) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Back + header */}
      <div className="space-y-1">
        <Button
          render={<Link href="/jobs" />}
          variant="ghost"
          size="sm"
          className="-ml-2 text-muted-foreground"
        >
          <ChevronLeft className="size-4 mr-1" />
          Back to postings
        </Button>
        <h1 className="text-2xl font-bold">{job.title}</h1>
        <p className="text-sm text-muted-foreground">
          {job.company} ·{" "}
          {applications.length} application{applications.length !== 1 ? "s" : ""}
        </p>
      </div>

      <RecruiterApplicationsList initialApplications={applications} />
    </div>
  );
}
