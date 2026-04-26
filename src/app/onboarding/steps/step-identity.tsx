"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Globe, RefreshCw } from "lucide-react";

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

export function StepIdentity() {
  const { data, updateData, nextStep, prevStep } = useOnboardingStore();
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UsernameInput>({
    resolver: zodResolver(usernameSchema),
    defaultValues: {
      username: data.username,
    },
  });

  const username = watch("username");

  const generateSuggestion = () => {
    const firstName = data.full_name.split(" ")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
    const randomNum = Math.floor(100 + Math.random() * 900);
    const suggestion = firstName ? `${firstName}${randomNum}` : `user${randomNum}`;
    setValue("username", suggestion, { shouldValidate: true });
  };

  // Generate initial suggestion if empty
  useEffect(() => {
    if (!data.username && data.full_name) {
      generateSuggestion();
    }
  }, [data.full_name, data.username]);

  function onSubmit(values: UsernameInput) {
    updateData(values);
    nextStep();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="size-5 text-primary" />
          Choose your identity
        </CardTitle>
        <CardDescription>
          Your username is how friends and collaborators will find you on the platform.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <Input
                id="username"
                placeholder="john123"
                className="pr-10"
                {...register("username")}
                aria-invalid={!!errors.username}
              />
              <button
                type="button"
                onClick={generateSuggestion}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                title="Generate new suggestion"
              >
                <RefreshCw className="size-4" />
              </button>
            </div>
            {errors.username && (
              <p className="text-xs text-destructive">{errors.username.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Format: First name + 3 numbers (e.g. {data.full_name.split(" ")[0] || "John"}123)
            </p>
          </div>

          <div className="rounded-lg bg-primary/5 p-4 border border-primary/10">
            <p className="text-xs font-medium text-primary mb-1">Preview URL</p>
            <p className="text-sm font-mono truncate opacity-70">
              profolio.dev/u/{username || "..."}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="ghost" onClick={prevStep}>
            Back
          </Button>
          <Button type="submit">
            Continue
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
