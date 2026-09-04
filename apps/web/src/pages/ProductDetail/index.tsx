import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Row, Col, Image, Typography, Button, Descriptions, message } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { productService } from "../../services/product";
import { useCartStore } from "../../stores/cart";
import type { Product } from "@eaa/types";

const { Title, Text, Paragraph } = Typography;

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    if (!id) return;
    productService.getById(id).then(setProduct);
  }, [id]);

  if (!product) return null;

  return (
    <Card>
      <Row gutter={24}>
        <Col span={10}>
          <Image src={product.imageUrl ?? "https://placehold.co/400x400"} alt={product.name} />
        </Col>
        <Col span={14}>
          <Title level={3}>{product.name}</Title>
          <Text type="secondary">{product.brand}</Text>
          <div style={{ margin: "16px 0" }}>
            <Title type="danger" level={4} style={{ margin: 0 }}>
              ¥{product.price.toFixed(2)}
            </Title>
          </div>
          <Paragraph>{product.description}</Paragraph>
          <Button
            type="primary"
            size="large"
            icon={<ShoppingCartOutlined />}
            onClick={() => {
              addItem(product.id);
              message.success("已加入购物车");
            }}
          >
            加入购物车
          </Button>
        </Col>
      </Row>
      <Descriptions title="商品参数" bordered style={{ marginTop: 32 }}>
        {product.specs?.map((spec) => (
          <Descriptions.Item key={spec.specName} label={spec.specName}>
            {spec.specValue}
          </Descriptions.Item>
        ))}
      </Descriptions>
    </Card>
  );
}
