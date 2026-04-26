import { z } from "zod";
import { MAX_IMAGE_SIZE, ACCEPTED_IMAGE_TYPES } from "@/lib/constants";

export const onboardingStep1Schema = z.object({
  full_name: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be at most 100 characters"),
  bio: z.string().max(500, "Bio must be at most 500 characters"),
});

export const onboardingStep2Schema = z.object({
  university: z.string().max(200, "University name is too long"),
  program: z.string().max(200, "Program name is too long"),
  graduation_year: z.string().refine(
    (val) => {
      if (!val) return true;
      const num = Number(val);
      return Number.isInteger(num) && num >= 2000 && num <= 2040;
    },
    { message: "Please enter a valid graduation year (2000–2040)" }
  ),
});

export const onboardingStep3Schema = z.object({
  skills: z.array(z.string().min(1).max(50)).max(30, "Maximum 30 skills"),
});

const optionalUrl = z
  .string()
  .refine((val) => !val || /^https?:\/\/.+/.test(val), {
    message: "Please enter a valid URL (http:// or https://)",
  });

export const onboardingStep4Schema = z.object({
  github_url: optionalUrl,
  linkedin_url: optionalUrl,
  website_url: optionalUrl,
});

export const avatarFileSchema = z
  .instanceof(File)
  .refine(
    (file) => file.size <= MAX_IMAGE_SIZE,
    "Image must be less than 5MB"
  )
  .refine(
    (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
    "Only JPEG, PNG, WebP, and GIF images are accepted"
  )
  .optional();

export const completeOnboardingSchema = z.object({
  full_name: z.string().min(2).max(100),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/),
  bio: z.string().max(500),
  university: z.string().max(200),
  program: z.string().max(200),
  graduation_year: z.string(),
  skills: z.array(z.string().min(1).max(50)).max(30),
  github_url: z.string(),
  linkedin_url: z.string(),
  website_url: z.string(),
});

export type OnboardingStep1Input = z.infer<typeof onboardingStep1Schema>;
export type OnboardingStep2Input = z.infer<typeof onboardingStep2Schema>;
export type OnboardingStep3Input = z.infer<typeof onboardingStep3Schema>;
export type OnboardingStep4Input = z.infer<typeof onboardingStep4Schema>;
export type CompleteOnboardingInput = z.infer<typeof completeOnboardingSchema>;
