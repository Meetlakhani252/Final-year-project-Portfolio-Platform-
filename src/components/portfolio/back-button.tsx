"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BackButton() {
  const router = useRouter();
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => router.back()}
      className="-ml-2 gap-1.5 text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="size-4" />
      Back
    </Button>
  );
}