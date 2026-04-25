"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  DollarSign,
  Clock,
  Users,
  Building2,
  ChevronLeft,
  Pencil,
} from "lucide-react";
import { ApplyDialog } from "@/components/jobs/apply-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { JobPosting } from "@/actions/jobs";

const LOCATION_LABEL: Record<string, string> = {
  onsite: "On-site",
  remote: "Remote",
  hybrid: "Hybrid",
};

export function JobDetailClient({
  job,
  isOwner,
  isStudent,
  alreadyApplied,
  salary,
  deadline,
}: {
  job: JobPosting;
  isOwner: boolean;
  isStudent: boolean;
  alreadyApplied: boolean;
  salary: string | null;
  deadline: string | null;
}) {
  const [applyOpen, setApplyOpen] = useState(false);
  const [applied, setApplied] = useState(alreadyApplied);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Back */}
      <Button
        render={<Link href="/jobs" />}
        variant="ghost"
        size="sm"
        className="-ml-2 text-muted-foreground"
      >
        <ChevronLeft className="size-4 mr-1" />
        Back to jobs
      </Button>

      {/* Header card */}
      <div className="rounded-2xl border bg-card p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">{job.title}</h1>
            <p className="text-muted-foreground flex items-center gap-1.5">
              <Building2 className="size-4" />
              {job.company}
              {job.recruiter && (
                <span className="text-xs">
                  {" "}· posted by{" "}
                  <Link
                    href={`/u/${job.recruiter.username}`}
                    className="hover:underline"
                  >
                    {job.recruiter.full_name}
                  </Link>
                </span>
              )}
            </p>
          </div>
          <Badge variant={job.type === "internship" ? "secondary" : "default"}>
            {job.type === "internship" ? "Internship" : "Full-time"}
          </Badge>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <MapPin className="size-4" />
            {LOCATION_LABEL[job.location_type]}
            {job.location && ` · ${job.location}`}
          </span>
          {salary && (
            <span className="flex items-center gap-1.5">
              <DollarSign className="size-4" />
              {salary}
            </span>
          )}
          {deadline && (
            <span className="flex items-center gap-1.5">
              <Clock className="size-4" />
              Apply by {deadline}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Users className="size-4" />
            {job.application_count} applicant{job.application_count !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-1">
          {isStudent && (
            <>
              {applied ? (
                <Badge
                  variant="outline"
                  className="border-emerald-500 text-emerald-600 px-3 py-1.5 text-sm"
                >
                  Application submitted
                </Badge>
              ) : (
                <Button onClick={() => setApplyOpen(true)} className="min-h-11">
                  Apply now
                </Button>
              )}
              <Button render={<Link href="/jobs/applications" />} variant="outline">
                My applications
              </Button>
            </>
          )}

          {isOwner && (
            <>
              <Button
                render={<Link href={`/jobs/${job.id}/edit`} />}
                variant="outline"
              >
                <Pencil className="size-4 mr-2" />
                Edit posting
              </Button>
              <Button render={<Link href={`/jobs/${job.id}/applications`} />}>
                <Users className="size-4 mr-2" />
                View applicants
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="rounded-2xl border bg-card p-6 space-y-4">
        <h2 className="font-semibold text-lg">About this role</h2>
        <Separator />
        <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
          {job.description}
        </p>
      </div>

      {/* Skills */}
      {job.required_skills.length > 0 && (
        <div className="rounded-2xl border bg-card p-6 space-y-4">
          <h2 className="font-semibold text-lg">Required skills</h2>
          <Separator />
          <div className="flex flex-wrap gap-2">
            {job.required_skills.map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Apply dialog */}
      {isStudent && (
        <ApplyDialog
          jobId={job.id}
          jobTitle={job.title}
          company={job.company}
          open={applyOpen}
          onOpenChange={setApplyOpen}
          onSuccess={() => setApplied(true)}
        />
      )}
    </div>
  );
}
