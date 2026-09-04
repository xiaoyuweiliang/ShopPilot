import { FastifyInstance } from "fastify";
import { productService } from "./product.service.js";
import { productListQuerySchema, productSearchBodySchema, productIdParamSchema } from "./product.schema.js";

export async function productRoutes(app: FastifyInstance) {
  app.get("/", async (request, reply) => {
    const query = productListQuerySchema.parse(request.query);
    const result = await productService.list(query);
    return reply.send(result);
  });

  app.get("/:id", async (request, reply) => {
    const { id } = productIdParamSchema.parse(request.params);
    const product = await productService.getById(id);
    if (!product) return reply.status(404).send({ error: "Product not found" });
    return reply.send(product);
  });

  app.post("/search", async (request, reply) => {
    const body = productSearchBodySchema.parse(request.body);
    const items = await productService.search(body);
    return reply.send(items);
  });
}
