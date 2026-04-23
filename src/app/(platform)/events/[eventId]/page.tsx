import { notFound } from "next/navigation";
import Link from "next/link";
import {
  CalendarDays,
  MapPin,
  ExternalLink,
  ArrowLeft,
  Clock,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import { getUser } from "@/lib/get-user";
import { getEvent } from "@/actions/events";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InterestButton } from "@/components/events/interest-button";

const TYPE_LABELS: Record<string, string> = {
  hackathon: "Hackathon",
  academic: "Academic",
  workshop: "Workshop",
  other: "Other",
};

const LOCATION_LABELS: Record<string, string> = {
  online: "Online",
  offline: "In-person",
  hybrid: "Hybrid",
};

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const [user, event] = await Promise.all([getUser(), getEvent(eventId)]);

  if (!event) notFound();

  const eventDate = new Date(event.event_date);
  const isStudent = user.role === "student";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Back */}
      <Link
        href="/events"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to events
      </Link>

      {/* Header */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{TYPE_LABELS[event.event_type]}</Badge>
          <Badge variant="outline">
            {LOCATION_LABELS[event.location_type]}
          </Badge>
        </div>
        <h1 className="text-2xl font-bold sm:text-3xl">{event.title}</h1>

        {event.organizer && (
          <p className="text-sm text-muted-foreground">
            Organised by{" "}
            <span className="font-medium text-foreground">
              {event.organizer.full_name}
            </span>
          </p>
        )}
      </div>

      {/* Meta row */}
      <div className="flex flex-col gap-2 rounded-lg border bg-card p-4 text-sm sm:flex-row sm:flex-wrap sm:gap-x-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <CalendarDays className="size-4 shrink-0" />
          <span>
            <span className="font-medium text-foreground">
              {format(eventDate, "EEEE, MMMM d, yyyy")}
            </span>{" "}
            at {format(eventDate, "h:mm a")}
          </span>
        </div>

        {event.registration_deadline && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="size-4 shrink-0" />
            <span>
              Register by{" "}
              <span className="font-medium text-foreground">
                {format(new Date(event.registration_deadline), "MMM d, yyyy")}
              </span>
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="size-4 shrink-0" />
          <span>
            {LOCATION_LABELS[event.location_type]}
            {event.location_details && (
              <> — <span className="text-foreground">{event.location_details}</span></>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="size-4 shrink-0" />
          <span>
            <span className="font-medium text-foreground">
              {event.interest_count}
            </span>{" "}
            {event.interest_count === 1 ? "student" : "students"} interested
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <h2 className="font-semibold">About this event</h2>
        <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
          {event.description}
        </p>
      </div>

      {/* Required skills */}
      {event.required_skills.length > 0 && (
        <div className="space-y-2">
          <h2 className="font-semibold">Required skills</h2>
          <div className="flex flex-wrap gap-2">
            {event.required_skills.map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pt-2">
        {event.registration_url && (
          <Button render={<Link href={event.registration_url} target="_blank" rel="noopener noreferrer" />}>
            Register now
            <ExternalLink className="ml-2 size-4" />
          </Button>
        )}

        {isStudent && (
          <InterestButton
            eventId={event.id}
            initialInterested={event.currentUserInterested}
            initialCount={event.interest_count}
          />
        )}
      </div>
    </div>
  );
}
