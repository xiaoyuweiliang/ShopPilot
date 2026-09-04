import { Card, Typography, Avatar, Space } from "antd";
import { UserOutlined, RobotOutlined } from "@ant-design/icons";
import type { ChatMessage as ChatMessageType } from "@eaa/types";
import { ProductRecommendCard } from "./ProductRecommendCard";

interface Props {
  message: ChatMessageType;
}

export function ChatMessage({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}>
      <Space align="start" style={{ maxWidth: "80%" }}>
        {!isUser && <Avatar icon={<RobotOutlined />} style={{ backgroundColor: "#1677ff" }} />}
        <Card
          size="small"
          style={{
            background: isUser ? "#1677ff" : "#f6f6f6",
            color: isUser ? "#fff" : "inherit",
          }}
          bodyStyle={{ padding: 12 }}
        >
          {message.type === "product" && message.metadata?.productId ? (
            <ProductRecommendCard productId={message.metadata.productId as string} />
          ) : (
            <Typography.Text style={{ color: "inherit", whiteSpace: "pre-wrap" }}>
              {message.content}
            </Typography.Text>
          )}
        </Card>
        {isUser && <Avatar icon={<UserOutlined />} style={{ backgroundColor: "#87d068" }} />}
      </Space>
    </div>
  );
}
