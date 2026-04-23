"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
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
import type { EventOption } from "@/actions/teams";

export function TeamsFilter({ events }: { events: EventOption[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSkills = searchParams.getAll("skill");
  const currentEventId = searchParams.get("event_id") ?? "";
  const currentStandaloneOnly = searchParams.get("standalone") === "1";

  const [skillInput, setSkillInput] = useState("");

  function buildParams(overrides: Record<string, string | string[] | null>) {
    const params = new URLSearchParams();

    const skills =
      "skill" in overrides
        ? (overrides.skill as string[] | null) ?? []
        : currentSkills;
    skills.forEach((s) => params.append("skill", s));

    const eventId =
      "event_id" in overrides
        ? (overrides.event_id as string | null) ?? ""
        : currentEventId;
    if (eventId) params.set("event_id", eventId);

    const standalone =
      "standalone" in overrides
        ? overrides.standalone === "1"
        : currentStandaloneOnly;
    if (standalone) params.set("standalone", "1");

    return params.toString();
  }

  function addSkill() {
    const trimmed = skillInput.trim();
    if (!trimmed || currentSkills.includes(trimmed)) return;
    const next = [...currentSkills, trimmed];
    router.push(`?${buildParams({ skill: next })}`);
    setSkillInput("");
  }

  function removeSkill(skill: string) {
    const next = currentSkills.filter((s) => s !== skill);
    router.push(`?${buildParams({ skill: next })}`);
  }

  function onSkillKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  }

  function onEventChange(value: string | null) {
    const v = value === "all" ? "" : (value ?? "");
    router.push(`?${buildParams({ event_id: v || null, standalone: null })}`);
  }

  function toggleStandalone() {
    if (currentStandaloneOnly) {
      router.push(`?${buildParams({ standalone: null, event_id: null })}`);
    } else {
      router.push(`?${buildParams({ standalone: "1", event_id: null })}`);
    }
  }

  const hasFilters =
    currentSkills.length > 0 || !!currentEventId || currentStandaloneOnly;

  function clearAll() {
    router.push("?");
  }

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <div className="flex flex-wrap gap-4">
        {/* Skills filter */}
        <div className="flex-1 min-w-52 space-y-2">
          <Label className="text-xs text-muted-foreground">Filter by skill</Label>
          <div className="flex gap-2">
            <Input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={onSkillKeyDown}
              placeholder="e.g. Python, React"
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

        {/* Event filter */}
        {events.length > 0 && (
          <div className="flex-1 min-w-52 space-y-2">
            <Label className="text-xs text-muted-foreground">Linked event</Label>
            <Select
              value={currentStandaloneOnly ? "standalone" : currentEventId || "all"}
              onValueChange={(v) => {
                if (v === "standalone") {
                  toggleStandalone();
                } else {
                  onEventChange(v ?? "all");
                }
              }}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="All posts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All posts</SelectItem>
                <SelectItem value="standalone">No linked event</SelectItem>
                {events.map((ev) => (
                  <SelectItem key={ev.id} value={ev.id}>
                    {ev.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {hasFilters && (
          <div className="flex items-end">
            <Button variant="ghost" size="sm" onClick={clearAll}>
              Clear filters
            </Button>
          </div>
        )}
      </div>

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
