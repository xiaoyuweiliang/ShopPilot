import { useNavigate } from "react-router-dom";
import { Input, Button, Typography, Space, Tag, Card } from "antd";
import { SendOutlined } from "@ant-design/icons";
import { useState } from "react";

const { Title, Paragraph } = Typography;

const SUGGESTIONS = ["耳机", "跑鞋", "笔记本", "背包", "游戏鼠标", "智能手表"];

export function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const startChat = (text: string) => {
    if (!text.trim()) return;
    navigate(`/chat?initial=${encodeURIComponent(text)}`);
  };

  return (
    <Card style={{ maxWidth: 720, margin: "80px auto", textAlign: "center" }}>
      <Title level={2}>AI 导购助手</Title>
      <Paragraph type="secondary">告诉我你想买什么，我帮你挑</Paragraph>
      <Space.Compact style={{ width: "100%", marginTop: 24 }}>
        <Input
          size="large"
          placeholder="例如：300元以内适合跑步的蓝牙耳机"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onPressEnter={() => startChat(query)}
        />
        <Button size="large" type="primary" icon={<SendOutlined />} onClick={() => startChat(query)}>
          发送
        </Button>
      </Space.Compact>
      <div style={{ marginTop: 24 }}>
        {SUGGESTIONS.map((tag) => (
          <Tag key={tag} style={{ cursor: "pointer" }} onClick={() => startChat(`推荐${tag}`)}>
            {tag}
          </Tag>
        ))}
      </div>
    </Card>
  );
}
