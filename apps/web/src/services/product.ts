import { api } from "./api";
import type { Product, ProductSearchRequest, ProductSearchResult } from "@eaa/types";

export const productService = {
  async list(params?: ProductSearchRequest): Promise<ProductSearchResult> {
    const { data } = await api.get("/products", { params });
    return data;
  },

  async search(body: ProductSearchRequest): Promise<Product[]> {
    const { data } = await api.post("/products/search", body);
    return data;
  },

  async getById(id: string): Promise<Product> {
    const { data } = await api.get(`/products/${id}`);
    return data;
  },
};
