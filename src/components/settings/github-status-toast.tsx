"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function GitHubStatusToast() {
  const searchParams = useSearchParams();
  const status = searchParams.get("github");

  const reason = searchParams.get("reason");

  useEffect(() => {
    if (status === "connected") {
      toast.success("GitHub connected successfully!");
    } else if (status === "error") {
      toast.error(`GitHub connection failed${reason ? `: ${reason}` : ""}. Please try again.`);
    }
  }, [status, reason]);

  return null;
}
