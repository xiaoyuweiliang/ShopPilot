import { conversationService } from "../conversation/conversation.service.js";
import { productService } from "../product/product.service.js";
import { llmService } from "../ai/llm.service.js";
import type { ChatMessage } from "@eaa/types";

export class ChatService {
  async *streamChat(conversationId: string | undefined, message: string) {
    const conversation = await conversationService.getOrCreate(conversationId);
    const id = conversation.id;
    await conversationService.addMessage(id, {
      role: "user",
      content: message,
    });

    yield { type: "thinking", content: "正在理解你的需求..." } as ChatMessage;

    const intent = await llmService.extractIntent(message);

    yield { type: "thinking", content: "正在检索商品..." } as ChatMessage;
    const products = await productService.search(intent);

    yield {
      type: "text",
      content: `为你找到 ${products.length} 款相关商品：`,
    } as ChatMessage;
    for (const product of products.slice(0, 3)) {
      yield {
        role: "assistant",
        type: "product",
        content: product.name,
        metadata: { productId: product.id },
      } as ChatMessage;
    }

    yield { type: "thinking", content: "正在生成推荐理由..." } as ChatMessage;
    const recommendation = await llmService.generateRecommendation(
      message,
      intent,
      products.slice(0, 3),
    );
    yield { type: "text", content: recommendation } as ChatMessage;

    await conversationService.addMessage(id, {
      role: "assistant",
      content: recommendation,
      metadata: { intent, products: products.slice(0, 3).map((p) => p.id) },
    });

    // 聊天流结束后，为首轮对话异步生成智能标题（避免与意图识别并发调用 LLM 触发限流）
    if (!conversation.title || conversation.title === "新对话") {
      conversationService
        .generateSmartTitle(id)
        .catch((err) => console.error("生成会话标题失败:", err));
    }
  }
}

export const chatService = new ChatService();
