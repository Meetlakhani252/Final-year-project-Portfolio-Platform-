import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/get-user";
import { MessagesShell } from "@/components/messages/messages-shell";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const user = await getUser();
  const supabase = await createClient();

  // Verify user is a participant
  const { data: conv } = await supabase
    .from("conversations")
    .select("id")
    .eq("id", conversationId)
    .or(`participant_one.eq.${user.id},participant_two.eq.${user.id}`)
    .single();

  if (!conv) notFound();

  return (
    <MessagesShell
      activeConversationId={conversationId}
      currentUserId={user.id}
    />
  );
}
