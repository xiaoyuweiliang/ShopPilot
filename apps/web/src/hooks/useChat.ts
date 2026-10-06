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
  // 导购处理中的临时状态文案（如“正在理解你的需求...”），正式内容到达时被替换
  const [status, setStatus] = useState<string | null>(null);
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
      setStatus("正在理解你的需求...");
      try {
        await connect(
          `/api/chat`,
          {
            conversationId: id,
            message: text,
          },
          (chunk: ChatMessage) => {
            if (chunk.type === "thinking") {
              // 状态提示只作为占位，随接口推进实时更新，不进入消息列表
              setStatus(chunk.content);
              return;
            }
            // 正式内容到达：清除占位状态，追加真实消息
            setStatus(null);
            appendMessage(id!, chunk);
          }
        );
      } catch {
        appendMessage(id!, {
          role: "assistant",
          type: "error",
          content: "服务暂时开小差了，请稍后再试。",
        });
      } finally {
        setStatus(null);
        setLoading(false);
      }
    },
    [conversationId, navigate, appendMessage, connect]
  );

  return { messages, loading, status, sendMessage };
}
