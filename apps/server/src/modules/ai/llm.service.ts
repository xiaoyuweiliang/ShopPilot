import OpenAI from "openai";
import { env } from "../../config/env.js";
import { prisma } from "../../database/prisma.js";
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
    // 从数据库读取真实分类列表，让 LLM 只能选择存在的分类，避免分类名不匹配导致检索为空
    const categories = await prisma.category.findMany({ select: { name: true } });
    const categoryNames = categories.map((c) => c.name).join("、");

    const prompt = `从用户的购物需求中提取结构化条件，以 JSON 返回：category（商品分类）、scene（使用场景）、minPrice、maxPrice、brand（品牌）、keyword（关键词）。
要求：
- category 必须从以下分类中选择一个：${categoryNames}；无法确定则为 null。
- keyword 尽量简短（1-2 个词），用于模糊匹配商品名称和描述；无法确定则为 null。
- 价格字段必须是数字或 null。
用户说："${message}"
只返回 JSON，不要其他内容。`;

    try {
      const res = await this.client.chat.completions.create({
        model: env.LLM_MODEL,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });
      const text = res.choices[0].message.content ?? "{}";
      const parsed = JSON.parse(text) as Record<string, unknown>;
      // LLM 可能返回显式的 null 字段，统一归一化为 undefined，避免传入数据库查询
      return Object.fromEntries(
        Object.entries(parsed).map(([key, value]) => [key, value ?? undefined]),
      ) as IntentResult;
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

  /**
   * 根据对话内容智能生成简短的会话标题（用于侧边栏展示）
   */
  async generateTitle(content: string): Promise<string> {
    const prompt = `请根据以下对话内容，生成一个简短的会话标题（10 个字以内，概括用户的核心需求，不要标点符号、不要引号）。
对话内容："${content}"
只返回标题本身，不要其他内容。`;

    try {
      const res = await this.client.chat.completions.create({
        model: env.LLM_MODEL,
        messages: [{ role: "user", content: prompt }],
      });
      const title = res.choices[0].message.content?.trim().replace(/^["']|["']$/g, "");
      return title && title.length > 0 ? title.slice(0, 20) : "新对话";
    } catch (err) {
      console.error("LLM 生成会话标题失败:", err);
      return "新对话";
    }
  }
}

export const llmService = new LLMService();
