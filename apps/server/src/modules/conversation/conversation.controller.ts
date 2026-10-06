import { FastifyInstance } from "fastify";
import { conversationService } from "./conversation.service.js";
import { z } from "zod";

const idParamSchema = z.object({ id: z.string().uuid() });

const titleBodySchema = z.object({ title: z.string().min(1).max(50) });

export async function conversationRoutes(app: FastifyInstance) {
  /**
   * GET /api/conversations
   * 功能：查询当前用户的会话列表，按最近更新时间倒序。
   * 返回：会话数组。
   */
  app.get("/", async () => conversationService.list());

  /**
   * POST /api/conversations
   * 功能：创建一个新会话（标题默认为"新对话"）。
   * 返回：新创建的会话对象。
   */
  app.post("/", async () => conversationService.create());

  /**
   * GET /api/conversations/:id/messages
   * 功能：查询指定会话下的全部聊天消息，按时间正序排列。
   * 路径参数：id（会话 UUID）。
   * 返回：消息数组（含角色、内容、消息类型、元数据）。
   */
  app.get("/:id/messages", async (request, reply) => {
    const { id } = idParamSchema.parse(request.params);
    const messages = await conversationService.getMessages(id);
    return reply.send(messages);
  });

  /**
   * POST /api/conversations/:id/title
   * 功能：根据会话中的对话内容，调用 LLM 智能生成一个简短的会话标题并保存。
   *   仅在标题仍为默认值（"新对话"）时生效，不会覆盖已有标题。
   * 路径参数：id（会话 UUID）。
   * 返回：更新后的会话对象（含新标题）。
   */
  app.post("/:id/title", async (request, reply) => {
    const { id } = idParamSchema.parse(request.params);
    const conversation = await conversationService.generateSmartTitle(id);
    if (!conversation) return reply.status(404).send({ error: "Conversation not found" });
    return reply.send(conversation);
  });

  /**
   * PATCH /api/conversations/:id/title
   * 功能：手动修改会话标题。
   * 路径参数：id（会话 UUID）。
   * 请求体：{ title: 新标题（1-50 个字符） }
   * 返回：更新后的会话对象。
   */
  app.patch("/:id/title", async (request, reply) => {
    const { id } = idParamSchema.parse(request.params);
    const { title } = titleBodySchema.parse(request.body);
    const conversation = await conversationService.updateTitle(id, title);
    return reply.send(conversation);
  });

  /**
   * DELETE /api/conversations/:id
   * 功能：删除指定会话及其下的所有消息。
   * 路径参数：id（会话 UUID）。
   * 返回：{ ok: true }
   */
  app.delete("/:id", async (request, reply) => {
    const { id } = idParamSchema.parse(request.params);
    await conversationService.delete?.(id);
    return reply.send({ ok: true });
  });
}
