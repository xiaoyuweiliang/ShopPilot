import OpenAI from "openai";
import { env } from "../../config/env.js";
import type { Product, IntentResult } from "@eaa/types";

class LLMService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: env.LLM_API_KEY,
      baseURL: env.LLM_BASE_URL,
    });
  }

  async extractIntent(message: string): Promise<IntentResult> {
    const prompt = `从用户的购物需求中提取结构化条件，以 JSON 返回：category（商品分类）、scene（使用场景）、minPrice、maxPrice、brand（品牌）、keyword（关键词）。
用户说："${message}"
只返回 JSON，不要其他内容。`;

    try {
      const res = await this.client.chat.completions.create({
        model: env.LLM_MODEL,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });
      const text = res.choices[0].message.content ?? "{}";
      return JSON.parse(text) as IntentResult;
    } catch {
      return { keyword: message };
    }
  }

  async generateRecommendation(query: string, intent: IntentResult, products: Product[]): Promise<string> {
    const prompt = `用户想找：${query}
结构化意图：${JSON.stringify(intent)}
候选商品：
${products.map((p, i) => `${i + 1}. ${p.name} 价格¥${p.price} 评分${p.rating} 特点${p.features.join(",")}`).join("\n")}
请给出简洁的推荐理由和最终建议。`;

    const res = await this.client.chat.completions.create({
      model: env.LLM_MODEL,
      messages: [{ role: "user", content: prompt }],
    });
    return res.choices[0].message.content ?? "暂无推荐";
  }
}

export const llmService = new LLMService();
