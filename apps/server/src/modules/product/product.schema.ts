import { z } from "zod";

export const productListQuerySchema = z.object({
  page: z.coerce.number().default(1),
  pageSize: z.coerce.number().default(20),
  category: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  keyword: z.string().optional(),
});

export const productSearchBodySchema = z.object({
  keyword: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  scene: z.string().optional(),
});

export const productIdParamSchema = z.object({
  id: z.string().uuid(),
});
