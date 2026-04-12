"use client";

import { useState, type KeyboardEvent } from "react";
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
import { X } from "lucide-react";

export function StepSkills() {
  const { data, updateData, nextStep, prevStep } = useOnboardingStore();
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  function addSkill() {
    const trimmed = input.trim();
    if (!trimmed) return;

    if (trimmed.length > 50) {
      setError("Skill name is too long");
      return;
    }
    if (data.skills.includes(trimmed)) {
      setError("Skill already added");
      return;
    }
    if (data.skills.length >= 30) {
      setError("Maximum 30 skills");
      return;
    }

    updateData({ skills: [...data.skills, trimmed] });
    setInput("");
    setError(null);
  }

  function removeSkill(skill: string) {
    updateData({ skills: data.skills.filter((s) => s !== skill) });
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill();
    } else if (e.key === "Backspace" && !input && data.skills.length > 0) {
      removeSkill(data.skills[data.skills.length - 1]);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills</CardTitle>
        <CardDescription>
          Add skills that showcase your expertise. Press Enter or comma to add.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="skill-input">Skills</Label>
          <div className="flex gap-2">
            <Input
              id="skill-input"
              placeholder="e.g. React, Python, Machine Learning"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError(null);
              }}
              onKeyDown={handleKeyDown}
            />
            <Button
              type="button"
              variant="outline"
              onClick={addSkill}
              className="min-h-[44px]"
            >
              Add
            </Button>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <p className="text-xs text-muted-foreground">
            {data.skills.length} / 30 skills
          </p>
        </div>

        {data.skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill) => (
              <span
                key={skill}
                className="badge-sage inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="rounded-full p-0.5 hover:bg-black/10"
                  aria-label={`Remove ${skill}`}
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        )}
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
        <Button type="button" onClick={nextStep} className="min-h-[44px]">
          Next
        </Button>
      </CardFooter>
    </Card>
  );
}
