export interface ChatMessage {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  type?: "text" | "product" | "compare" | "cart" | "error" | "thinking";
  metadata?: Record<string, unknown>;
  createdAt?: string;
}

export interface ChatRequest {
  conversationId?: string;
  message: string;
}

export interface Conversation {
  id: string;
  userId: string;
  title?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IntentResult {
  category?: string;
  scene?: string;
  maxPrice?: number;
  minPrice?: number;
  brand?: string;
  keyword?: string;
}
