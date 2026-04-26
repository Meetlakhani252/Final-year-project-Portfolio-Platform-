"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Users,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toggleJobActive, deleteJobPosting } from "@/actions/jobs";
import type { JobPosting } from "@/actions/jobs";

const TYPE_LABEL: Record<JobPosting["type"], string> = {
  job: "Full-time",
  internship: "Internship",
};

const LOCATION_LABEL: Record<JobPosting["location_type"], string> = {
  onsite: "On-site",
  remote: "Remote",
  hybrid: "Hybrid",
};

export function RecruiterJobsList({ initialJobs }: { initialJobs: JobPosting[] }) {
  const [jobs, setJobs] = useState(initialJobs);
  const [isPending, startTransition] = useTransition();

  function handleToggle(jobId: string) {
    startTransition(async () => {
      const result = await toggleJobActive(jobId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, is_active: result.is_active } : j))
      );
      toast.success(result.is_active ? "Posting activated." : "Posting deactivated.");
    });
  }

  function handleDelete(jobId: string) {
    if (!confirm("Delete this job posting? This cannot be undone.")) return;
    startTransition(async () => {
      const result = await deleteJobPosting(jobId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      toast.success("Posting deleted.");
    });
  }

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card py-20 text-center">
        <p className="font-medium text-foreground">No job postings yet</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          Create your first posting to start receiving applications from students.
        </p>
        <Button render={<Link href="/jobs/new" />} className="mt-4">
          Create posting
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {jobs.map((job) => (
        <div
          key={job.id}
          className="flex items-start justify-between gap-4 rounded-xl border bg-card p-4"
        >
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold truncate">{job.title}</p>
              <Badge variant={job.type === "internship" ? "secondary" : "default"}>
                {TYPE_LABEL[job.type]}
              </Badge>
              <Badge variant={job.is_active ? "outline" : "secondary"}>
                {job.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {job.company} · {LOCATION_LABEL[job.location_type]}
              {job.location && ` · ${job.location}`}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Users className="size-3" />
              {job.application_count} application{job.application_count !== 1 ? "s" : ""}
              {job.application_deadline && (
                <span className="ml-2">
                  · Deadline{" "}
                  {new Date(job.application_deadline).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              render={<Link href={`/jobs/${job.id}/applications`} />}
              variant="outline"
              size="sm"
            >
              <Users className="size-4 mr-1" />
              Applicants
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger
                className={buttonVariants({ variant: "ghost", size: "icon" })}
                disabled={isPending}
              >
                <MoreHorizontal className="size-4" />
                <span className="sr-only">Actions</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  render={<Link href={`/jobs/${job.id}/edit`} />}
                  className="gap-2"
                >
                  <Pencil className="size-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleToggle(job.id)}
                  className="gap-2"
                >
                  {job.is_active ? (
                    <>
                      <ToggleLeft className="size-4" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <ToggleRight className="size-4" />
                      Activate
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDelete(job.id)}
                  className="text-destructive gap-2"
                >
                  <Trash2 className="size-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  );
}
