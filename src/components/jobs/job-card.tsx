import Link from "next/link";
import { MapPin, Clock, DollarSign, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { JobPosting } from "@/actions/jobs";

function formatSalary(min: number | null, max: number | null): string | null {
  if (!min && !max) return null;
  const fmt = (n: number) =>
    n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
}

const LOCATION_LABEL: Record<JobPosting["location_type"], string> = {
  onsite: "On-site",
  remote: "Remote",
  hybrid: "Hybrid",
};

export function JobCard({
  job,
  applied = false,
  href,
}: {
  job: JobPosting;
  applied?: boolean;
  href: string;
}) {
  const salary = formatSalary(job.salary_min, job.salary_max);
  const deadline = job.application_deadline
    ? new Date(job.application_deadline).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <Link href={href} className="block group">
      <Card className="h-full transition-shadow group-hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <p className="font-semibold text-base leading-tight group-hover:text-primary transition-colors line-clamp-2">
                {job.title}
              </p>
              <p className="text-sm text-muted-foreground">{job.company}</p>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <Badge variant={job.type === "internship" ? "secondary" : "default"}>
                {job.type === "internship" ? "Internship" : "Full-time"}
              </Badge>
              {applied && (
                <Badge
                  variant="outline"
                  className="text-xs border-emerald-500 text-emerald-600"
                >
                  Applied
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="size-3" />
              {LOCATION_LABEL[job.location_type]}
              {job.location && ` · ${job.location}`}
            </span>
            {salary && (
              <span className="flex items-center gap-1">
                <DollarSign className="size-3" />
                {salary}
              </span>
            )}
            {deadline && (
              <span className="flex items-center gap-1">
                <Clock className="size-3" />
                Deadline {deadline}
              </span>
            )}
            {job.application_count > 0 && (
              <span className="flex items-center gap-1">
                <Users className="size-3" />
                {job.application_count} applicant{job.application_count !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {job.required_skills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {job.required_skills.slice(0, 5).map((skill) => (
                <Badge key={skill} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {job.required_skills.length > 5 && (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  +{job.required_skills.length - 5} more
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
