"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { startConversation } from "@/actions/messages";

export function SendMessageButton({
  recipientId,
  className,
}: {
  recipientId: string;
  className?: string;
}) {
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
    <Button
      onClick={handleClick}
      disabled={isPending}
      size="sm"
      className={cn("w-full", className)}
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <MessageCircle className="size-4" />
      )}
      Message
    </Button>
  );
}
