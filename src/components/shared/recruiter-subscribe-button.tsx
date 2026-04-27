"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import { toggleRecruiterSubscription } from "@/actions/recruiter-subscriptions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface RecruiterSubscribeButtonProps {
  recruiterId: string;
  initialIsSubscribed: boolean;
  className?: string;
}

export function RecruiterSubscribeButton({
  recruiterId,
  initialIsSubscribed,
  className,
}: RecruiterSubscribeButtonProps) {
  const [isSubscribed, setIsSubscribed] = useState(initialIsSubscribed);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const result = await toggleRecruiterSubscription(recruiterId);
      if (result.ok) {
        setIsSubscribed(result.subscribed);
        toast.success(
          result.subscribed
            ? "Connected! You'll be notified of new job posts."
            : "Disconnected."
        );
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Button
      variant={isSubscribed ? "outline" : "default"}
      size="sm"
      onClick={handleToggle}
      disabled={isPending}
      className={cn(
        "gap-2 h-9 px-4 transition-all duration-300",
        isSubscribed
          ? "border-primary/50 text-primary hover:bg-primary/5"
          : "shadow-lg shadow-primary/20",
        className
      )}
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : isSubscribed ? (
        <UserCheck className="size-4" />
      ) : (
        <UserPlus className="size-4" />
      )}
      {isSubscribed ? "Connected" : "Connect"}
    </Button>
  );
}
