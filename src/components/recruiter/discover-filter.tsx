"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, type KeyboardEvent } from "react";
import { X, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const GRADUATION_YEARS = Array.from({ length: 8 }, (_, i) => 2024 + i);

const AVAILABILITY_OPTIONS = [
  { value: "internship", label: "Internship" },
  { value: "fulltime", label: "Full-time" },
  { value: "research", label: "Research" },
];

export function DiscoverFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSkills = searchParams.getAll("skill");
  const currentGradYear = searchParams.get("year") ?? "";
  const currentUniversity = searchParams.get("university") ?? "";
  const currentMinGpa = searchParams.get("min_gpa") ?? "";
  const currentAvailFor = searchParams.get("available_for") ?? "";

  const [skillInput, setSkillInput] = useState("");
  const [universityInput, setUniversityInput] = useState(currentUniversity);

  // Keep local university state in sync when URL changes (e.g. after "Clear all")
  useEffect(() => {
    setUniversityInput(currentUniversity);
  }, [currentUniversity]);

  function buildParams(
    overrides: Record<string, string | string[] | null>
  ): string {
    const params = new URLSearchParams();

    const skills =
      "skill" in overrides
        ? ((overrides.skill as string[] | null) ?? [])
        : currentSkills;
    skills.forEach((s) => params.append("skill", s));

    const year =
      "year" in overrides
        ? (overrides.year as string | null)
        : currentGradYear;
    if (year) params.set("year", year);

    const uni =
      "university" in overrides
        ? (overrides.university as string | null)
        : currentUniversity;
    if (uni) params.set("university", uni);

    const gpa =
      "min_gpa" in overrides
        ? (overrides.min_gpa as string | null)
        : currentMinGpa;
    if (gpa) params.set("min_gpa", gpa);

    const avail =
      "available_for" in overrides
        ? (overrides.available_for as string | null)
        : currentAvailFor;
    if (avail) params.set("available_for", avail);

    return params.toString();
  }

  function addSkill() {
    const trimmed = skillInput.trim();
    if (!trimmed || currentSkills.includes(trimmed)) return;
    router.push(`?${buildParams({ skill: [...currentSkills, trimmed] })}`);
    setSkillInput("");
  }

  function removeSkill(skill: string) {
    router.push(
      `?${buildParams({ skill: currentSkills.filter((s) => s !== skill) })}`
    );
  }

  function onSkillKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  }

  function applyUniversity() {
    const trimmed = universityInput.trim();
    router.push(`?${buildParams({ university: trimmed || null })}`);
  }

  function onUniversityKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      applyUniversity();
    }
  }

  function clearAll() {
    setUniversityInput("");
    router.push("?");
  }

  const hasFilters =
    currentSkills.length > 0 ||
    !!currentGradYear ||
    !!currentUniversity ||
    !!currentMinGpa ||
    !!currentAvailFor;

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <SlidersHorizontal className="size-4" />
        Filters
      </div>

      <div className="flex flex-wrap gap-4">
        {/* Skills */}
        <div className="flex-1 min-w-52 space-y-2">
          <Label className="text-xs text-muted-foreground">Skills</Label>
          <div className="flex gap-2">
            <Input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={onSkillKeyDown}
              placeholder="e.g. Python, React (Enter)"
              className="h-9 text-sm"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSkill}
              className="shrink-0"
            >
              Add
            </Button>
          </div>
        </div>

        {/* Graduation Year */}
        <div className="min-w-40 space-y-2">
          <Label className="text-xs text-muted-foreground">
            Graduation year
          </Label>
          <Select
            value={currentGradYear || "all"}
            onValueChange={(v) =>
              router.push(`?${buildParams({ year: v === "all" ? null : v })}`)
            }
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Any year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any year</SelectItem>
              {GRADUATION_YEARS.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* University */}
        <div className="flex-1 min-w-52 space-y-2">
          <Label className="text-xs text-muted-foreground">University</Label>
          <div className="flex gap-2">
            <Input
              value={universityInput}
              onChange={(e) => setUniversityInput(e.target.value)}
              onKeyDown={onUniversityKeyDown}
              placeholder="Search university… (Enter)"
              className="h-9 text-sm"
            />
            {universityInput.trim() !== currentUniversity && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={applyUniversity}
                className="shrink-0"
              >
                Apply
              </Button>
            )}
          </div>
        </div>

        {/* Min GPA */}
        <div className="min-w-36 space-y-2">
          <Label className="text-xs text-muted-foreground">Min GPA</Label>
          <Select
            value={currentMinGpa || "any"}
            onValueChange={(v) =>
              router.push(
                `?${buildParams({ min_gpa: v === "any" ? null : v })}`
              )
            }
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Any GPA" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any GPA</SelectItem>
              <SelectItem value="3.5">3.5 and above</SelectItem>
              <SelectItem value="3.0">3.0 and above</SelectItem>
              <SelectItem value="2.5">2.5 and above</SelectItem>
              <SelectItem value="2.0">2.0 and above</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Available for */}
        <div className="min-w-40 space-y-2">
          <Label className="text-xs text-muted-foreground">Available for</Label>
          <Select
            value={currentAvailFor || "any"}
            onValueChange={(v) =>
              router.push(
                `?${buildParams({ available_for: v === "any" ? null : v })}`
              )
            }
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Any type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any type</SelectItem>
              {AVAILABILITY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {hasFilters && (
          <div className="flex items-end">
            <Button variant="ghost" size="sm" onClick={clearAll}>
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Active skill tags */}
      {currentSkills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {currentSkills.map((skill) => (
            <Badge
              key={skill}
              variant="secondary"
              className="gap-1 cursor-pointer"
              onClick={() => removeSkill(skill)}
            >
              {skill}
              <X className="size-3" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
