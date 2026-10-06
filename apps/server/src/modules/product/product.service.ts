import { prisma } from "../../database/prisma.js";
import type { ProductSearchRequest, ProductSearchResult } from "@eaa/types";

export class ProductService {
  async list(params: ProductSearchRequest): Promise<ProductSearchResult> {
    const { page = 1, pageSize = 20, keyword, category, minPrice, maxPrice } = params;
    const where: Record<string, unknown> = {};

    if (category) {
      // 分类名归一化匹配：LLM 提取的"护肤品"要能命中数据库里的"护肤"分类
      const resolved = await this.resolveCategoryName(category);
      where.category = resolved
        ? { name: resolved }
        : { name: { contains: category } };
    }
    const min = typeof minPrice === "number" && Number.isFinite(minPrice) ? minPrice : undefined;
    const max = typeof maxPrice === "number" && Number.isFinite(maxPrice) ? maxPrice : undefined;
    if (min !== undefined || max !== undefined) {
      where.price = {};
      if (min !== undefined) (where.price as Record<string, unknown>).gte = min;
      if (max !== undefined) (where.price as Record<string, unknown>).lte = max;
    }
    if (keyword) {
      where.OR = [
        { name: { contains: keyword, mode: "insensitive" } },
        { description: { contains: keyword, mode: "insensitive" } },
        { category: { name: { contains: keyword, mode: "insensitive" } } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { category: true, specs: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      items: items.map((p) => ({
        ...p,
        price: Number(p.price),
        rating: p.rating ? Number(p.rating) : undefined,
        brand: p.brand ?? undefined,
        imageUrl: p.imageUrl ?? undefined,
        description: p.description ?? undefined,
        category: p.category.name,
        categoryId: p.categoryId,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
      total,
      page,
      pageSize,
    };
  }

  /**
   * 将意图识别给出的分类词解析为数据库中真实存在的分类名。
   * 归一化（去“品/类/用品”等后缀）后先精确匹配，再做双向包含匹配，
   * 使“护肤品”→“护肤”、“蓝牙耳机”→“耳机”都能命中。
   */
  private async resolveCategoryName(input: string): Promise<string | undefined> {
    const norm = (v: string) =>
      v.trim().toLowerCase().replace(/(用品|品|类)$/u, "");
    const target = norm(input);
    if (!target) return undefined;
    const categories = await prisma.category.findMany({ select: { name: true } });
    const exact = categories.find((c) => norm(c.name) === target);
    if (exact) return exact.name;
    const hit = categories.find((c) => {
      const n = norm(c.name);
      return n.length > 0 && (n.includes(target) || target.includes(n));
    });
    return hit?.name;
  }

  async getById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true, specs: true },
    });
    if (!product) return null;
    return {
      ...product,
      price: Number(product.price),
      rating: product.rating ? Number(product.rating) : undefined,
      category: product.category.name,
    };
  }

  async search(body: ProductSearchRequest) {
    // TODO: integrate RAG vector search
    let result = await this.list(body);
    // 条件过严导致无结果时逐级放宽：先去掉关键词，再去掉分类，保证尽量有商品可推荐
    if (result.items.length === 0 && body.keyword) {
      result = await this.list({ ...body, keyword: undefined });
    }
    if (result.items.length === 0 && body.category) {
      result = await this.list({ ...body, keyword: body.keyword, category: undefined });
    }
    return result.items;
  }

  /**
   * 查询所有商品分类，并附带每个分类下的商品数量
   */
  async listCategories() {
    return prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    });
  }
}

export const productService = new ProductService();
