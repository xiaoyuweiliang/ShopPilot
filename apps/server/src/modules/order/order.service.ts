import { prisma } from "../../database/prisma.js";
import { MOCK_USER_ID } from "../../common/user.js";
import type { CreateOrderRequest, OrderPreview } from "@eaa/types";

export class OrderService {
  /**
   * 查询当前用户的订单列表（含明细项），金额转为 number 类型
   */
  async list() {
    const orders = await prisma.order.findMany({
      where: { userId: MOCK_USER_ID },
      include: { orderItems: true },
      orderBy: { createdAt: "desc" },
    });
    return orders.map((order) => this.serialize(order));
  }

  /**
   * 根据订单 ID 查询订单详情，不存在时返回 null
   */
  async getById(id: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { orderItems: true },
    });
    if (!order) return null;
    return this.serialize(order);
  }

  async preview(_body?: CreateOrderRequest): Promise<OrderPreview> {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: MOCK_USER_ID },
      include: { product: true },
    });
    const items = cartItems.map((i) => ({
      productId: i.productId,
      productName: i.product.name,
      price: Number(i.product.price),
      quantity: i.quantity,
    }));
    const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    return { items, totalAmount };
  }

  async create(_body?: CreateOrderRequest) {
    const preview = await this.preview();
    const order = await prisma.order.create({
      data: {
        userId: MOCK_USER_ID,
        totalAmount: preview.totalAmount,
        status: "pending",
        orderItems: {
          create: preview.items.map((i) => ({
            productId: i.productId,
            productName: i.productName,
            price: i.price,
            quantity: i.quantity,
          })),
        },
      },
      include: { orderItems: true },
    });
    await prisma.cartItem.deleteMany({ where: { userId: MOCK_USER_ID } });
    return this.serialize(order);
  }

  /** 将 Prisma 的 Decimal 金额字段序列化为 number，并统一 items 字段名 */
  private serialize(order: {
    totalAmount: unknown;
    orderItems: { price: unknown }[];
  } & Record<string, unknown>) {
    const { orderItems, ...rest } = order;
    return {
      ...rest,
      totalAmount: Number(order.totalAmount),
      items: orderItems.map((item) => ({
        ...item,
        price: Number(item.price),
      })),
    };
  }
}

export const orderService = new OrderService();
