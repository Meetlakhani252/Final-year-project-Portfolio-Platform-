"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { updateUsername } from "@/actions/settings";
import { Check, Edit2, X } from "lucide-react";

const usernameSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, hyphens, and underscores"
    ),
});

type UsernameInput = z.infer<typeof usernameSchema>;

export function UsernameForm({ initialUsername }: { initialUsername: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UsernameInput>({
    resolver: zodResolver(usernameSchema),
    defaultValues: {
      username: initialUsername,
    },
  });

  function onSubmit(data: UsernameInput) {
    if (data.username === initialUsername) {
      setIsEditing(false);
      return;
    }

    startTransition(async () => {
      const result = await updateUsername(data.username);
      if (result.ok) {
        toast.success("Username updated successfully.");
        setIsEditing(false);
      } else {
        toast.error(result.error || "Failed to update username.");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label>Username</Label>
          <p className="text-xs text-muted-foreground">
            Used for your public portfolio URL and finding friends.
          </p>
        </div>
        {!isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="text-primary"
          >
            <Edit2 className="size-3.5 mr-2" />
            Change
          </Button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit(onSubmit)} className="flex items-start gap-2">
          <div className="flex-1 space-y-1">
            <Input
              {...register("username")}
              placeholder="newusername123"
              disabled={isPending}
              autoFocus
            />
            {errors.username && (
              <p className="text-[10px] text-destructive">{errors.username.message}</p>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              type="submit"
              size="icon"
              className="size-9"
              disabled={isPending}
            >
              <Check className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9"
              onClick={() => {
                setIsEditing(false);
                reset();
              }}
              disabled={isPending}
            >
              <X className="size-4" />
            </Button>
          </div>
        </form>
      ) : (
        <div className="rounded-lg border bg-muted/30 px-3 py-2 text-sm font-mono">
          profolio.dev/u/{initialUsername}
        </div>
      )}
    </div>
  );
}
