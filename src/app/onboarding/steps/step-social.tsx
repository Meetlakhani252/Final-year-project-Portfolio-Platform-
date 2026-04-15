"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useOnboardingStore } from "@/stores/onboarding-store";
import {
  onboardingStep4Schema,
  type OnboardingStep4Input,
} from "@/validations/onboarding";
import { completeOnboarding } from "@/actions/onboarding";
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
import { Globe } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";

export function StepSocial() {
  const { data, updateData, prevStep } = useOnboardingStore();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OnboardingStep4Input>({
    resolver: zodResolver(onboardingStep4Schema),
    defaultValues: {
      github_url: data.github_url,
      linkedin_url: data.linkedin_url,
      website_url: data.website_url,
    },
  });

  function onSubmit(values: OnboardingStep4Input) {
    updateData(values);
    setSubmitError(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.append("full_name", data.full_name);
      formData.append("bio", data.bio);
      formData.append("university", data.university);
      formData.append("program", data.program);
      formData.append("graduation_year", data.graduation_year);
      formData.append("skills", JSON.stringify(data.skills));
      formData.append("github_url", values.github_url);
      formData.append("linkedin_url", values.linkedin_url);
      formData.append("website_url", values.website_url);
      if (data.avatarFile) {
        formData.append("avatar", data.avatarFile);
      }

      const result = await completeOnboarding(formData);
      if (result?.error) {
        setSubmitError(result.error);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Links</CardTitle>
        <CardDescription>
          Connect your online presence. All fields are optional.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-5">
          {submitError && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {submitError}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="github_url" className="flex items-center gap-2">
              <FaGithub className="size-4" />
              GitHub
            </Label>
            <Input
              id="github_url"
              type="url"
              placeholder="https://github.com/username"
              {...register("github_url")}
              aria-invalid={!!errors.github_url}
            />
            {errors.github_url && (
              <p className="text-xs text-destructive">
                {errors.github_url.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin_url" className="flex items-center gap-2">
              <FaLinkedin className="size-4" />
              LinkedIn
            </Label>
            <Input
              id="linkedin_url"
              type="url"
              placeholder="https://linkedin.com/in/username"
              {...register("linkedin_url")}
              aria-invalid={!!errors.linkedin_url}
            />
            {errors.linkedin_url && (
              <p className="text-xs text-destructive">
                {errors.linkedin_url.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="website_url" className="flex items-center gap-2">
              <Globe className="size-4" />
              Personal Website
            </Label>
            <Input
              id="website_url"
              type="url"
              placeholder="https://yourname.com"
              {...register("website_url")}
              aria-invalid={!!errors.website_url}
            />
            {errors.website_url && (
              <p className="text-xs text-destructive">
                {errors.website_url.message}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={isPending}
            className="min-h-[44px]"
          >
            Back
          </Button>
          <Button type="submit" disabled={isPending} className="min-h-[44px]">
            {isPending ? "Finishing..." : "Complete Setup"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
