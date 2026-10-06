import { FastifyInstance } from "fastify";
import { z } from "zod";
import { cartService } from "./cart.service.js";
import type { AddCartItemRequest, UpdateCartItemRequest } from "@eaa/types";

const addSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().min(1).default(1),
});

const updateSchema = z.object({
  quantity: z.number().min(1),
});

const idSchema = z.object({ id: z.string().uuid() });

export async function cartRoutes(app: FastifyInstance) {
  /**
   * GET /api/cart
   * 功能：查询当前用户的购物车列表，每项包含商品详情（名称、价格、图片等）。
   * 返回：购物车条目数组，按加入时间倒序。
   */
  app.get("/", async () => cartService.getCart());

  /**
   * POST /api/cart/items
   * 功能：向购物车添加商品；如果该商品已在购物车中，则自动累加数量。
   * 请求体：{ productId: 商品UUID, quantity?: 数量（默认1） }
   * 返回：新增或更新后的购物车条目（含商品信息）。
   */
  app.post("/items", async (request, reply) => {
    const body = addSchema.parse(request.body) as AddCartItemRequest;
    const item = await cartService.addItem(body);
    return reply.send(item);
  });

  /**
   * PATCH /api/cart/items/:id
   * 功能：修改购物车中某个条目的商品数量。
   * 路径参数：id（购物车条目 UUID）。
   * 请求体：{ quantity: 新数量（最小为1） }
   * 返回：更新后的购物车条目。
   */
  app.patch("/items/:id", async (request, reply) => {
    const { id } = idSchema.parse(request.params);
    const body = updateSchema.parse(request.body) as UpdateCartItemRequest;
    const item = await cartService.updateItem(id, body);
    return reply.send(item);
  });

  /**
   * DELETE /api/cart/items/:id
   * 功能：从购物车中删除指定条目。
   * 路径参数：id（购物车条目 UUID）。
   * 返回：{ ok: true }
   */
  app.delete("/items/:id", async (request, reply) => {
    const { id } = idSchema.parse(request.params);
    await cartService.removeItem(id);
    return reply.send({ ok: true });
  });
}
