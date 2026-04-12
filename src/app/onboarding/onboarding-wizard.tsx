"use client";

import { useEffect } from "react";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { Logo } from "@/components/shared/logo";
import { Progress } from "@/components/ui/progress";
import { StepProfile } from "./steps/step-profile";
import { StepEducation } from "./steps/step-education";
import { StepSkills } from "./steps/step-skills";
import { StepSocial } from "./steps/step-social";

const STEP_LABELS = ["Profile", "Education", "Skills", "Links"];

export function OnboardingWizard({ initialName }: { initialName: string }) {
  const step = useOnboardingStore((s) => s.step);
  const updateData = useOnboardingStore((s) => s.updateData);

  useEffect(() => {
    if (initialName) {
      updateData({ full_name: initialName });
    }
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progressValue = (step / 4) * 100;

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <Logo />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Step {step} of 4: {STEP_LABELS[step - 1]}
          </span>
          <span>{Math.round(progressValue)}%</span>
        </div>
        <Progress value={progressValue} />
      </div>

      {step === 1 && <StepProfile />}
      {step === 2 && <StepEducation />}
      {step === 3 && <StepSkills />}
      {step === 4 && <StepSocial />}
    </div>
  );
}
