import { z } from "zod";
import { MAX_IMAGE_SIZE, ACCEPTED_IMAGE_TYPES } from "@/lib/constants";

export const aboutSchema = z.object({
  full_name: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be at most 100 characters"),
  bio: z.string().max(500, "Bio must be at most 500 characters").optional(),
  university: z.string().max(200, "University name is too long").optional(),
  program: z.string().max(200, "Program name is too long").optional(),
  graduation_year: z
    .number()
    .int()
    .min(2000, "Year must be 2000 or later")
    .max(2040, "Year must be 2040 or earlier")
    .nullable()
    .optional(),
  gpa: z
    .number()
    .min(0, "GPA must be at least 0")
    .max(10, "GPA must be at most 10")
    .nullable()
    .optional(),
  gpa_public: z.boolean().optional(),
});

export type AboutInput = z.infer<typeof aboutSchema>;

export const avatarFileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= MAX_IMAGE_SIZE, "Image must be less than 5MB")
  .refine(
    (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
    "Only JPEG, PNG, WebP, and GIF images are accepted"
  );

export const MAX_SCREENSHOTS_PER_PROJECT = 5;

const optionalUrl = z
  .string()
  .trim()
  .refine((val) => !val || /^https?:\/\/.+/.test(val), {
    message: "Enter a valid URL (http:// or https://)",
  });

export const projectSchema = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(150, "Title must be at most 150 characters"),
  description: z
    .string()
    .max(2000, "Description must be at most 2000 characters"),
  tech_stack: z
    .array(z.string().min(1).max(40))
    .max(20, "At most 20 technologies"),
  github_url: optionalUrl,
  live_url: optionalUrl,
});

export type ProjectInput = z.infer<typeof projectSchema>;

export const skillSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Skill name is required")
    .max(50, "Skill name must be at most 50 characters"),
});

export type SkillInput = z.infer<typeof skillSchema>;

export const projectScreenshotFileSchema = z
  .instanceof(File)
  .refine(
    (file) => file.size <= MAX_IMAGE_SIZE,
    "Each screenshot must be less than 5MB"
  )
  .refine(
    (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
    "Screenshots must be JPEG, PNG, WebP, or GIF"
  );
