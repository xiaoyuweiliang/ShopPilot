import { Card, Typography, Button, Space, Badge } from "antd";
import { ShoppingCartOutlined, EyeOutlined, SwapOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../../stores/cart";
import type { Product } from "@eaa/types";

interface Props {
  product: Product;
}

export function ProductCard({ product }: Props) {
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const toggleCompare = useCartStore((s) => s.toggleCompare);
  const isInCompare = useCartStore((s) => s.compareList.some((p) => p.id === product.id));

  return (
    <Card
      hoverable
      cover={
        <img
          alt={product.name}
          src={product.imageUrl ?? "https://placehold.co/300x200"}
          style={{ height: 200, objectFit: "cover" }}
        />
      }
      actions={[
        <Button icon={<EyeOutlined />} onClick={() => navigate(`/products/${product.id}`)}>
          详情
        </Button>,
        <Button icon={<ShoppingCartOutlined />} onClick={() => addItem(product.id)}>
          加购
        </Button>,
        <Button
          icon={<SwapOutlined />}
          type={isInCompare ? "primary" : "default"}
          onClick={() => toggleCompare(product)}
        >
          对比
        </Button>,
      ]}
    >
      <Badge.Ribbon text={product.category} color="blue">
        <Card.Meta
          title={product.name}
          description={
            <Space direction="vertical" size={0}>
              <Typography.Text type="danger" strong>
                ¥{product.price.toFixed(2)}
              </Typography.Text>
              <Typography.Text type="secondary">
                {product.brand} · 评分 {product.rating ?? "-"}
              </Typography.Text>
            </Space>
          }
        />
      </Badge.Ribbon>
    </Card>
  );
}
