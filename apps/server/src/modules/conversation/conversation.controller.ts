import { FastifyInstance } from "fastify";
import { conversationService } from "./conversation.service.js";
import { z } from "zod";

const idParamSchema = z.object({ id: z.string().uuid() });

export async function conversationRoutes(app: FastifyInstance) {
  app.get("/", async () => conversationService.list());

  app.post("/", async () => conversationService.create());

  app.get("/:id/messages", async (request, reply) => {
    const { id } = idParamSchema.parse(request.params);
    const messages = await conversationService.getMessages(id);
    return reply.send(messages);
  });

  app.delete("/:id", async (request, reply) => {
    const { id } = idParamSchema.parse(request.params);
    await conversationService.delete?.(id);
    return reply.send({ ok: true });
  });
}
