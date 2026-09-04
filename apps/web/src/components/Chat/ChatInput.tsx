import { useState, useEffect } from "react";
import { Input, Button, Space, Upload } from "antd";
import { SendOutlined, AudioOutlined, PictureOutlined } from "@ant-design/icons";

interface Props {
  initialValue?: string;
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function ChatInput({ initialValue, onSend, disabled }: Props) {
  const [text, setText] = useState(initialValue ?? "");

  useEffect(() => {
    if (initialValue) {
      setText(initialValue);
    }
  }, [initialValue]);

  const handleSend = () => {
    if (!text.trim() || disabled) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <Space.Compact style={{ width: "100%", marginTop: 12 }}>
      <Input.TextArea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="输入你的购物需求..."
        autoSize={{ minRows: 1, maxRows: 4 }}
        onPressEnter={(e) => {
          if (!e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        disabled={disabled}
      />
      <Upload showUploadList={false} beforeUpload={() => false}>
        <Button icon={<PictureOutlined />} disabled={disabled} />
      </Upload>
      <Button icon={<AudioOutlined />} disabled={disabled} />
      <Button type="primary" icon={<SendOutlined />} onClick={handleSend} disabled={disabled}>
        发送
      </Button>
    </Space.Compact>
  );
}
