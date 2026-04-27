"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function JobsFilter() {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const type = params.get("type") ?? "";
  const locationType = params.get("location_type") ?? "";
  const skill = params.get("skill") ?? "";

  function applyFilter(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    startTransition(() => router.push(`?${next.toString()}`));
  }

  function clearAll() {
    startTransition(() => router.push("/jobs"));
  }

  const hasFilters = type || locationType || skill;

  return (
    <div className="flex flex-wrap gap-3 items-end">
      <div className="space-y-1 min-w-[140px]">
        <Label className="text-xs text-muted-foreground">Type</Label>
        <Select
          value={type || "all"}
          onValueChange={(v) => applyFilter("type", v === "all" ? "" : v)}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="job">Full-time</SelectItem>
            <SelectItem value="internship">Internship</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1 min-w-[150px]">
        <Label className="text-xs text-muted-foreground">Location</Label>
        <Select
          value={locationType || "all"}
          onValueChange={(v) =>
            applyFilter("location_type", v === "all" ? "" : v)
          }
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="All locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All locations</SelectItem>
            <SelectItem value="onsite">On-site</SelectItem>
            <SelectItem value="remote">Remote</SelectItem>
            <SelectItem value="hybrid">Hybrid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1 min-w-[180px]">
        <Label className="text-xs text-muted-foreground">Skill</Label>
        <Input
          className="h-9"
          placeholder="e.g. Python, React"
          defaultValue={skill}
          onBlur={(e) => applyFilter("skill", e.target.value.trim())}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              applyFilter("skill", (e.target as HTMLInputElement).value.trim());
            }
          }}
        />
      </div>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="h-9 text-muted-foreground"
          onClick={clearAll}
          disabled={isPending}
        >
          Clear filters
        </Button>
      )}
    </div>
  );
}
