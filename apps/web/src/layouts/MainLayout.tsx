import { Layout, Menu, Badge } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  HomeOutlined,
  MessageOutlined,
  ShoppingOutlined,
  SwapOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { useCartStore } from "../stores/cart";

const { Header, Content } = Layout;

export function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const cartCount = useCartStore((s) => s.totalCount);

  const items = [
    { key: "/", icon: <HomeOutlined />, label: "首页" },
    { key: "/chat", icon: <MessageOutlined />, label: "AI 导购" },
    { key: "/products", icon: <ShoppingOutlined />, label: "商品" },
    { key: "/compare", icon: <SwapOutlined />, label: "对比" },
    {
      key: "/cart",
      icon: (
        <Badge count={cartCount} size="small">
          <ShoppingCartOutlined />
        </Badge>
      ),
      label: "购物车",
    },
  ];

  const activeKey =
    items.find((item) => location.pathname.startsWith(item.key))?.key ?? "/";

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ display: "flex", alignItems: "center", background: "#fff" }}>
        <div style={{ fontSize: 18, fontWeight: 600, marginRight: 32 }}>AI 智能导购</div>
        <Menu
          mode="horizontal"
          selectedKeys={[activeKey]}
          items={items}
          onClick={({ key }) => navigate(key)}
          style={{ flex: 1, minWidth: 0 }}
        />
      </Header>
      <Content style={{ padding: 24 }}>
        <Outlet />
      </Content>
    </Layout>
  );
}
