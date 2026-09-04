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
  app.get("/", async () => cartService.getCart());

  app.post("/items", async (request, reply) => {
    const body = addSchema.parse(request.body) as AddCartItemRequest;
    const item = await cartService.addItem(body);
    return reply.send(item);
  });

  app.patch("/items/:id", async (request, reply) => {
    const { id } = idSchema.parse(request.params);
    const body = updateSchema.parse(request.body) as UpdateCartItemRequest;
    const item = await cartService.updateItem(id, body);
    return reply.send(item);
  });

  app.delete("/items/:id", async (request, reply) => {
    const { id } = idSchema.parse(request.params);
    await cartService.removeItem(id);
    return reply.send({ ok: true });
  });
}
