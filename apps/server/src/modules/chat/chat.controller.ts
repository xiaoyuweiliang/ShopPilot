import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { chatService } from "./chat.service.js";
import { chatQuerySchema } from "./chat.schema.js";

export async function chatRoutes(app: FastifyInstance) {
  /**
   * GET /api/chat
   * 功能：AI 导购聊天接口，以 SSE（Server-Sent Events）流式返回回复。
   * Query 参数：payload（JSON 字符串），格式为 { conversationId?: 会话UUID, message: 用户消息 }。
   * 流程：保存用户消息 → 识别购物意图 → 从数据库检索商品 → 生成推荐理由，
   *   每个阶段通过 SSE 事件实时推送给前端，最后将会话记录存入数据库。
   * 返回：text/event-stream 事件流，事件类型包括 thinking / text / product / error，结束时推送 [DONE]。
   */
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
