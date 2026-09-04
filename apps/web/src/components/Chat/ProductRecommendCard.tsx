import { Card, Button, Typography, Tag } from "antd";
import { ShoppingCartOutlined, EyeOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { productService } from "../../services/product";
import { useCartStore } from "../../stores/cart";
import type { Product } from "@eaa/types";

interface Props {
  productId: string;
}

export function ProductRecommendCard({ productId }: Props) {
  const [product, setProduct] = useState<Product | null>(null);
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    productService.getById(productId).then(setProduct);
  }, [productId]);

  if (!product) return null;

  return (
    <Card size="small" style={{ width: 240 }} cover={<img alt={product.name} src={product.imageUrl} />}>
      <Typography.Text strong>{product.name}</Typography.Text>
      <div>
        <Typography.Text type="danger">¥{product.price.toFixed(2)}</Typography.Text>
      </div>
      <div style={{ marginTop: 8 }}>
        {product.features.slice(0, 2).map((f) => (
          <Tag key={f} size="small">
            {f}
          </Tag>
        ))}
      </div>
      <div style={{ marginTop: 8 }}>
        <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/products/${product.id}`)}>
          详情
        </Button>
        <Button
          size="small"
          icon={<ShoppingCartOutlined />}
          style={{ marginLeft: 8 }}
          onClick={() => addItem(product.id)}
        >
          加购
        </Button>
      </div>
    </Card>
  );
}
