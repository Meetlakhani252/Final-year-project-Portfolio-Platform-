import { z } from "zod";

export const forumPostSchema = z.object({
  categoryId: z.string().uuid("Invalid category."),
  title: z
    .string()
    .min(1, "Title is required.")
    .max(200, "Title must be at most 200 characters."),
  content: z.any().refine((v) => v !== null && v !== undefined, {
    message: "Content is required.",
  }),
});
