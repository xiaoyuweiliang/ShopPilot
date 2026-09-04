import OpenAI from "openai";
import { env } from "../../config/env.js";

class EmbeddingService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: env.EMBEDDING_API_KEY ?? env.LLM_API_KEY,
      baseURL: env.EMBEDDING_BASE_URL ?? env.LLM_BASE_URL,
    });
  }

  async embed(text: string): Promise<number[]> {
    const res = await this.client.embeddings.create({
      model: env.EMBEDDING_MODEL,
      input: text,
    });
    return res.data[0].embedding;
  }
}

export const embeddingService = new EmbeddingService();
