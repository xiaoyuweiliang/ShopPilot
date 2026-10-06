import { useEffect, useMemo, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { SwapOutlined, ReloadOutlined, LoadingOutlined, BulbOutlined } from "@ant-design/icons";
import { ChatMessage } from "../../components/Chat/ChatMessage";
import { ChatInput } from "../../components/Chat/ChatInput";
import { ConversationList } from "../../components/Chat/ConversationList";
import { ThinkingBubble } from "../../components/Chat/ThinkingBubble";
import { RecommendRail } from "../../components/Chat/RecommendRail";
import { useChat } from "../../hooks/useChat";

export function Chat() {
  const { conversationId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialMessage = searchParams.get("initial") ?? "";
  const { messages, loading, status, sendMessage } = useChat(conversationId);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  // 商品消息不在中间对话流展示，统一收集到右侧“精准匹配”栏
  const productIds = useMemo(() => {
    const ids: string[] = [];
    for (const m of messages) {
      if (m.type === "product" && m.metadata?.productId) {
        ids.push(m.metadata.productId as string);
      }
      const saved = m.metadata?.products;
      if (Array.isArray(saved)) {
        for (const id of saved) if (typeof id === "string") ids.push(id);
      }
    }
    return [...new Set(ids)];
  }, [messages]);

  const dialogMessages = messages.filter((m) => m.type !== "product");

  return (
    <div className="chat-workspace">
      {/* 左栏：会话列表 */}
      <ConversationList activeId={conversationId} />

      {/* 中栏：对话流 */}
      <section className="chat-center">
        {/* 引擎状态栏 */}
        <div className="chat-engine-bar">
          <div className="chat-engine-info">
            <span className={`chat-engine-icon${loading ? " spinning" : ""}`}>
              {loading ? <LoadingOutlined /> : <BulbOutlined />}
            </span>
            <div>
              <div className="chat-engine-title">
                AI 大模型购物决策引擎
                <span className={`chat-engine-badge${loading ? "" : " idle"}`}>
                  {loading ? "深度思考中" : "待命中"}
                </span>
              </div>
              <div className="chat-engine-sub">已接入真实商品库，支持预算、场景、偏好多维选品</div>
            </div>
          </div>
          <div className="chat-engine-actions">
            <button className="chat-engine-btn" onClick={() => navigate("/compare")}>
              <SwapOutlined /> 对比模式
            </button>
            <button className="chat-engine-btn" onClick={() => navigate("/chat")}>
              <ReloadOutlined /> 重置上下文
            </button>
          </div>
        </div>

        {/* 对话流 */}
        <div className="chat-stream">
          {dialogMessages.length === 0 && !loading && (
            <div className="chat-empty">
              <div className="chat-empty-title">你好，我是你的 AI 随身买手</div>
              <div className="chat-empty-sub">
                告诉我你想买什么、预算多少、在意哪些点，我帮你从商品库里挑出最合适的几款。
              </div>
            </div>
          )}
          {dialogMessages.map((msg, idx) => (
            <ChatMessage key={msg.id ?? idx} message={msg} />
          ))}
          {loading && <ThinkingBubble text={status ?? "正在思考..."} />}
          <div ref={bottomRef} />
        </div>

        {/* 底部胶囊输入区 */}
        <ChatInput
          initialValue={initialMessage}
          onSend={sendMessage}
          disabled={loading}
        />
      </section>

      {/* 右栏：精准匹配商品流 */}
      <RecommendRail productIds={productIds} />
    </div>
  );
}
