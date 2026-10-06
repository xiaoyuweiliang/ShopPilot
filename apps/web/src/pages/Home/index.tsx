import { useNavigate } from "react-router-dom";
import {
  SearchOutlined,
  PictureOutlined,
  AudioOutlined,
  ArrowRightOutlined,
  ThunderboltOutlined,
  SafetyCertificateOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { useState } from "react";

const QUICK_TAGS = ["降噪耳机", "复古跑鞋", "轻薄笔记本", "通勤背包", "游戏鼠标", "送礼精选"];

const FEATURES = [
  {
    icon: <ThunderboltOutlined />,
    title: "秒级理解需求",
    desc: "预算、场景、偏好一次说清，AI 自动拆解选购要点",
  },
  {
    icon: <BarChartOutlined />,
    title: "多维货比三家",
    desc: "性能、口碑、价格多维度交叉比对，拒绝选择困难",
  },
  {
    icon: <SafetyCertificateOutlined />,
    title: "真实可信推荐",
    desc: "基于真实商品库与测评数据，每一款都有据可依",
  },
];

export function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const startChat = (text: string) => {
    if (!text.trim()) return;
    navigate(`/chat?initial=${encodeURIComponent(text)}`);
  };

  return (
    <div className="home-page">
      {/* Hero 区域 */}
      <section className="home-hero">
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          AI 大模型已就绪，覆盖全品类真实商品测评
        </div>
        <h1 className="hero-title">
          AI 随身智能买手
          <br />
          让每一次选购更精准
        </h1>
        <p className="hero-subtitle">
          告诉我你想买什么、预算与使用偏好，多维度帮你货比三家
        </p>

        {/* 胶囊搜索框 */}
        <div className="search-capsule">
          <SearchOutlined className="search-capsule-icon" />
          <input
            className="search-capsule-input"
            placeholder="例如：300元以内适合跑步的蓝牙耳机，需防水防脱落..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && startChat(query)}
          />
          <button className="search-capsule-tool" title="上传参考图">
            <PictureOutlined />
          </button>
          <button className="search-capsule-tool" title="语音输入">
            <AudioOutlined />
          </button>
          <button className="search-capsule-send" onClick={() => startChat(query)}>
            <span>发送需求</span>
            <ArrowRightOutlined />
          </button>
        </div>

        {/* 快捷标签 */}
        <div className="quick-tags">
          <span className="quick-tags-label">大家都在问：</span>
          {QUICK_TAGS.map((tag) => (
            <button key={tag} className="tag-pill" onClick={() => startChat(tag)}>
              {tag}
            </button>
          ))}
        </div>
      </section>

      {/* 特性卡片 */}
      <section className="home-features">
        {FEATURES.map((f) => (
          <div key={f.title} className="feature-card">
            <div className="feature-card-icon">{f.icon}</div>
            <div className="feature-card-title">{f.title}</div>
            <div className="feature-card-desc">{f.desc}</div>
          </div>
        ))}
      </section>
    </div>
  );
}
