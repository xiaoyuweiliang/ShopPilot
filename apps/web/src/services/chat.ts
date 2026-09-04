import { api } from "./api";
import type { ChatRequest, Conversation } from "@eaa/types";

export const chatService = {
  createConversation(): Promise<Conversation> {
    return api.post("/conversations").then((res) => res.data);
  },

  getConversations(): Promise<Conversation[]> {
    return api.get("/conversations").then((res) => res.data);
  },

  getMessages(conversationId: string) {
    return api.get(`/conversations/${conversationId}/messages`).then((res) => res.data);
  },
};
