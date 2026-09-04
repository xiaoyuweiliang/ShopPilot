import { Card, Table, Button, InputNumber, Typography, Space, message } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useCartStore } from "../../stores/cart";
import { orderService } from "../../services/order";

const { Title, Text } = Typography;

export function Cart() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const total = useCartStore((s) => s.total);

  const columns = [
    {
      title: "商品",
      dataIndex: ["product", "name"],
      key: "name",
    },
    {
      title: "单价",
      dataIndex: ["product", "price"],
      key: "price",
      render: (price: number) => `¥${price.toFixed(2)}`,
    },
    {
      title: "数量",
      dataIndex: "quantity",
      key: "quantity",
      render: (_: unknown, record: { id: string; quantity: number }) => (
        <InputNumber
          min={1}
          value={record.quantity}
          onChange={(value) => updateQuantity(record.id, value ?? 1)}
        />
      ),
    },
    {
      title: "小计",
      key: "subtotal",
      render: (_: unknown, record: { product?: { price: number }; quantity: number }) =>
        `¥${((record.product?.price ?? 0) * record.quantity).toFixed(2)}`,
    },
    {
      title: "操作",
      key: "action",
      render: (_: unknown, record: { id: string }) => (
        <Button icon={<DeleteOutlined />} danger onClick={() => removeItem(record.id)} />
      ),
    },
  ];

  const submitOrder = async () => {
    await orderService.create();
    message.success("模拟下单成功");
  };

  return (
    <Card>
      <Title level={3}>购物车</Title>
      <Table dataSource={items} columns={columns} rowKey="id" pagination={false} />
      <Space style={{ marginTop: 24, justifyContent: "flex-end", width: "100%" }}>
        <Text strong style={{ fontSize: 18 }}>合计：¥{total.toFixed(2)}</Text>
        <Button type="primary" size="large" onClick={submitOrder}>
          确认订单
        </Button>
      </Space>
    </Card>
  );
}
