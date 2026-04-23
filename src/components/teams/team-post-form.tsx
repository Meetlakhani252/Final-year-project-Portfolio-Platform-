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
import { createTeamPost } from "@/actions/teams";
import { createTeamPostSchema } from "@/validations/teams";
import type { EventOption } from "@/actions/teams";

export function TeamPostForm({ events }: { events: EventOption[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [teamSize, setTeamSize] = useState("1");
  const [contactPreference, setContactPreference] = useState<string>("both");
  const [eventId, setEventId] = useState<string>("");

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

  function removeSkill(skill: string) {
    setSkills((prev) => prev.filter((s) => s !== skill));
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const input = {
      title,
      description,
      required_skills: skills,
      team_size_needed: parseInt(teamSize, 10) || 1,
      contact_preference: contactPreference as "dm" | "comment" | "both",
      event_id: eventId || null,
    };

    const parsed = createTeamPostSchema.safeParse(input);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }

    startTransition(async () => {
      const result = await createTeamPost(parsed.data);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Post created successfully.");
      router.push(`/teams/${result.id}`);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Looking for frontend dev for Spring Hackathon"
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your team, what you're building, and what you're looking for..."
          rows={5}
          required
        />
      </div>

      {/* Team size + Contact preference */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="team-size">Members needed *</Label>
          <Input
            id="team-size"
            type="number"
            min={1}
            max={50}
            value={teamSize}
            onChange={(e) => setTeamSize(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Contact preference *</Label>
          <Select
            value={contactPreference}
            onValueChange={(v) => setContactPreference(v ?? "both")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select preference" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dm">DM only</SelectItem>
              <SelectItem value="comment">Comment only</SelectItem>
              <SelectItem value="both">DM or comment</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Linked event */}
      {events.length > 0 && (
        <div className="space-y-2">
          <Label>Linked event (optional)</Label>
          <Select
            value={eventId || "none"}
            onValueChange={(v) => setEventId(v === "none" ? "" : (v ?? ""))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an event (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No event</SelectItem>
              {events.map((ev) => (
                <SelectItem key={ev.id} value={ev.id}>
                  {ev.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Link to a specific hackathon or event you&apos;re looking for teammates for.
          </p>
        </div>
      )}

      {/* Required skills */}
      <div className="space-y-2">
        <Label>Required skills</Label>
        <div className="flex gap-2">
          <Input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={onSkillKeyDown}
            placeholder="e.g. React, Python, ML"
          />
          <Button
            type="button"
            variant="outline"
            onClick={addSkill}
            className="shrink-0"
          >
            Add
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Press Enter or click Add.
        </p>
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {skills.map((skill) => (
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
              Posting...
            </>
          ) : (
            "Post"
          )}
        </Button>
      </div>
    </form>
  );
}
