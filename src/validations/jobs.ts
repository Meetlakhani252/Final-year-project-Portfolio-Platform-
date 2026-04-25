import { z } from "zod";

export const createJobSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required.")
    .max(200, "Title must be at most 200 characters."),
  company: z
    .string()
    .min(1, "Company name is required.")
    .max(200, "Company must be at most 200 characters."),
  type: z.enum(["job", "internship"], { message: "Select job or internship." }),
  location: z.string().max(200).nullable().optional(),
  location_type: z.enum(["onsite", "remote", "hybrid"], {
    message: "Select a location type.",
  }),
  salary_min: z.number().int().positive().nullable().optional(),
  salary_max: z.number().int().positive().nullable().optional(),
  description: z
    .string()
    .min(1, "Description is required.")
    .max(10000, "Description must be at most 10,000 characters."),
  required_skills: z.array(z.string().max(50)).max(20).default([]),
  application_deadline: z.string().nullable().optional(),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;

export const applyToJobSchema = z.object({
  job_id: z.string().uuid(),
  cover_letter: z.string().max(3000, "Cover letter must be at most 3,000 characters.").nullable().optional(),
});

export type ApplyToJobInput = z.infer<typeof applyToJobSchema>;
