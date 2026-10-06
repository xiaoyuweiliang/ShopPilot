import { FastifyInstance } from "fastify";
import { z } from "zod";
import { orderService } from "./order.service.js";

const idParamSchema = z.object({ id: z.string().uuid() });

export async function orderRoutes(app: FastifyInstance) {
  /**
   * GET /api/orders
   * 功能：查询当前用户的订单列表，按创建时间倒序排列，每条订单包含订单明细项。
   * 返回：订单数组。
   */
  app.get("/", async (_request, reply) => {
    const orders = await orderService.list();
    return reply.send(orders);
  });

  /**
   * GET /api/orders/:id
   * 功能：根据订单 ID 查询订单详情（含明细项）。
   * 路径参数：id（订单 UUID）。
   * 返回：订单对象；订单不存在时返回 404。
   */
  app.get("/:id", async (request, reply) => {
    const { id } = idParamSchema.parse(request.params);
    const order = await orderService.getById(id);
    if (!order) return reply.status(404).send({ error: "Order not found" });
    return reply.send(order);
  });

  /**
   * POST /api/orders/preview
   * 功能：订单预览，根据当前购物车内容计算订单明细和总金额（不创建订单）。
   * 返回：{ items: 明细数组, totalAmount: 总金额 }
   */
  app.post("/preview", async (request, reply) => {
    const preview = await orderService.preview(request.body as Record<string, unknown>);
    return reply.send(preview);
  });

  /**
   * POST /api/orders
   * 功能：创建订单，将当前购物车中的商品生成正式订单（状态为 pending），
   *   创建成功后自动清空购物车。
   * 返回：新创建的订单对象（含明细项）。
   */
  app.post("/", async (request, reply) => {
    const order = await orderService.create(request.body as Record<string, unknown>);
    return reply.send(order);
  });
}
