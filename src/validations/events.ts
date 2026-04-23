import { z } from "zod";

export const createEventSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required.")
    .max(200, "Title must be at most 200 characters."),
  description: z
    .string()
    .min(1, "Description is required.")
    .max(5000, "Description must be at most 5000 characters."),
  event_type: z.enum(["hackathon", "academic", "workshop", "other"]),
  event_date: z.string().min(1, "Event date is required."),
  registration_deadline: z.string().nullable().optional(),
  location_type: z.enum(["online", "offline", "hybrid"]),
  location_details: z.string().max(500).nullable().optional(),
  required_skills: z.array(z.string().max(50)).max(20).default([]),
  registration_url: z
    .string()
    .url("Must be a valid URL.")
    .nullable()
    .optional()
    .or(z.literal("")),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
