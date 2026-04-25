"use server";

import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/get-user";
import { createEventSchema, type CreateEventInput } from "@/validations/events";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/lib/create-notification";

export type EventItem = {
  id: string;
  title: string;
  description: string;
  event_type: "hackathon" | "academic" | "workshop" | "other";
  event_date: string;
  registration_deadline: string | null;
  location_type: "online" | "offline" | "hybrid";
  location_details: string | null;
  required_skills: string[];
  registration_url: string | null;
  interest_count: number;
  created_at: string;
  organizer: {
    id: string;
    full_name: string;
    username: string | null;
    avatar_url: string | null;
  } | null;
  currentUserInterested?: boolean;
  relevantToUser?: boolean;
};

export type EventFilters = {
  event_type?: string;
  date_from?: string;
  date_to?: string;
  skills?: string[];
};

export async function createEvent(
  data: CreateEventInput
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const user = await getUser();

  if (user.role !== "organizer") {
    return { ok: false, error: "Only organizers can create events." };
  }

  const parsed = createEventSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();

  const insertData = {
    organizer_id: user.id,
    title: parsed.data.title,
    description: parsed.data.description,
    event_type: parsed.data.event_type,
    event_date: parsed.data.event_date,
    registration_deadline: parsed.data.registration_deadline ?? null,
    location_type: parsed.data.location_type,
    location_details: parsed.data.location_details ?? null,
    required_skills: parsed.data.required_skills,
    registration_url:
      parsed.data.registration_url && parsed.data.registration_url !== ""
        ? parsed.data.registration_url
        : null,
  };

  const { data: event, error } = await supabase
    .from("events")
    .insert(insertData)
    .select("id")
    .single();

  if (error) {
    return { ok: false, error: "Failed to create event. Please try again." };
  }

  revalidatePath("/events");

  // Notify students whose skills overlap with this event's required_skills
  if (parsed.data.required_skills.length > 0) {
    const { data: matchingStudents } = await supabase
      .from("skills")
      .select("profile_id")
      .in("name", parsed.data.required_skills);

    if (matchingStudents && matchingStudents.length > 0) {
      const uniqueStudentIds = [
        ...new Set(matchingStudents.map((s) => s.profile_id)),
      ].filter((id) => id !== user.id);

      const skillList = parsed.data.required_skills.slice(0, 3).join(", ");
      const body =
        parsed.data.required_skills.length > 3
          ? `Matches your skills: ${skillList} and more`
          : `Matches your skills: ${skillList}`;

      await Promise.all(
        uniqueStudentIds.map((studentId) =>
          createNotification(
            supabase,
            studentId,
            "event_new",
            `New event: ${parsed.data.title}`,
            body,
            `/events/${event.id}`
          )
        )
      );
    }
  }

  return { ok: true, id: event.id };
}

export async function getEvents(
  filters: EventFilters = {}
): Promise<EventItem[]> {
  const supabase = await createClient();

  let query = supabase
    .from("events")
    .select(
      `
      id, title, description, event_type, event_date, registration_deadline,
      location_type, location_details, required_skills, registration_url,
      interest_count, created_at,
      organizer:profiles!events_organizer_id_fkey(id, full_name, username, avatar_url)
    `
    )
    .gte("event_date", new Date().toISOString())
    .order("event_date", { ascending: true });

  if (filters.event_type) {
    query = query.eq(
      "event_type",
      filters.event_type as "hackathon" | "academic" | "workshop" | "other"
    );
  }

  if (filters.date_from) {
    query = query.gte("event_date", filters.date_from);
  }

  if (filters.date_to) {
    query = query.lte("event_date", filters.date_to);
  }

  if (filters.skills && filters.skills.length > 0) {
    query = query.overlaps("required_skills", filters.skills);
  }

  const { data, error } = await query;

  if (error || !data) return [];

  let interestedEventIds = new Set<string>();
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: interests } = await supabase
        .from("event_interests")
        .select("event_id")
        .eq("profile_id", user.id);
      interestedEventIds = new Set((interests ?? []).map((i) => i.event_id));
    }
  } catch {
    // Not authenticated — interests stay empty
  }

  return data.map((row) => ({
    ...row,
    organizer: Array.isArray(row.organizer) ? row.organizer[0] ?? null : row.organizer,
    currentUserInterested: interestedEventIds.has(row.id),
  }));
}

export async function getOrganizerEvents(): Promise<EventItem[]> {
  const user = await getUser();

  if (user.role !== "organizer") return [];

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .select(
      `
      id, title, description, event_type, event_date, registration_deadline,
      location_type, location_details, required_skills, registration_url,
      interest_count, created_at,
      organizer:profiles!events_organizer_id_fkey(id, full_name, username, avatar_url)
    `
    )
    .eq("organizer_id", user.id)
    .order("event_date", { ascending: true });

  if (error || !data) return [];

  return data.map((row) => ({
    ...row,
    organizer: Array.isArray(row.organizer) ? row.organizer[0] ?? null : row.organizer,
    currentUserInterested: false,
  }));
}

