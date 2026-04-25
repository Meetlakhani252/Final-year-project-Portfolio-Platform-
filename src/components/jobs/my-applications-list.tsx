import Link from "next/link";
import { MapPin, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ApplicationStatusBadge } from "@/components/jobs/application-status-badge";
import type { JobApplication } from "@/actions/jobs";

const TYPE_LABEL: Record<string, string> = {
  job: "Full-time",
  internship: "Internship",
};

const LOCATION_LABEL: Record<string, string> = {
  onsite: "On-site",
  remote: "Remote",
  hybrid: "Hybrid",
};

export function MyApplicationsList({
  applications,
}: {
  applications: JobApplication[];
}) {
  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card py-20 text-center">
        <Building2 className="size-10 text-muted-foreground/30 mb-4" />
        <p className="font-medium text-foreground">No applications yet</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          Browse the job board and apply to positions that match your skills.
        </p>
        <Link
          href="/jobs"
          className="mt-4 text-sm font-medium text-primary hover:underline"
        >
          Browse jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {applications.map((app) => {
        const job = app.job;
        return (
          <div key={app.id} className="rounded-xl border bg-card p-4 space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 space-y-0.5">
                <p className="font-semibold truncate">{job?.title ?? "—"}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Building2 className="size-3" />
                  {job?.company}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <ApplicationStatusBadge status={app.status} />
                {job?.type && (
                  <Badge variant="outline" className="text-xs">
                    {TYPE_LABEL[job.type]}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {job?.location_type && (
                <span className="flex items-center gap-1">
                  <MapPin className="size-3" />
                  {LOCATION_LABEL[job.location_type]}
                  {job.location && ` · ${job.location}`}
                </span>
              )}
              <span>
                Applied{" "}
                {new Date(app.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            {app.cover_letter && (
              <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                <p className="text-xs font-medium text-foreground mb-1">Your cover letter</p>
                <p className="line-clamp-3 whitespace-pre-wrap">{app.cover_letter}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
