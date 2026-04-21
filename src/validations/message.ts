import { z } from "zod";

export const messageSchema = z.object({
  content: z
    .string()
    .min(1, "Message cannot be empty.")
    .max(5000, "Message must be at most 5000 characters."),
});

export type MessageInput = z.infer<typeof messageSchema>;
