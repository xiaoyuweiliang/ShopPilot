import { prisma } from "../../database/prisma.js";
import type { ChatMessage } from "@eaa/types";
import { MOCK_USER_ID } from "../../common/user.js";

export class ConversationService {
  async create() {
    return prisma.conversation.create({
      data: {
        userId: MOCK_USER_ID,
        title: "新对话",
      },
    });
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
        metadata: message.metadata ?? {},
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
}

export const conversationService = new ConversationService();
