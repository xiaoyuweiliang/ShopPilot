import { FastifyInstance } from "fastify";
import { productService } from "./product.service.js";
import { productListQuerySchema, productSearchBodySchema, productIdParamSchema } from "./product.schema.js";

export async function productRoutes(app: FastifyInstance) {
  /**
   * GET /api/products
   * 功能：分页查询商品列表，支持按分类、价格区间、关键词筛选。
   * Query 参数：page（页码，默认1）、pageSize（每页数量，默认20）、
   *   category（分类名）、minPrice / maxPrice（价格区间）、keyword（关键词，模糊匹配名称和描述）。
   * 返回：{ items: 商品数组, total: 总数, page, pageSize }
   */
  app.get("/", async (request, reply) => {
    const query = productListQuerySchema.parse(request.query);
    const result = await productService.list(query);
    return reply.send(result);
  });

  /**
   * GET /api/products/categories
   * 功能：获取所有商品分类（用于前端筛选栏展示）。
   * 返回：分类数组，每项包含 id、name 及该分类下的商品数量 _count.products。
   */
  app.get("/categories", async (_request, reply) => {
    const categories = await productService.listCategories();
    return reply.send(categories);
  });

  /**
   * GET /api/products/:id
   * 功能：根据商品 ID 查询单个商品详情（含分类信息和规格参数列表）。
   * 路径参数：id（商品 UUID）。
   * 返回：商品对象；商品不存在时返回 404。
   */
  app.get("/:id", async (request, reply) => {
    const { id } = productIdParamSchema.parse(request.params);
    const product = await productService.getById(id);
    if (!product) return reply.status(404).send({ error: "Product not found" });
    return reply.send(product);
  });

  /**
   * POST /api/products/search
   * 功能：智能搜索商品（供 AI 导购调用），根据关键词/分类/价格/场景检索商品。
   * 请求体：{ keyword?, category?, minPrice?, maxPrice?, scene? }
   * 返回：匹配的商品数组（目前走数据库条件查询，后续可替换为向量检索）。
   */
  app.post("/search", async (request, reply) => {
    const body = productSearchBodySchema.parse(request.body);
    const items = await productService.search(body);
    return reply.send(items);
  });
}
