"use client";

import { useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Camera, Loader2 } from "lucide-react";

import { aboutSchema, type AboutInput } from "@/validations/portfolio";
import { updateProfile, uploadAvatar } from "@/actions/portfolio";
import { MAX_IMAGE_SIZE, ACCEPTED_IMAGE_TYPES } from "@/lib/constants";
import type { Profile } from "@/types/portfolio";

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

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .map((p) => p[0])
      .filter(Boolean)
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?"
  );
}

export function AboutForm({ profile }: { profile: Profile }) {
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AboutInput>({
    resolver: zodResolver(aboutSchema),
    defaultValues: {
      full_name: profile.full_name,
      bio: profile.bio ?? "",
      university: profile.university ?? "",
      program: profile.program ?? "",
      graduation_year: profile.graduation_year ?? null,
      gpa: profile.gpa ?? null,
      gpa_public: profile.gpa_public,
    },
  });

  const gpaPublic = watch("gpa_public");

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("Image must be less than 5MB");
      return;
    }
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Only JPEG, PNG, WebP, and GIF images are accepted");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadAvatar(formData);
    setUploading(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    setAvatarUrl(result.data!.url);
    toast.success("Avatar updated");
  }

  function onSubmit(values: AboutInput) {
    startTransition(async () => {
      const result = await updateProfile(values);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Profile saved");
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>About</CardTitle>
        <CardDescription>
          Basic information shown at the top of your public portfolio.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group relative cursor-pointer"
              disabled={uploading}
            >
              <Avatar className="size-20">
                {avatarUrl && <AvatarImage src={avatarUrl} alt="Avatar" />}
                <AvatarFallback className="text-lg">
                  {getInitials(profile.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                {uploading ? (
                  <Loader2 className="size-5 animate-spin text-white" />
                ) : (
                  <Camera className="size-5 text-white" />
                )}
              </div>
            </button>
            <div className="space-y-1">
              <p className="text-sm font-medium">Profile photo</p>
              <p className="text-xs text-muted-foreground">
                Click to upload. JPEG, PNG, WebP, GIF — max 5MB.
              </p>
            </div>
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
            <Input id="full_name" {...register("full_name")} />
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
              rows={4}
              placeholder="Tell recruiters a bit about yourself..."
              {...register("bio")}
            />
            {errors.bio && (
              <p className="text-xs text-destructive">{errors.bio.message}</p>
            )}
            <p className="text-xs text-muted-foreground">Max 500 characters</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="university">University</Label>
              <Input id="university" {...register("university")} />
              {errors.university && (
                <p className="text-xs text-destructive">
                  {errors.university.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="program">Program</Label>
              <Input id="program" {...register("program")} />
              {errors.program && (
                <p className="text-xs text-destructive">
                  {errors.program.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="graduation_year">Graduation Year</Label>
              <Input
                id="graduation_year"
                type="number"
                min={2000}
                max={2040}
                {...register("graduation_year", {
                  setValueAs: (v) =>
                    v === "" || v === null ? null : Number(v),
                })}
              />
              {errors.graduation_year && (
                <p className="text-xs text-destructive">
                  {errors.graduation_year.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="gpa">GPA</Label>
              <Input
                id="gpa"
                type="number"
                step="0.01"
                min={0}
                max={10}
                {...register("gpa", {
                  setValueAs: (v) =>
                    v === "" || v === null ? null : Number(v),
                })}
              />
              {errors.gpa && (
                <p className="text-xs text-destructive">{errors.gpa.message}</p>
              )}
            </div>
          </div>

          {/* GPA visibility toggle */}
          <label className="flex items-start gap-3 rounded-md border p-3">
            <input
              type="checkbox"
              className="mt-1 size-4"
              checked={!!gpaPublic}
              onChange={(e) =>
                setValue("gpa_public", e.target.checked, { shouldDirty: true })
              }
            />
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Show GPA on public portfolio</p>
              <p className="text-xs text-muted-foreground">
                Off by default. When off, your GPA stays private.
              </p>
            </div>
          </label>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" disabled={isPending} className="min-h-[44px]">
            {isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
