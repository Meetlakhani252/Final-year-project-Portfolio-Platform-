"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ExternalLink } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApplicationStatusBadge } from "@/components/jobs/application-status-badge";
import { updateApplicationStatus } from "@/actions/jobs";
import type { JobApplication } from "@/actions/jobs";

export function RecruiterApplicationsList({
  initialApplications,
}: {
  initialApplications: JobApplication[];
}) {
  const [applications, setApplications] = useState(initialApplications);
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(
    applicationId: string,
    status: JobApplication["status"]
  ) {
    startTransition(async () => {
      const result = await updateApplicationStatus(applicationId, status);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setApplications((prev) =>
        prev.map((a) => (a.id === applicationId ? { ...a, status } : a))
      );
      toast.success("Status updated.");
    });
  }

  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card py-20 text-center">
        <p className="font-medium text-foreground">No applications yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Applications will appear here once students start applying.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((app) => {
        const student = app.student;
        const initials = student?.full_name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

        return (
          <div key={app.id} className="rounded-xl border bg-card p-4 space-y-3">
            {/* Student info row */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="size-10 shrink-0">
                  <AvatarImage src={student?.avatar_url ?? undefined} />
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-semibold truncate">{student?.full_name}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {student?.program && `${student.program}`}
                    {student?.university && ` · ${student.university}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <ApplicationStatusBadge status={app.status} />
                {student?.username && (
                  <Button
                    render={<Link href={`/u/${student.username}`} target="_blank" />}
                    variant="ghost"
                    size="icon"
                    className="size-8"
                  >
                    <ExternalLink className="size-3.5" />
                    <span className="sr-only">View portfolio</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Cover letter */}
            {app.cover_letter && (
              <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                <p className="text-xs font-medium text-foreground mb-1">Cover letter</p>
                <p className="whitespace-pre-wrap line-clamp-4">{app.cover_letter}</p>
              </div>
            )}

            {/* Status + date row */}
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground">
                Applied{" "}
                {new Date(app.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Update status:</span>
                <Select
                  value={app.status}
                  onValueChange={(v) =>
                    handleStatusChange(app.id, v as JobApplication["status"])
                  }
                  disabled={isPending}
                >
                  <SelectTrigger className="h-8 w-[130px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reviewing">Reviewing</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
