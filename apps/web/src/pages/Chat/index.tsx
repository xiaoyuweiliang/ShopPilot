import { useEffect, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Flex, Typography } from "antd";
import { ChatMessage } from "../../components/Chat/ChatMessage";
import { ChatInput } from "../../components/Chat/ChatInput";
import { ConversationList } from "../../components/Chat/ConversationList";
import { useChat } from "../../hooks/useChat";

const { Title } = Typography;

export function Chat() {
  const { conversationId } = useParams();
  const [searchParams] = useSearchParams();
  const initialMessage = searchParams.get("initial") ?? "";
  const { messages, loading, sendMessage } = useChat(conversationId);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Flex gap={16} style={{ height: "calc(100vh - 112px)" }}>
      <ConversationList activeId={conversationId} />
      <Flex vertical style={{ flex: 1, background: "#fff", borderRadius: 8, padding: 16, overflow: "hidden" }}>
        <Title level={4} style={{ marginTop: 0 }}>AI 导购助手</Title>
        <Flex vertical gap={12} style={{ flex: 1, overflowY: "auto", paddingBottom: 16 }}>
          {messages.map((msg, idx) => (
            <ChatMessage key={msg.id ?? idx} message={msg} />
          ))}
          {loading && <ChatMessage message={{ role: "assistant", content: "思考中...", type: "thinking" }} />}
          <div ref={bottomRef} />
        </Flex>
        <ChatInput
          initialValue={initialMessage}
          onSend={sendMessage}
          disabled={loading}
        />
      </Flex>
    </Flex>
  );
}
