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

export const certificationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(150, "Name must be at most 150 characters"),
  issuer: z
    .string()
    .trim()
    .min(2, "Issuer must be at least 2 characters")
    .max(150, "Issuer must be at most 150 characters"),
  issue_date: z.string().nullable().optional(),
  credential_url: z
    .string()
    .trim()
    .refine((val) => !val || /^https?:\/\/.+/.test(val), {
      message: "Enter a valid URL (http:// or https://)",
    })
    .optional(),
});

export type CertificationInput = z.infer<typeof certificationSchema>;

export const educationSchema = z.object({
  institution: z
    .string()
    .trim()
    .min(2, "Institution must be at least 2 characters")
    .max(200, "Institution must be at most 200 characters"),
  degree: z
    .string()
    .trim()
    .min(2, "Degree must be at least 2 characters")
    .max(200, "Degree must be at most 200 characters"),
  field_of_study: z
    .string()
    .trim()
    .max(200, "Field of study must be at most 200 characters")
    .optional(),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  gpa: z
    .number()
    .min(0, "GPA must be at least 0")
    .max(10, "GPA must be at most 10")
    .nullable()
    .optional(),
  courses: z
    .array(z.string().trim().min(1).max(100))
    .max(30, "At most 30 courses")
    .optional(),
});

export type EducationInput = z.infer<typeof educationSchema>;

export const blogPostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(200, "Title must be at most 200 characters"),
  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters")
    .max(200, "Slug must be at most 200 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens"),
  content: z.any(),
  content_plain: z.string().nullable().optional(),
});

export type BlogPostInput = z.infer<typeof blogPostSchema>;

export const socialLinksSchema = z.object({
  links: z.array(
    z.object({
      platform: z.enum(["github", "linkedin", "website", "twitter", "other"]),
      url: z
        .string()
        .trim()
        .refine((val) => !val || /^https?:\/\/.+/.test(val), {
          message: "Enter a valid URL",
        }),
    })
  ),
});

export type SocialLinksInput = z.infer<typeof socialLinksSchema>;

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
