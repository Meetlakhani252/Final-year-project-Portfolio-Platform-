import { Badge } from "@/components/ui/badge";
import type { JobApplication } from "@/actions/jobs";

const STATUS_CONFIG: Record<
  JobApplication["status"],
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  pending: { label: "Pending", variant: "secondary" },
  reviewing: { label: "Reviewing", variant: "default" },
  accepted: { label: "Accepted", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" },
};

export function ApplicationStatusBadge({
  status,
}: {
  status: JobApplication["status"];
}) {
  const { label, variant } = STATUS_CONFIG[status];
  return (
    <Badge
      variant={variant}
      className={
        status === "accepted"
          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900 dark:text-emerald-200"
          : status === "reviewing"
          ? "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-200"
          : undefined
      }
    >
      {label}
    </Badge>
  );
}
