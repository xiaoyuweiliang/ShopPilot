import { prisma } from "../../database/prisma.js";
import type { ProductSearchRequest, ProductSearchResult } from "@eaa/types";

export class ProductService {
  async list(params: ProductSearchRequest): Promise<ProductSearchResult> {
    const { page = 1, pageSize = 20, keyword, category, minPrice, maxPrice } = params;
    const where: Record<string, unknown> = {};

    if (category) {
      where.category = { name: category };
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) (where.price as Record<string, unknown>).gte = minPrice;
      if (maxPrice !== undefined) (where.price as Record<string, unknown>).lte = maxPrice;
    }
    if (keyword) {
      where.OR = [
        { name: { contains: keyword, mode: "insensitive" } },
        { description: { contains: keyword, mode: "insensitive" } },
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
        category: p.category.name,
        categoryId: p.categoryId,
      })),
      total,
      page,
      pageSize,
    };
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
    const result = await this.list(body);
    return result.items;
  }
}

export const productService = new ProductService();
