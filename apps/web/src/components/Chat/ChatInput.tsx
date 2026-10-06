import { useState, useEffect } from "react";
import {
  ArrowUpOutlined,
  AudioOutlined,
  PictureOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";

interface Props {
  initialValue?: string;
  onSend: (text: string) => void;
  disabled?: boolean;
}

const QUICK_CHIPS = ["帮我对比推荐的几款", "有更便宜的选择吗？", "哪款续航最久？", "适合送人的是哪款？"];

export function ChatInput({ initialValue, onSend, disabled }: Props) {
  const [text, setText] = useState(initialValue ?? "");

  useEffect(() => {
    if (initialValue) {
      setText(initialValue);
    }
  }, [initialValue]);

  const handleSend = (value?: string) => {
    const content = (value ?? text).trim();
    if (!content || disabled) return;
    onSend(content);
    setText("");
  };

  return (
    <div className="chat-input-area">
      {/* 快捷追问 */}
      <div className="chat-chips">
        <span className="chat-chips-label">
          <ThunderboltOutlined /> 大家都在问:
        </span>
        {QUICK_CHIPS.map((chip) => (
          <button
            key={chip}
            className="chat-chip"
            disabled={disabled}
            onClick={() => handleSend(chip)}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* 玻璃胶囊输入框 */}
      <div className={`chat-capsule${disabled ? " disabled" : ""}`}>
        <button className="chat-capsule-tool" title="上传图片识物" disabled={disabled}>
          <PictureOutlined />
        </button>
        <button className="chat-capsule-tool" title="语音输入" disabled={disabled}>
          <AudioOutlined />
        </button>
        <input
          className="chat-capsule-input"
          placeholder="告诉 AI 你的需求，例如：300元以内适合跑步的蓝牙耳机..."
          value={text}
          disabled={disabled}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button
          className="chat-capsule-send"
          title="发送"
          disabled={disabled || !text.trim()}
          onClick={() => handleSend()}
        >
          <ArrowUpOutlined />
        </button>
      </div>

      <div className="chat-input-footer">
        <span>按 Enter 发送，Shift + Enter 换行 · 支持粘贴商品链接或型号</span>
        <span className="chat-input-guard">
          <SafetyCertificateOutlined /> AI 真实比价保障
        </span>
      </div>
    </div>
  );
}
