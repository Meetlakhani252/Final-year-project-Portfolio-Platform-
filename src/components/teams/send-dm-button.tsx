"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { startConversation } from "@/actions/messages";

export function SendDmButton({ recipientId }: { recipientId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await startConversation(recipientId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      router.push(`/messages/${result.data!.conversationId}`);
    });
  }

  return (
    <Button onClick={handleClick} disabled={isPending} variant="outline">
      {isPending ? (
        <Loader2 className="mr-2 size-4 animate-spin" />
      ) : (
        <MessageCircle className="mr-2 size-4" />
      )}
      Send DM
    </Button>
  );
}
