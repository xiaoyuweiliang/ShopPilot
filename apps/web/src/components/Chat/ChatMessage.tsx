import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ThunderboltOutlined } from "@ant-design/icons";
import type { ChatMessage as ChatMessageType } from "@eaa/types";

interface Props {
  message: ChatMessageType;
}

export function ChatMessage({ message }: Props) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="msg-row msg-row-user">
        <div className="msg-bubble msg-bubble-user">
          <p>{message.content}</p>
        </div>
        <div className="msg-avatar msg-avatar-user">我</div>
      </div>
    );
  }

  return (
    <div className="msg-row">
      <div className="msg-avatar msg-avatar-ai">
        <ThunderboltOutlined />
      </div>
      <div className={`msg-bubble msg-bubble-ai${message.type === "error" ? " msg-bubble-error" : ""}`}>
        <div className="markdown-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
