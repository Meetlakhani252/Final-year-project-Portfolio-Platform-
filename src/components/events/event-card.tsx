import Link from "next/link";
import { CalendarDays, MapPin, Users, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { format } from "date-fns";
import type { EventItem } from "@/actions/events";
import { InterestButton } from "@/components/events/interest-button";

const TYPE_LABELS: Record<EventItem["event_type"], string> = {
  hackathon: "Hackathon",
  academic: "Academic",
  workshop: "Workshop",
  other: "Other",
};

const TYPE_VARIANTS: Record<
  EventItem["event_type"],
  "default" | "secondary" | "outline"
> = {
  hackathon: "default",
  academic: "secondary",
  workshop: "outline",
  other: "outline",
};

const LOCATION_LABELS: Record<EventItem["location_type"], string> = {
  online: "Online",
  offline: "In-person",
  hybrid: "Hybrid",
};

export function EventCard({
  event,
  isStudent = false,
}: {
  event: EventItem;
  isStudent?: boolean;
}) {
  const eventDate = new Date(event.event_date);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <Link
            href={`/events/${event.id}`}
            className="font-semibold text-base leading-snug line-clamp-2 hover:underline"
          >
            {event.title}
          </Link>
          <Badge variant={TYPE_VARIANTS[event.event_type]} className="shrink-0">
            {TYPE_LABELS[event.event_type]}
          </Badge>
        </div>
        {event.relevantToUser && (
          <div className="flex items-center gap-1 text-xs text-primary font-medium mt-1">
            <Sparkles className="size-3" />
            Relevant to your skills
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-3.5 shrink-0" />
            <span>{format(eventDate, "MMM d, yyyy · h:mm a")}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="size-3.5 shrink-0" />
            <span>{LOCATION_LABELS[event.location_type]}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="size-3.5 shrink-0" />
            <span>
              {event.interest_count}{" "}
              {event.interest_count === 1 ? "interested" : "interested"}
            </span>
          </div>
        </div>

        {event.required_skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {event.required_skills.slice(0, 5).map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {event.required_skills.length > 5 && (
              <Badge variant="secondary" className="text-xs">
                +{event.required_skills.length - 5}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="gap-2 pt-0">
        <Button
          render={<Link href={`/events/${event.id}`} />}
          variant="outline"
          size="sm"
          className="flex-1"
        >
          View details
        </Button>
        {isStudent && (
          <InterestButton
            eventId={event.id}
            initialInterested={event.currentUserInterested ?? false}
            initialCount={event.interest_count}
            compact
          />
        )}
      </CardFooter>
    </Card>
  );
}
