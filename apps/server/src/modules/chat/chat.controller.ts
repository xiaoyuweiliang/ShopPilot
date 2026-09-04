import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { chatService } from "./chat.service.js";
import { chatQuerySchema } from "./chat.schema.js";

export async function chatRoutes(app: FastifyInstance) {
  app.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
    const { payload } = chatQuerySchema.parse(request.query);
    const { conversationId, message } = payload as { conversationId?: string; message: string };

    reply.raw.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    try {
      for await (const chunk of chatService.streamChat(conversationId, message)) {
        reply.raw.write(`data: ${JSON.stringify(chunk)}\n\n`);
      }
      reply.raw.write("data: [DONE]\n\n");
    } catch (err) {
      reply.raw.write(`data: ${JSON.stringify({ type: "error", content: (err as Error).message })}\n\n`);
    } finally {
      reply.raw.end();
    }
  });
}
