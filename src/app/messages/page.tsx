import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/get-user";
import { MessagesShell } from "@/components/messages/messages-shell";

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ with?: string }>;
}) {
  const { with: withUserId } = await searchParams;
  const user = await getUser();
  const supabase = await createClient();

  if (withUserId && withUserId !== user.id) {
    const { data: recipientProfile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", withUserId)
      .single();

    if (!recipientProfile) {
      return (
        <MessagesShell
          activeConversationId={null}
          currentUserId={user.id}
          initError="User not found."
        />
      );
    }

    const p1 = user.id < withUserId ? user.id : withUserId;
    const p2 = user.id < withUserId ? withUserId : user.id;

    // Students cannot initiate with recruiters
    if (user.role === "student" && recipientProfile.role === "recruiter") {
      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .eq("participant_one", p1)
        .eq("participant_two", p2)
        .maybeSingle();

      if (!existing) {
        return (
          <MessagesShell
            activeConversationId={null}
            currentUserId={user.id}
            initError="Students cannot initiate conversations with recruiters."
          />
        );
      }
      redirect(`/messages/${existing.id}`);
    }

    // Find or create conversation
    await supabase
      .from("conversations")
      .upsert(
        { participant_one: p1, participant_two: p2 },
        {
          onConflict: "participant_one,participant_two",
          ignoreDuplicates: true,
        }
      );

    const { data: conv } = await supabase
      .from("conversations")
      .select("id")
      .eq("participant_one", p1)
      .eq("participant_two", p2)
      .single();

    if (conv) redirect(`/messages/${conv.id}`);
  }

  return (
    <MessagesShell activeConversationId={null} currentUserId={user.id} />
  );
}
