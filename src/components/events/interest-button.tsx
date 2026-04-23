"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { toggleInterest } from "@/actions/events";

export function InterestButton({
  eventId,
  initialInterested,
  initialCount,
  compact = false,
}: {
  eventId: string;
  initialInterested: boolean;
  initialCount: number;
  compact?: boolean;
}) {
  const [interested, setInterested] = useState(initialInterested);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await toggleInterest(eventId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setInterested(result.interested);
      setCount((prev) => (result.interested ? prev + 1 : Math.max(0, prev - 1)));
    });
  }

  if (compact) {
    return (
      <Button
        onClick={handleClick}
        disabled={isPending}
        variant={interested ? "default" : "outline"}
        size="sm"
        className="gap-1.5"
      >
        <Heart className={`size-3.5 ${interested ? "fill-current" : ""}`} />
        {interested ? "Interested" : "Interested?"}
      </Button>
    );
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isPending}
      variant={interested ? "default" : "outline"}
      className="min-h-11 gap-2"
    >
      <Heart className={`size-4 ${interested ? "fill-current" : ""}`} />
      {interested ? "Interested" : "I'm Interested"}
      <span className="text-xs opacity-70">({count})</span>
    </Button>
  );
}
