import { create } from "zustand";
import type { ChatMessage, Conversation } from "@eaa/types";

interface ChatState {
  conversations: Conversation[];
  activeId?: string;
  messages: Record<string, ChatMessage[]>;
  setActive: (id?: string) => void;
  setMessages: (conversationId: string, messages: ChatMessage[]) => void;
  appendMessage: (conversationId: string, message: ChatMessage) => void;
  setConversations: (conversations: Conversation[]) => void;
}

export const useChatStore = create<ChatState>()((set, get) => ({
  conversations: [],
  messages: {},
  setActive: (activeId) => set({ activeId }),
  setMessages: (conversationId, messages) =>
    set({ messages: { ...get().messages, [conversationId]: messages } }),
  appendMessage: (conversationId, message) => {
    const list = get().messages[conversationId] ?? [];
    set({ messages: { ...get().messages, [conversationId]: [...list, message] } });
  },
  setConversations: (conversations) => set({ conversations }),
}));
