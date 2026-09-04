import { prisma } from "../../database/prisma.js";
import type { CreateOrderRequest, OrderPreview } from "@eaa/types";

const MOCK_USER_ID = "mock-user";

export class OrderService {
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
    return {
      ...order,
      totalAmount: Number(order.totalAmount),
      items: order.orderItems.map((i) => ({
        ...i,
        price: Number(i.price),
      })),
    };
  }
}

export const orderService = new OrderService();
import { prisma } from "../../database/prisma.js";
import type { CreateOrderRequest, OrderPreview } from "@eaa/types";
import { MOCK_USER_ID } from "../../common/user.js";

export class OrderService {
