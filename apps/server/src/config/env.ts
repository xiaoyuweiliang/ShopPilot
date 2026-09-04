import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  PORT: z.string().default("3001"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  DATABASE_URL: z.string(),
  QDRANT_URL: z.string().default("http://localhost:6333"),
  QDRANT_COLLECTION: z.string().default("products"),
  LLM_API_KEY: z.string(),
  LLM_BASE_URL: z.string().default("https://api.openai.com/v1"),
  LLM_MODEL: z.string().default("kimi-k2.7-code"),
  EMBEDDING_API_KEY: z.string().optional(),
  EMBEDDING_BASE_URL: z.string().optional(),
  EMBEDDING_MODEL: z.string().default("text-embedding-3-small"),
  VISION_MODEL: z.string().optional(),
  TTS_MODEL: z.string().optional(),
  JWT_SECRET: z.string().default("change-me"),
});

export const env = schema.parse(process.env);
