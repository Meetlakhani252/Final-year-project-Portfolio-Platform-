import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ClassicHTMLTemplate } from "@/components/resume/classic-html-template";
import { ModernHTMLTemplate } from "@/components/resume/modern-html-template";
import { DownloadPDFButton } from "@/components/resume/download-pdf-button";
import type { ResumeData } from "@/lib/pdf";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return { title: `@${username} — Resume` };
}

export default async function PublicResumePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("username", username)
    .single();

  if (!profile) notFound();

  const { data: savedResume } = await supabase
    .from("resumes")
    .select("resume_data")
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (!savedResume?.resume_data) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-16 text-center space-y-3">
        <Link
          href={`/u/${username}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to portfolio
        </Link>
        <p className="text-sm font-medium">{profile.full_name} hasn&apos;t published a resume yet.</p>
      </main>
    );
  }

  const data = savedResume.resume_data as unknown as ResumeData;
  const Template = data.template === "modern" ? ModernHTMLTemplate : ClassicHTMLTemplate;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:py-16 space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/u/${username}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to portfolio
        </Link>
        <DownloadPDFButton data={data} />
      </div>

      {/* Paper */}
      <div className="overflow-hidden rounded-xl border shadow-md">
        <Template data={data} />
      </div>
    </main>
  );
}
