import { ThunderboltOutlined } from "@ant-design/icons";

interface Props {
  text: string;
}

/**
 * 导购处理中的临时状态气泡。
 * 仅作为占位展示，接口正式内容生成后由真实消息替换，不会留在消息列表中。
 */
export function ThinkingBubble({ text }: Props) {
  return (
    <div className="msg-row">
      <div className="msg-avatar msg-avatar-ai">
        <ThunderboltOutlined />
      </div>
      <div className="msg-bubble msg-bubble-ai msg-bubble-thinking">
        <span className="thinking-dots">
          <i />
          <i />
          <i />
        </span>
        <span className="thinking-text">{text}</span>
      </div>
    </div>
  );
}
