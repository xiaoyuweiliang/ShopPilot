import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../stores/chat";
import { chatService } from "../services/chat";
import { useSSE } from "./useSSE";
import type { ChatMessage } from "@eaa/types";

export function useChat(conversationId?: string) {
  const navigate = useNavigate();
  const messages = useChatStore((s) => (conversationId ? s.messages[conversationId] ?? [] : []));
  const appendMessage = useChatStore((s) => s.appendMessage);
  const [loading, setLoading] = useState(false);
  const { connect } = useSSE();

  useEffect(() => {
    if (!conversationId) return;
    chatService.getMessages(conversationId).then((list: ChatMessage[]) => {
      useChatStore.getState().setMessages(conversationId, list);
    });
  }, [conversationId]);

  const sendMessage = useCallback(
    async (text: string) => {
      let id = conversationId;
      if (!id) {
        const conv = await chatService.createConversation();
        id = conv.id;
        navigate(`/chat/${id}`, { replace: true });
      }
      appendMessage(id!, { role: "user", content: text });
      setLoading(true);
      await connect(
        `/api/chat`,
        {
          conversationId: id,
          message: text,
        },
        (chunk: ChatMessage) => {
          appendMessage(id!, chunk);
        }
      );
      setLoading(false);
    },
    [conversationId, navigate, appendMessage, connect]
  );

  return { messages, loading, sendMessage };
}
