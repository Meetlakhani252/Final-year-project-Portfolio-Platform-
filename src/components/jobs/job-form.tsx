"use client";

import { useState, useTransition, type FormEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createJobPosting, updateJobPosting } from "@/actions/jobs";
import { createJobSchema } from "@/validations/jobs";
import type { JobPosting } from "@/actions/jobs";

export function JobForm({ initialData }: { initialData?: JobPosting }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = Boolean(initialData);

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [company, setCompany] = useState(initialData?.company ?? "");
  const [type, setType] = useState(initialData?.type ?? "");
  const [locationType, setLocationType] = useState(initialData?.location_type ?? "");
  const [location, setLocation] = useState(initialData?.location ?? "");
  const [salaryMin, setSalaryMin] = useState(
    initialData?.salary_min ? String(initialData.salary_min) : ""
  );
  const [salaryMax, setSalaryMax] = useState(
    initialData?.salary_max ? String(initialData.salary_max) : ""
  );
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [deadline, setDeadline] = useState(initialData?.application_deadline ?? "");
  const [skills, setSkills] = useState<string[]>(initialData?.required_skills ?? []);
  const [skillInput, setSkillInput] = useState("");

  function addSkill() {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (skills.includes(trimmed)) {
      toast.error("Skill already added.");
      return;
    }
    if (skills.length >= 20) {
      toast.error("At most 20 skills.");
      return;
    }
    setSkills((prev) => [...prev, trimmed]);
    setSkillInput("");
  }

  function onSkillKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const input = {
      title,
      company,
      type: type as "job" | "internship",
      location_type: locationType as "onsite" | "remote" | "hybrid",
      location: location || null,
      salary_min: salaryMin ? parseInt(salaryMin, 10) : null,
      salary_max: salaryMax ? parseInt(salaryMax, 10) : null,
      description,
      required_skills: skills,
      application_deadline: deadline || null,
    };

    const parsed = createJobSchema.safeParse(input);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }

    startTransition(async () => {
      if (isEditing && initialData) {
        const result = await updateJobPosting(initialData.id, parsed.data);
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        toast.success("Job posting updated.");
        router.push("/jobs");
      } else {
        const result = await createJobPosting(parsed.data);
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        toast.success("Job posting created.");
        router.push("/jobs");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Job title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Software Engineering Intern"
          required
        />
      </div>

      {/* Company */}
      <div className="space-y-2">
        <Label htmlFor="company">Company name *</Label>
        <Input
          id="company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="e.g. Acme Corp"
          required
        />
      </div>

      {/* Type + Location type */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Posting type *</Label>
          <Select value={type} onValueChange={(v) => setType(v ?? "")} required>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="job">Full-time job</SelectItem>
              <SelectItem value="internship">Internship</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Location type *</Label>
          <Select
            value={locationType}
            onValueChange={(v) => setLocationType(v ?? "")}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select location type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="onsite">On-site</SelectItem>
              <SelectItem value="remote">Remote</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. New York, NY or Worldwide"
        />
      </div>

      {/* Salary range */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="salary-min">Min salary (USD/year)</Label>
          <Input
            id="salary-min"
            type="number"
            min={0}
            value={salaryMin}
            onChange={(e) => setSalaryMin(e.target.value)}
            placeholder="e.g. 60000"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="salary-max">Max salary (USD/year)</Label>
          <Input
            id="salary-max"
            type="number"
            min={0}
            value={salaryMax}
            onChange={(e) => setSalaryMax(e.target.value)}
            placeholder="e.g. 90000"
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the role, responsibilities, requirements, and what you offer..."
          rows={7}
          required
        />
      </div>

      {/* Application deadline */}
      <div className="space-y-2">
        <Label htmlFor="deadline">Application deadline</Label>
        <Input
          id="deadline"
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">Leave blank for no deadline.</p>
      </div>

      {/* Required skills */}
      <div className="space-y-2">
        <Label>Required skills</Label>
        <div className="flex gap-2">
          <Input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={onSkillKeyDown}
            placeholder="e.g. Python, React, Machine Learning"
          />
          <Button type="button" variant="outline" onClick={addSkill} className="shrink-0">
            Add
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Press Enter or click Add.</p>
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {skills.map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
                className="gap-1 cursor-pointer"
                onClick={() => setSkills((prev) => prev.filter((s) => s !== skill))}
              >
                {skill}
                <X className="size-3" />
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending} className="min-h-11">
          {isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              {isEditing ? "Saving..." : "Creating..."}
            </>
          ) : isEditing ? (
            "Save changes"
          ) : (
            "Create posting"
          )}
        </Button>
      </div>
    </form>
  );
}
