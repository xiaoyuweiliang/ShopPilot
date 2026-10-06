import { api } from "./api";
import type { Product, ProductSearchRequest, ProductSearchResult } from "@eaa/types";

export interface Category {
  id: string;
  name: string;
  _count?: { products: number };
}

export const productService = {
  async list(params?: ProductSearchRequest): Promise<ProductSearchResult> {
    const { data } = await api.get("/products", { params });
    return data;
  },

  async categories(): Promise<Category[]> {
    const { data } = await api.get("/products/categories");
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
