import { FastifyInstance } from "fastify";
import { orderService } from "./order.service.js";

export async function orderRoutes(app: FastifyInstance) {
  app.post("/preview", async (request, reply) => {
    const preview = await orderService.preview(request.body as Record<string, unknown>);
    return reply.send(preview);
  });

  app.post("/", async (request, reply) => {
    const order = await orderService.create(request.body as Record<string, unknown>);
    return reply.send(order);
  });
}
