import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  HomeOutlined,
  MessageOutlined,
  ShoppingOutlined,
  SwapOutlined,
  ShoppingCartOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { useCartStore } from "../stores/cart";

const NAV_ITEMS = [
  { key: "/", label: "首页", icon: <HomeOutlined /> },
  { key: "/chat", label: "AI 导购", icon: <MessageOutlined />, hot: true },
  { key: "/products", label: "商品选品", icon: <ShoppingOutlined /> },
  { key: "/compare", label: "对比", icon: <SwapOutlined /> },
  { key: "/cart", label: "购物车", icon: <ShoppingCartOutlined />, cart: true },
];

export function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const cartCount = useCartStore((s) => s.totalCount);

  const isActive = (key: string) =>
    key === "/" ? location.pathname === "/" : location.pathname.startsWith(key);

  return (
    <div className="app-shell">
      <header className="nav-header">
        <div className="nav-inner">
          {/* 品牌 Logo */}
          <div className="nav-left">
            <a className="nav-brand" onClick={() => navigate("/")}>
              <span className="nav-brand-icon">
                <ThunderboltOutlined />
              </span>
              <span className="nav-brand-name">AI 智能导购</span>
            </a>

            {/* 导航项 */}
            <nav className="nav-links">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.key}
                  className={`nav-link${isActive(item.key) ? " nav-link-active" : ""}`}
                  onClick={() => navigate(item.key)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.hot && <span className="nav-hot-badge">HOT</span>}
                  {item.cart && cartCount > 0 && (
                    <span className="nav-count-badge">{cartCount}</span>
                  )}
                </a>
              ))}
            </nav>
          </div>

          {/* 右侧状态与头像 */}
          <div className="nav-right">
            <div className="nav-status-pill">智能引擎运行中</div>
            <div className="nav-avatar">
              <div className="nav-avatar-inner">买手</div>
            </div>
          </div>
        </div>
      </header>

      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}
