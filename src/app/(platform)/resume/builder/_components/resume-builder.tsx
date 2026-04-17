"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Save, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResumeForm } from "./resume-form";
import { ResumePreview } from "./resume-preview";
import { DownloadPDFButton } from "@/components/resume/download-pdf-button";
import { saveResume } from "@/actions/resume";
import type { ResumeData } from "@/lib/pdf";

export function ResumeBuilder({
  initialData,
}: {
  initialData: ResumeData;
}) {
  const [resumeData, setResumeData] = useState<ResumeData>(initialData);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      const result = await saveResume(resumeData);
      if (result.ok) {
        toast.success("Resume saved");
      } else {
        toast.error(result.error ?? "Failed to save");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Resume Builder</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Auto-filled from your portfolio. Edit any field, then save or download.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" render={<Link href="/resume/preview" />}>
            <Eye className="size-4" />
            Full preview
          </Button>
          <DownloadPDFButton data={resumeData} variant="outline" />
          <Button onClick={handleSave} disabled={isPending}>
            <Save className="size-4" />
            {isPending ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>

      {/* Split layout */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_auto]">
        {/* Form panel */}
        <div>
          <ResumeForm value={resumeData} onChange={setResumeData} />
        </div>

        {/* Preview panel — sticky on xl+ */}
        <div className="hidden xl:block">
          <div className="sticky top-4">
            <ResumePreview data={resumeData} />
          </div>
        </div>
      </div>
    </div>
  );
}
