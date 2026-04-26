import { Suspense } from "react";
import Link from "next/link";
import { PlusCircle, CalendarDays } from "lucide-react";
import { getUser } from "@/lib/get-user";
import { getEvents, getOrganizerEvents, type EventFilters } from "@/actions/events";
import { EventCard } from "@/components/events/event-card";
import { EventsFilter } from "@/components/events/events-filter";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Events — Profolio",
};

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getUser();
  const params = await searchParams;

  const isOrganizer = user.role === "organizer";

  let events;

  if (isOrganizer) {
    events = await getOrganizerEvents();
  } else {
    const skills = params.skill
      ? Array.isArray(params.skill)
        ? params.skill
        : [params.skill]
      : [];

    const filters: EventFilters = {
      event_type: typeof params.type === "string" ? params.type : undefined,
      date_from:
        typeof params.date_from === "string" ? params.date_from : undefined,
      date_to: typeof params.date_to === "string" ? params.date_to : undefined,
      skills: skills.length > 0 ? skills : undefined,
    };

    events = await getEvents(filters);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="glass-card p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 transition-transform group-hover:scale-110">
          <CalendarDays className="size-24 text-primary" />
        </div>
        <div className="flex items-start justify-between gap-4 relative z-10">
          <div>
            <h1 className="font-mono text-3xl font-bold tracking-tight text-white">
              <span className="text-primary">Module:</span> {isOrganizer ? "My Events" : "Events"}
            </h1>
            <p className="mt-2 text-muted-foreground font-sans font-normal max-w-lg">
              {isOrganizer
                ? "Manage your organized sequences and hackathon events."
                : "Discover upcoming hackathons, workshops, and academic events in the network."}
            </p>
          </div>
          {isOrganizer && (
            <Link
              href="/events/create"
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-mono font-bold text-sm hover:opacity-90 transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)]"
            >
              <PlusCircle className="size-4" />
              Initialize Event
            </Link>
          )}
        </div>
      </div>

      {/* Filters — students only */}
      {!isOrganizer && (
        <Suspense fallback={null}>
          <EventsFilter />
        </Suspense>
      )}

      {/* Events grid */}
      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-primary/20 bg-primary/5 py-16 text-center">
          <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <CalendarDays className="size-6 text-primary/40" />
          </div>
          <p className="text-muted-foreground font-mono text-sm uppercase tracking-wider">
            {isOrganizer
              ? "Zero event protocols found"
              : "No upcoming event sequences found"}
          </p>
          {isOrganizer && (
            <Button
              render={<Link href="/events/create" />}
              variant="outline"
              size="sm"
              className="mt-6 border-primary/30 text-primary hover:bg-primary/10"
            >
              Create first event
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} isStudent={!isOrganizer && user.role === "student"} />
          ))}
        </div>
      )}
    </div>
  );
}
