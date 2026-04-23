"use client";

import { useState, useTransition, type FormEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { createEvent } from "@/actions/events";
import { createEventSchema } from "@/validations/events";

export function EventForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState<string>("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("09:00");
  const [registrationDeadline, setRegistrationDeadline] = useState("");
  const [locationType, setLocationType] = useState<string>("");
  const [locationDetails, setLocationDetails] = useState("");
  const [registrationUrl, setRegistrationUrl] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
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

  function removeSkill(skill: string) {
    setSkills((prev) => prev.filter((s) => s !== skill));
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const eventDatetime = eventDate ? `${eventDate}T${eventTime}:00` : "";

    const input = {
      title,
      description,
      event_type: eventType as "hackathon" | "academic" | "workshop" | "other",
      event_date: eventDatetime,
      registration_deadline: registrationDeadline
        ? `${registrationDeadline}T23:59:00`
        : null,
      location_type: locationType as "online" | "offline" | "hybrid",
      location_details: locationDetails || null,
      required_skills: skills,
      registration_url: registrationUrl || null,
    };

    const parsed = createEventSchema.safeParse(input);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }

    startTransition(async () => {
      const result = await createEvent(parsed.data);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Event created successfully.");
      router.push(`/events/${result.id}`);
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
          placeholder="e.g. Spring Hackathon 2026"
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
          placeholder="Describe the event, goals, prizes, etc."
          rows={5}
          required
        />
      </div>

      {/* Event type + Location type */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Event type *</Label>
          <Select value={eventType} onValueChange={(v) => setEventType(v ?? "")} required>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hackathon">Hackathon</SelectItem>
              <SelectItem value="academic">Academic</SelectItem>
              <SelectItem value="workshop">Workshop</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Location type *</Label>
          <Select value={locationType} onValueChange={(v) => setLocationType(v ?? "")} required>
            <SelectTrigger>
              <SelectValue placeholder="Select location type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="offline">In-person</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Event date + time */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="event-date">Event date *</Label>
          <Input
            id="event-date"
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="event-time">Event time *</Label>
          <Input
            id="event-time"
            type="time"
            value={eventTime}
            onChange={(e) => setEventTime(e.target.value)}
            required
          />
        </div>
      </div>

      {/* Registration deadline */}
      <div className="space-y-2">
        <Label htmlFor="reg-deadline">Registration deadline</Label>
        <Input
          id="reg-deadline"
          type="date"
          value={registrationDeadline}
          onChange={(e) => setRegistrationDeadline(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Leave blank if there&apos;s no deadline.
        </p>
      </div>

      {/* Location details */}
      <div className="space-y-2">
        <Label htmlFor="location-details">Location details</Label>
        <Input
          id="location-details"
          value={locationDetails}
          onChange={(e) => setLocationDetails(e.target.value)}
          placeholder={
            locationType === "online"
              ? "e.g. Zoom link, platform name"
              : "e.g. Room 101, Engineering Building"
          }
        />
      </div>

      {/* External registration URL */}
      <div className="space-y-2">
        <Label htmlFor="reg-url">External registration URL</Label>
        <Input
          id="reg-url"
          type="url"
          value={registrationUrl}
          onChange={(e) => setRegistrationUrl(e.target.value)}
          placeholder="https://devpost.com/..."
        />
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
          Press Enter or click Add. Used to match students.
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
              Creating...
            </>
          ) : (
            "Create event"
          )}
        </Button>
      </div>
    </form>
  );
}
