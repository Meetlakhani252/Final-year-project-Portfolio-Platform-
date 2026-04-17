import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPortfolioSnapshot } from "@/lib/snapshots";

// Called by Vercel Cron on the 1st of every month (see vercel.json).
// Authorization: Bearer <CRON_SECRET>
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = createAdminClient();

  // Fetch all students who have completed onboarding
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "student")
    .eq("onboarding_completed", true);

  if (error) {
    console.error("[cron/monthly-snapshots] Failed to fetch profiles:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ ok: true, processed: 0 });
  }

  let processed = 0;
  let failed = 0;

  for (const profile of profiles) {
    try {
      await createPortfolioSnapshot(
        supabase,
        profile.id,
        "monthly",
        "Monthly portfolio snapshot"
      );
      processed++;
    } catch (err) {
      console.error(
        `[cron/monthly-snapshots] Failed for profile ${profile.id}:`,
        err
      );
      failed++;
    }
  }

  console.log(
    `[cron/monthly-snapshots] Done. processed=${processed} failed=${failed}`
  );

  return NextResponse.json({ ok: true, processed, failed });
}
