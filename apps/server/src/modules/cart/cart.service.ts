import { prisma } from "../../database/prisma.js";
import type { AddCartItemRequest, UpdateCartItemRequest } from "@eaa/types";

const MOCK_USER_ID = "mock-user";

export class CartService {
  async getCart() {
    const items = await prisma.cartItem.findMany({
      where: { userId: MOCK_USER_ID },
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });
    return items.map((i) => ({
      ...i,
      product: {
        ...i.product,
        price: Number(i.product.price),
      },
    }));
  }

  async addItem(body: AddCartItemRequest) {
    const existing = await prisma.cartItem.findFirst({
      where: { userId: MOCK_USER_ID, productId: body.productId },
    });
    if (existing) {
      return prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + (body.quantity ?? 1) },
        include: { product: true },
      });
    }
    return prisma.cartItem.create({
      data: {
        userId: MOCK_USER_ID,
        productId: body.productId,
        quantity: body.quantity ?? 1,
      },
      include: { product: true },
    });
  }

  async updateItem(id: string, body: UpdateCartItemRequest) {
    return prisma.cartItem.update({
      where: { id },
      data: { quantity: body.quantity },
      include: { product: true },
    });
  }

  async removeItem(id: string) {
    await prisma.cartItem.delete({ where: { id } });
  }
}

export const cartService = new CartService();
import { prisma } from "../../database/prisma.js";
import type { AddCartItemRequest, UpdateCartItemRequest } from "@eaa/types";
import { MOCK_USER_ID } from "../../common/user.js";

export class CartService {
