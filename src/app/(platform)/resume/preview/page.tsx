import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ClassicHTMLTemplate } from "@/components/resume/classic-html-template";
import { ModernHTMLTemplate } from "@/components/resume/modern-html-template";
import { DownloadPDFButton } from "@/components/resume/download-pdf-button";
import type { ResumeData } from "@/lib/pdf";
import { Button } from "@/components/ui/button";

export default async function ResumePreviewPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: savedResume } = await supabase
    .from("resumes")
    .select("resume_data")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!savedResume?.resume_data) {
    return (
      <div className="mx-auto w-full max-w-2xl py-16 text-center space-y-4">
        <p className="text-sm font-medium">No saved resume yet</p>
        <p className="text-xs text-muted-foreground">
          Build and save your resume first to preview it here.
        </p>
        <Button render={<Link href="/resume/builder" />}>Go to builder</Button>
      </div>
    );
  }

  const data = savedResume.resume_data as unknown as ResumeData;
  const Template = data.template === "modern" ? ModernHTMLTemplate : ClassicHTMLTemplate;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/resume/builder"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to builder
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" render={<Link href="/resume/builder" />}>
            <Pencil className="size-4" />
            Edit
          </Button>
          <DownloadPDFButton data={data} />
        </div>
      </div>

      {/* Paper */}
      <div className="overflow-hidden rounded-xl border shadow-md">
        <Template data={data} />
      </div>
    </div>
  );
}
