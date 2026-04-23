"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition, useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export function EventsFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const currentType = searchParams.get("type") ?? "";
  const currentDateFrom = searchParams.get("date_from") ?? "";
  const currentDateTo = searchParams.get("date_to") ?? "";
  const currentSkills = searchParams.getAll("skill");

  const [skillInput, setSkillInput] = useState("");

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function addSkill() {
    const trimmed = skillInput.trim();
    if (!trimmed || currentSkills.includes(trimmed)) return;

    const params = new URLSearchParams(searchParams.toString());
    params.append("skill", trimmed);
    setSkillInput("");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function removeSkill(skill: string) {
    const params = new URLSearchParams(searchParams.toString());
    const remaining = currentSkills.filter((s) => s !== skill);
    params.delete("skill");
    remaining.forEach((s) => params.append("skill", s));
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function clearAll() {
    startTransition(() => {
      router.push(pathname);
    });
  }

  function onSkillKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  }

  const hasFilters =
    currentType || currentDateFrom || currentDateTo || currentSkills.length > 0;

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Event type */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Type</Label>
          <Select
            value={currentType || "all"}
            onValueChange={(v) => updateParam("type", v === "all" ? null : v)}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="hackathon">Hackathon</SelectItem>
              <SelectItem value="academic">Academic</SelectItem>
              <SelectItem value="workshop">Workshop</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date from */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">From date</Label>
          <Input
            type="date"
            className="h-9"
            value={currentDateFrom}
            onChange={(e) => updateParam("date_from", e.target.value || null)}
          />
        </div>

        {/* Date to */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">To date</Label>
          <Input
            type="date"
            className="h-9"
            value={currentDateTo}
            onChange={(e) => updateParam("date_to", e.target.value || null)}
          />
        </div>

        {/* Skill filter */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Required skill</Label>
          <div className="flex gap-2">
            <Input
              className="h-9"
              placeholder="e.g. React"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={onSkillKeyDown}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 px-3 shrink-0"
              onClick={addSkill}
            >
              Add
            </Button>
          </div>
        </div>
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

      {/* Clear all */}
      {hasFilters && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="h-8 text-xs text-muted-foreground"
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
