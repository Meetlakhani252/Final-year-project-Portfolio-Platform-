"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useOnboardingStore } from "@/stores/onboarding-store";
import {
  onboardingStep2Schema,
  type OnboardingStep2Input,
} from "@/validations/onboarding";
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

export function StepEducation() {
  const { data, updateData, nextStep, prevStep } = useOnboardingStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OnboardingStep2Input>({
    resolver: zodResolver(onboardingStep2Schema),
    defaultValues: {
      university: data.university,
      program: data.program,
      graduation_year: data.graduation_year,
    },
  });

  function onSubmit(values: OnboardingStep2Input) {
    updateData(values);
    nextStep();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Education</CardTitle>
        <CardDescription>
          Share your academic background. All fields are optional.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="university">University</Label>
            <Input
              id="university"
              placeholder="Stanford University"
              {...register("university")}
              aria-invalid={!!errors.university}
            />
            {errors.university && (
              <p className="text-xs text-destructive">
                {errors.university.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="program">Program</Label>
            <Input
              id="program"
              placeholder="M.S. in Computer Science"
              {...register("program")}
              aria-invalid={!!errors.program}
            />
            {errors.program && (
              <p className="text-xs text-destructive">
                {errors.program.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="graduation_year">Graduation Year</Label>
            <Input
              id="graduation_year"
              type="number"
              placeholder="2026"
              min={2000}
              max={2040}
              {...register("graduation_year")}
              aria-invalid={!!errors.graduation_year}
            />
            {errors.graduation_year && (
              <p className="text-xs text-destructive">
                {errors.graduation_year.message}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            className="min-h-[44px]"
          >
            Back
          </Button>
          <Button type="submit" className="min-h-[44px]">
            Next
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
