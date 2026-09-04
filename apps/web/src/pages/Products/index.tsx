import { useEffect, useState } from "react";
import { Row, Col, Input, Slider, Select, Pagination, Card, Typography } from "antd";
import { ProductCard } from "../../components/Product/ProductCard";
import { productService } from "../../services/product";
import type { Product } from "@eaa/types";

const { Title } = Typography;
const { Option } = Select;

export function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [keyword, setKeyword] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    productService
      .list({ keyword, minPrice: priceRange[0], maxPrice: priceRange[1], page, pageSize })
      .then((res) => {
        setProducts(res.items);
        setTotal(res.total);
      });
  }, [keyword, priceRange, page, pageSize]);

  return (
    <Card>
      <Title level={3}>商品列表</Title>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Input.Search
            placeholder="搜索商品"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onSearch={() => setPage(1)}
          />
        </Col>
        <Col span={8}>
          <Slider range max={5000} value={priceRange} onChange={setPriceRange} />
        </Col>
        <Col span={8}>
          <Select style={{ width: "100%" }} placeholder="排序" allowClear>
            <Option value="price_asc">价格从低到高</Option>
            <Option value="price_desc">价格从高到低</Option>
            <Option value="rating">评分优先</Option>
          </Select>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        {products.map((p) => (
          <Col key={p.id} xs={24} sm={12} md={8} lg={6}>
            <ProductCard product={p} />
          </Col>
        ))}
      </Row>
      <Pagination
        current={page}
        pageSize={pageSize}
        total={total}
        onChange={setPage}
        style={{ marginTop: 24, textAlign: "right" }}
      />
    </Card>
  );
}
