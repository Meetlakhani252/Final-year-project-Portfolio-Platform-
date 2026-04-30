"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function GitHubStatusToast() {
  const searchParams = useSearchParams();
  const status = searchParams.get("github");

  useEffect(() => {
    if (status === "connected") {
      toast.success("GitHub connected successfully!");
    } else if (status === "error") {
      toast.error("Failed to connect GitHub. Please try again.");
    }
  }, [status]);

  return null;
}
