import { conversationService } from "../conversation/conversation.service.js";
import { productService } from "../product/product.service.js";
import { llmService } from "../ai/llm.service.js";
import type { ChatMessage } from "@eaa/types";

export class ChatService {
  async *streamChat(conversationId: string | undefined, message: string) {
    const id = conversationId ?? (await conversationService.create()).id;
    await conversationService.addMessage(id, { role: "user", content: message });

    yield { type: "thinking", content: "正在理解你的需求..." } as ChatMessage;

    const intent = await llmService.extractIntent(message);
    yield { type: "text", content: `已识别意图：${JSON.stringify(intent)}` } as ChatMessage;

    yield { type: "thinking", content: "正在检索商品..." } as ChatMessage;
    const products = await productService.search(intent);

    yield { type: "text", content: `为你找到 ${products.length} 款相关商品：` } as ChatMessage;
    for (const product of products.slice(0, 3)) {
      yield {
        type: "product",
        content: product.name,
        metadata: { productId: product.id },
      } as ChatMessage;
    }

    yield { type: "thinking", content: "正在生成推荐理由..." } as ChatMessage;
    const recommendation = await llmService.generateRecommendation(message, intent, products.slice(0, 3));
    yield { type: "text", content: recommendation } as ChatMessage;

    await conversationService.addMessage(id, {
      role: "assistant",
      content: recommendation,
      metadata: { intent, products: products.slice(0, 3).map((p) => p.id) },
    });
  }
}

export const chatService = new ChatService();
