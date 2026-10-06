import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageOutlined,
  HistoryOutlined,
  ThunderboltOutlined,
  SkinOutlined,
} from "@ant-design/icons";
import { chatService } from "../../services/chat";
import type { Conversation } from "@eaa/types";

interface Props {
  activeId?: string;
}

function isToday(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

export function ConversationList({ activeId }: Props) {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    chatService.getConversations().then(setConversations).catch(() => {});
  }, [activeId]);

  const today = conversations.filter((c) => isToday(c.updatedAt));
  const history = conversations.filter((c) => !isToday(c.updatedAt));

  const renderItem = (conv: Conversation, isActive: boolean, timeLabel: string) => (
    <div
      key={conv.id}
      className={`conv-item${isActive ? " conv-item-active" : ""}`}
      onClick={() => navigate(`/chat/${conv.id}`)}
    >
      <span className="conv-item-icon">
        <MessageOutlined />
      </span>
      <div className="conv-item-text">
        <p className="conv-item-title">{conv.title || "未命名对话"}</p>
        <span className="conv-item-meta">{timeLabel}</span>
      </div>
    </div>
  );

  return (
    <aside className="conv-sidebar">
      {/* 新建对话 */}
      <div className="conv-new">
        <button className="conv-new-btn" onClick={() => navigate("/chat")}>
          <ThunderboltOutlined />
          <span>新建智能选品对话</span>
        </button>
      </div>

      {/* 会话历史 */}
      <div className="conv-list">
        {today.length > 0 && (
          <div className="conv-group">
            <div className="conv-group-header">
              <span className="conv-group-label">
                <MessageOutlined /> 今日导购
              </span>
              <span className="conv-group-count">{today.length}个会话</span>
            </div>
            {today.map((c) => renderItem(c, c.id === activeId, formatTime(c.updatedAt)))}
          </div>
        )}
        {history.length > 0 && (
          <div className="conv-group">
            <div className="conv-group-header">
              <span className="conv-group-label">
                <HistoryOutlined /> 历史记录
              </span>
              <span className="conv-group-count muted">{history.length}个会话</span>
            </div>
            {history.map((c) => renderItem(c, c.id === activeId, formatDate(c.updatedAt)))}
          </div>
        )}
        {conversations.length === 0 && (
          <div className="conv-empty">暂无历史对话，发起一个新需求吧</div>
        )}
      </div>

      {/* 底部偏好画像 */}
      <div className="conv-prefs">
        <div className="conv-prefs-header">
          <span className="conv-prefs-title">
            <SkinOutlined /> 个人智能偏好画像
          </span>
        </div>
        <div className="conv-prefs-tags">
          <span className="conv-pref-tag">
            <i style={{ background: "#3525cd" }} />
            智能预算锚定
          </span>
          <span className="conv-pref-tag">
            <i style={{ background: "#b4136d" }} />
            真实口碑优先
          </span>
          <span className="conv-pref-tag">
            <i style={{ background: "#571ac0" }} />
            多维对比选品
          </span>
        </div>
      </div>
    </aside>
  );
}
