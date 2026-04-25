import { redirect } from "next/navigation";
import { getUser } from "@/lib/get-user";
import { JobForm } from "@/components/jobs/job-form";

export const metadata = { title: "New Job Posting — Profolio" };

export default async function NewJobPage() {
  const user = await getUser();
  if (user.role !== "recruiter") redirect("/jobs");

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create job posting</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Post a new job or internship for students to discover and apply.
        </p>
      </div>
      <JobForm />
    </div>
  );
}
