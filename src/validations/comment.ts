import { z } from "zod";

export const commentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment cannot be empty.")
    .max(2000, "Comment must be at most 2000 characters."),
  target_type: z.enum(["project", "blog_post"]),
  target_id: z.string().uuid("Invalid target."),
});

export type CommentInput = z.infer<typeof commentSchema>;
