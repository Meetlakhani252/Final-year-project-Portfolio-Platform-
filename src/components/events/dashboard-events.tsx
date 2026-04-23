import Link from "next/link";
import { CalendarDays, MapPin, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getUpcomingEventsForDashboard,
  getInterestedEvents,
  type EventItem,
} from "@/actions/events";

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

function EventRow({ event }: { event: EventItem }) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="flex items-start gap-3 rounded-md px-3 py-2.5 hover:bg-accent/50 transition-colors -mx-3"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm leading-snug">{event.title}</span>
          {event.relevantToUser && (
            <Badge variant="default" className="text-xs gap-1 shrink-0 py-0">
              <Sparkles className="size-3" />
              Relevant
            </Badge>
          )}
          {event.currentUserInterested && (
            <Badge variant="secondary" className="text-xs shrink-0 py-0">
              Interested
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1">
            <CalendarDays className="size-3 shrink-0" />
            {format(new Date(event.event_date), "MMM d, yyyy")}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="size-3 shrink-0" />
            {LOCATION_LABELS[event.location_type] ?? event.location_type}
          </span>
          <span className="text-muted-foreground/70">
            {TYPE_LABELS[event.event_type] ?? event.event_type}
          </span>
        </div>
      </div>
    </Link>
  );
}

export async function DashboardEvents() {
  const [upcoming, interested] = await Promise.all([
    getUpcomingEventsForDashboard(),
    getInterestedEvents(),
  ]);

  if (upcoming.length === 0 && interested.length === 0) return null;

  return (
    <div className="space-y-6">
      {upcoming.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Upcoming Events</h2>
            <Button render={<Link href="/events" />} variant="ghost" size="sm">
              View all
            </Button>
          </div>
          <div className="rounded-lg border bg-card px-3 py-1">
            {upcoming.map((event) => (
              <EventRow key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}

      {interested.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">My Interested Events</h2>
            <Button render={<Link href="/events" />} variant="ghost" size="sm">
              View all
            </Button>
          </div>
          <div className="rounded-lg border bg-card px-3 py-1">
            {interested.map((event) => (
              <EventRow key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
