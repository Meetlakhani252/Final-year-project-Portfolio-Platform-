import { redirect } from "next/navigation";
import { getUser } from "@/lib/get-user";
import { EventForm } from "@/components/events/event-form";

export const metadata = {
  title: "Create Event — Profolio",
};

export default async function CreateEventPage() {
  const user = await getUser();

  if (user.role !== "organizer") {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create event</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Post a new hackathon, competition, or workshop for students to discover.
        </p>
      </div>

      <EventForm />
    </div>
  );
}
