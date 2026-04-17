import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, History } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { JourneyTimeline } from "@/components/journey/journey-timeline";
import type { SnapshotData } from "@/lib/snapshots";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return { title: `@${username} — Portfolio Journey` };
}

export interface SnapshotRow {
  id: string;
  trigger_type: string;
  trigger_description: string | null;
  created_at: string;
  snapshot_data: SnapshotData;
}

export default async function JourneyPage({
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

  const { data: raw } = await supabase
    .from("portfolio_snapshots")
    .select("id, trigger_type, trigger_description, created_at, snapshot_data")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: true });

  const snapshots: SnapshotRow[] = (raw ?? []).map((r) => ({
    id: r.id,
    trigger_type: r.trigger_type,
    trigger_description: r.trigger_description,
    created_at: r.created_at,
    snapshot_data: r.snapshot_data as unknown as SnapshotData,
  }));

  return (
    <main className="mx-auto w-full max-w-2xl space-y-8 px-4 py-10 sm:py-16">
      {/* Header */}
      <div className="space-y-3">
        <Link
          href={`/u/${username}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to portfolio
        </Link>
        <div className="flex items-center gap-2">
          <History className="size-5 text-muted-foreground" />
          <h1 className="text-2xl font-semibold tracking-tight">
            {profile.full_name}&apos;s Journey
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          A chronological record of portfolio milestones and growth over time.
        </p>
      </div>

      {snapshots.length === 0 ? (
        <div className="rounded-lg border border-dashed py-16 text-center">
          <History className="mx-auto mb-3 size-8 text-muted-foreground/40" />
          <p className="text-sm font-medium">No snapshots yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Snapshots are created automatically when projects or certifications
            are added.
          </p>
        </div>
      ) : (
        <JourneyTimeline snapshots={snapshots} />
      )}
    </main>
  );
}