export async function getEvent(
  eventId: string
): Promise<(EventItem & { currentUserInterested: boolean }) | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .select(
      `
      id, title, description, event_type, event_date, registration_deadline,
      location_type, location_details, required_skills, registration_url,
      interest_count, created_at,
      organizer:profiles!events_organizer_id_fkey(id, full_name, username, avatar_url)
    `
    )
    .eq("id", eventId)
    .single();

  if (error || !data) return null;

  let currentUserInterested = false;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: interest } = await supabase
        .from("event_interests")
        .select("id")
        .eq("event_id", eventId)
        .eq("profile_id", user.id)
        .maybeSingle();
      currentUserInterested = !!interest;
    }
  } catch {
    // Not authenticated
  }

  return {
    ...data,
    organizer: Array.isArray(data.organizer) ? data.organizer[0] ?? null : data.organizer,
    currentUserInterested,
  };
}

export async function toggleInterest(
  eventId: string
): Promise<{ ok: true; interested: boolean } | { ok: false; error: string }> {
  const user = await getUser();

  if (user.role !== "student") {
    return { ok: false, error: "Only students can mark interest." };
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("event_interests")
    .select("id")
    .eq("event_id", eventId)
    .eq("profile_id", user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("event_interests")
      .delete()
      .eq("id", existing.id);

    if (error) return { ok: false, error: "Failed to remove interest." };

    const { data: ev } = await supabase
      .from("events")
      .select("interest_count")
      .eq("id", eventId)
      .single();
    if (ev) {
      await supabase
        .from("events")
        .update({ interest_count: Math.max(0, ev.interest_count - 1) })
        .eq("id", eventId);
    }

    revalidatePath(`/events/${eventId}`);
    revalidatePath("/events");
    return { ok: true, interested: false };
  }

  const { error } = await supabase.from("event_interests").insert({
    event_id: eventId,
    profile_id: user.id,
  });

  if (error) return { ok: false, error: "Failed to mark interest." };

  const { data: ev } = await supabase
    .from("events")
    .select("interest_count")
    .eq("id", eventId)
    .single();
  if (ev) {
    await supabase
      .from("events")
      .update({ interest_count: ev.interest_count + 1 })
      .eq("id", eventId);
  }

  revalidatePath(`/events/${eventId}`);
  revalidatePath("/events");
  return { ok: true, interested: true };
}

export async function getUpcomingEventsForDashboard(): Promise<EventItem[]> {
  const supabase = await createClient();

  let studentSkills: string[] = [];
  let interestedEventIds = new Set<string>();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const [{ data: skillsData }, { data: interests }] = await Promise.all([
        supabase.from("skills").select("name").eq("profile_id", user.id),
        supabase
          .from("event_interests")
          .select("event_id")
          .eq("profile_id", user.id),
      ]);
      studentSkills = (skillsData ?? []).map((s) => s.name.toLowerCase());
      interestedEventIds = new Set((interests ?? []).map((i) => i.event_id));
    }
  } catch {
    // Not authenticated
  }

  const { data, error } = await supabase
    .from("events")
    .select(
      `
      id, title, description, event_type, event_date, registration_deadline,
      location_type, location_details, required_skills, registration_url,
      interest_count, created_at,
      organizer:profiles!events_organizer_id_fkey(id, full_name, username, avatar_url)
    `
    )
    .gte("event_date", new Date().toISOString())
    .order("event_date", { ascending: true })
    .limit(5);

  if (error || !data) return [];

  return data.map((row) => ({
    ...row,
    organizer: Array.isArray(row.organizer)
      ? row.organizer[0] ?? null
      : row.organizer,
    currentUserInterested: interestedEventIds.has(row.id),
    relevantToUser:
      studentSkills.length > 0 &&
      row.required_skills.some((s) => studentSkills.includes(s.toLowerCase())),
  }));
}

export async function getInterestedEvents(): Promise<EventItem[]> {
  const supabase = await createClient();

  let userId: string | null = null;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  } catch {
    return [];
  }

  if (!userId) return [];

  const { data: interests } = await supabase
    .from("event_interests")
    .select("event_id")
    .eq("profile_id", userId);

  if (!interests || interests.length === 0) return [];

  const eventIds = interests.map((i) => i.event_id);

  const { data, error } = await supabase
    .from("events")
    .select(
      `
      id, title, description, event_type, event_date, registration_deadline,
      location_type, location_details, required_skills, registration_url,
      interest_count, created_at,
      organizer:profiles!events_organizer_id_fkey(id, full_name, username, avatar_url)
    `
    )
    .in("id", eventIds)
    .gte("event_date", new Date().toISOString())
    .order("event_date", { ascending: true });

  if (error || !data) return [];

  return data.map((row) => ({
    ...row,
    organizer: Array.isArray(row.organizer)
      ? row.organizer[0] ?? null
      : row.organizer,
    currentUserInterested: true,
  }));
}
