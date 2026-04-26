"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { toggleConnection } from "@/actions/connections";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ConnectButtonProps {
  targetId: string;
  initialIsConnected: boolean;
  className?: string;
}

export function ConnectButton({ targetId, initialIsConnected, className }: ConnectButtonProps) {
  const [isConnected, setIsConnected] = useState(initialIsConnected);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const result = await toggleConnection(targetId);
      if (result.ok) {
        setIsConnected(result.connected!);
        toast.success(result.connected ? "Connected!" : "Disconnected.");
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Button
      variant={isConnected ? "outline" : "default"}
      size="sm"
      onClick={handleToggle}
      disabled={isPending}
      className={cn(
        "gap-2 h-9 px-4 transition-all duration-300",
        isConnected ? "border-primary/50 text-primary hover:bg-primary/5" : "shadow-lg shadow-primary/20",
        className
      )}
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : isConnected ? (
        <UserMinus className="size-4" />
      ) : (
        <UserPlus className="size-4" />
      )}
      {isConnected ? "Connected" : "Add Friend"}
    </Button>
  );
}
