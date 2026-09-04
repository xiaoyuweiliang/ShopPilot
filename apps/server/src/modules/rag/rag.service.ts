import { embeddingService } from "../ai/embedding.service.js";
import type { Product, IntentResult } from "@eaa/types";

export class RAGService {
  async search(intent: IntentResult): Promise<Product[]> {
    const text = [intent.category, intent.scene, intent.keyword].filter(Boolean).join(" ");
    await embeddingService.embed(text);
    return [];
  }
}

export const ragService = new RAGService();
