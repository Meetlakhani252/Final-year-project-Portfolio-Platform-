"use client";

import { useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useOnboardingStore } from "@/stores/onboarding-store";
import {
  onboardingStep1Schema,
  type OnboardingStep1Input,
} from "@/validations/onboarding";
import { MAX_IMAGE_SIZE, ACCEPTED_IMAGE_TYPES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";

export function StepProfile() {
  const { data, updateData, nextStep } = useOnboardingStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OnboardingStep1Input>({
    resolver: zodResolver(onboardingStep1Schema),
    defaultValues: {
      full_name: data.full_name,
      bio: data.bio,
    },
  });

  const handleAvatarChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > MAX_IMAGE_SIZE) {
        alert("Image must be less than 5MB");
        return;
      }
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        alert("Only JPEG, PNG, WebP, and GIF images are accepted");
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      updateData({ avatarFile: file, avatarPreview: previewUrl });
    },
    [updateData]
  );

  function onSubmit(values: OnboardingStep1Input) {
    updateData(values);
    nextStep();
  }

  const initials = data.full_name
    ? data.full_name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tell us about yourself</CardTitle>
        <CardDescription>
          This information will appear on your public portfolio.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-5">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group relative cursor-pointer"
            >
              <Avatar size="lg" className="size-20">
                {data.avatarPreview && (
                  <AvatarImage src={data.avatarPreview} alt="Avatar preview" />
                )}
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <Camera className="size-5 text-white" />
              </div>
            </button>
            <span className="text-xs text-muted-foreground">
              Click to upload photo (optional)
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              placeholder="Jane Doe"
              {...register("full_name")}
              aria-invalid={!!errors.full_name}
            />
            {errors.full_name && (
              <p className="text-xs text-destructive">
                {errors.full_name.message}
              </p>
            )}
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell recruiters a bit about yourself..."
              rows={3}
              {...register("bio")}
              aria-invalid={!!errors.bio}
            />
            {errors.bio && (
              <p className="text-xs text-destructive">{errors.bio.message}</p>
            )}
            <p className="text-xs text-muted-foreground">Max 500 characters</p>
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" className="min-h-[44px]">
            Next
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
