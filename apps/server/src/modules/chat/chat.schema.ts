import { z } from "zod";

export const chatBodySchema = z.object({
  conversationId: z.string().uuid().optional(),
  message: z.string().min(1),
});

export const chatQuerySchema = z.object({
  payload: z.string().transform((s) => JSON.parse(s)),
});
