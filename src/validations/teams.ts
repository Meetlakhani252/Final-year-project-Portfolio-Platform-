import { z } from "zod";

export const createTeamPostSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required.")
    .max(200, "Title must be at most 200 characters."),
  description: z
    .string()
    .min(1, "Description is required.")
    .max(3000, "Description must be at most 3000 characters."),
  required_skills: z.array(z.string().max(50)).max(20).default([]),
  team_size_needed: z.number().int().min(1).max(50).default(1),
  contact_preference: z.enum(["dm", "comment", "both"]).default("both"),
  event_id: z.string().uuid().nullable().optional(),
});

export type CreateTeamPostInput = z.infer<typeof createTeamPostSchema>;

export const teamCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment cannot be empty.")
    .max(1000, "Comment must be at most 1000 characters."),
});
