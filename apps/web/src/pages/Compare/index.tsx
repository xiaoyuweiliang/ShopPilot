import { useState } from "react";
import { Card, Table, Button, Typography, Space, message } from "antd";
import { useCartStore } from "../../stores/cart";
import type { Product } from "@eaa/types";

const { Title } = Typography;

export function Compare() {
  const compareList = useCartStore((s) => s.compareList);
  const clearCompare = useCartStore((s) => s.clearCompare);
  const addItem = useCartStore((s) => s.addItem);

  const columns = [
    { title: "属性", dataIndex: "attr", key: "attr" },
    ...compareList.map((p) => ({
      title: p.name,
      dataIndex: p.id,
      key: p.id,
    })),
  ];

  const data = [
    { attr: "价格", key: "price" },
    { attr: "评分", key: "rating" },
    { attr: "品牌", key: "brand" },
  ];

  const tableData = data.map((row) => {
    const record: Record<string, unknown> = { attr: row.attr, key: row.key };
    compareList.forEach((p) => {
      if (row.key === "price") record[p.id] = `¥${p.price.toFixed(2)}`;
      else if (row.key === "rating") record[p.id] = p.rating ?? "-";
      else record[p.id] = (p as Record<string, unknown>)[row.key] ?? "-";
    });
    return record;
  });

  return (
    <Card>
      <Title level={3}>商品对比</Title>
      {compareList.length < 2 ? (
        <Typography.Text type="secondary">请至少选择 2 个商品进行对比</Typography.Text>
      ) : (
        <>
          <Table columns={columns} dataSource={tableData} pagination={false} bordered />
          <Space style={{ marginTop: 24 }}>
            {compareList.map((p) => (
              <Button
                key={p.id}
                onClick={() => {
                  addItem(p.id);
                  message.success(`${p.name} 已加入购物车`);
                }}
              >
                购买 {p.name}
              </Button>
            ))}
            <Button danger onClick={clearCompare}>
              清空对比
            </Button>
          </Space>
        </>
      )}
    </Card>
  );
}
