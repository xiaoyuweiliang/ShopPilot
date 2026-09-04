import { Card, List, Typography, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

interface Props {
  activeId?: string;
}

const MOCK_CONVERSATIONS = [
  { id: "1", title: "买耳机" },
  { id: "2", title: "买跑鞋" },
  { id: "3", title: "礼物推荐" },
];

export function ConversationList({ activeId }: Props) {
  const navigate = useNavigate();

  return (
    <Card style={{ width: 240, display: "flex", flexDirection: "column" }} bodyStyle={{ flex: 1, overflow: "auto" }}>
      <Button
        type="dashed"
        icon={<PlusOutlined />}
        style={{ marginBottom: 16 }}
        onClick={() => navigate("/chat")}
        block
      >
        新对话
      </Button>
      <Typography.Text type="secondary">历史对话</Typography.Text>
      <List
        dataSource={MOCK_CONVERSATIONS}
        renderItem={(item) => (
          <List.Item
            style={{
              cursor: "pointer",
              background: activeId === item.id ? "#e6f4ff" : "transparent",
              padding: "8px 12px",
              borderRadius: 6,
            }}
            onClick={() => navigate(`/chat/${item.id}`)}
          >
            {item.title}
          </List.Item>
        )}
      />
    </Card>
  );
}
