import { prisma } from "../../database/prisma.js";
import type { ChatMessage } from "@eaa/types";
import { MOCK_USER_ID } from "../../common/user.js";
import { llmService } from "../ai/llm.service.js";
import type { Prisma } from "@prisma/client";

export class ConversationService {
  async create() {
    return prisma.conversation.create({
      data: {
        userId: MOCK_USER_ID,
        title: "新对话",
      },
    });
  }

  async getOrCreate(id?: string) {
    if (id) {
      const existing = await prisma.conversation.findUnique({ where: { id } });
      if (existing) return existing;
    }
    return this.create();
  }

  async list() {
    return prisma.conversation.findMany({
      where: {
        userId: MOCK_USER_ID,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  }

  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    const rows = await prisma.message.findMany({
      where: {
        conversationId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return rows.map((r) => ({
      id: r.id,
      role: r.role,
      content: r.content,
      type: r.messageType === "text" ? undefined : r.messageType,
      metadata: (r.metadata as Record<string, unknown>) ?? undefined,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async addMessage(conversationId: string, message: ChatMessage) {
    return prisma.message.create({
      data: {
        conversationId,
        role: message.role,
        content: message.content,
        messageType: message.type ?? "text",
        metadata: (message.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });
  }

  async delete(id: string) {
    await prisma.message.deleteMany({
      where: {
        conversationId: id,
      },
    });

    await prisma.conversation.delete({
      where: {
        id,
      },
    });
  }

  /**
   * 手动更新会话标题
   */
  async updateTitle(id: string, title: string) {
    return prisma.conversation.update({
      where: { id },
      data: { title },
    });
  }

  /**
   * 根据会话的首条用户消息，调用 LLM 智能生成会话标题并保存。
   * 仅在标题仍为默认值（"新对话"或空）时生成，避免覆盖用户手动修改的标题。
   */
  async generateSmartTitle(id: string) {
    const conversation = await prisma.conversation.findUnique({ where: { id } });
    if (!conversation) return null;
    if (conversation.title && conversation.title !== "新对话") return conversation;

    const firstUserMessage = await prisma.message.findFirst({
      where: { conversationId: id, role: "user" },
      orderBy: { createdAt: "asc" },
    });
    if (!firstUserMessage) return conversation;

    const title = await llmService.generateTitle(firstUserMessage.content);
    return this.updateTitle(id, title);
  }
}

export const conversationService = new ConversationService();
