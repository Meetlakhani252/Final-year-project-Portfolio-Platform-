import { Suspense } from "react";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { getUser } from "@/lib/get-user";
import { getEvents, getOrganizerEvents, type EventFilters } from "@/actions/events";
import { EventCard } from "@/components/events/event-card";
import { EventsFilter } from "@/components/events/events-filter";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Events — StudentPortfolio",
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
      <div className="rounded-2xl bg-linear-to-r from-indigo-600 to-purple-600 p-8 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              {isOrganizer ? "My Events" : "Events"}
            </h1>
            <p className="mt-1 text-sm text-white/80 font-sans font-normal">
              {isOrganizer
                ? "Events and hackathons you have organised."
                : "Discover upcoming hackathons, workshops, and academic events."}
            </p>
          </div>
          {isOrganizer && (
            <Link
              href="/events/create"
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors"
            >
              <PlusCircle className="size-4" />
              Create event
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
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white py-16 text-center shadow-sm">
          <p className="text-muted-foreground text-sm">
            {isOrganizer
              ? "You haven't created any events yet."
              : "No upcoming events found."}
          </p>
          {isOrganizer && (
            <Button
              render={<Link href="/events/create" />}
              variant="outline"
              size="sm"
              className="mt-4"
            >
              Create your first event
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
