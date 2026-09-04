import fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error.js";
import { ensureMockUser } from "./common/user.js";
import { productRoutes } from "./modules/product/product.controller.js";
import { chatRoutes } from "./modules/chat/chat.controller.js";
import { conversationRoutes } from "./modules/conversation/conversation.controller.js";
import { cartRoutes } from "./modules/cart/cart.controller.js";
import { orderRoutes } from "./modules/order/order.controller.js";

const app = fastify({ logger: true });

async function main() {
  await app.register(cors, { origin: env.CORS_ORIGIN });
  await app.register(multipart);
  app.setErrorHandler(errorHandler);

  await ensureMockUser();

  app.get("/health", async () => ({ status: "ok" }));

  await app.register(productRoutes, { prefix: "/api/products" });
  await app.register(chatRoutes, { prefix: "/api/chat" });
  await app.register(conversationRoutes, { prefix: "/api/conversations" });
  await app.register(cartRoutes, { prefix: "/api/cart" });
  await app.register(orderRoutes, { prefix: "/api/orders" });

  try {
    await app.listen({ port: env.PORT, host: "0.0.0.0" });
    app.log.info(`Server listening on http://localhost:${env.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
