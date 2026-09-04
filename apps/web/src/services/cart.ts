import { api } from "./api";
import type { CartItem, AddCartItemRequest, UpdateCartItemRequest } from "@eaa/types";

export const cartService = {
  getCart(): Promise<CartItem[]> {
    return api.get("/cart").then((res) => res.data);
  },

  addItem(body: AddCartItemRequest): Promise<CartItem> {
    return api.post("/cart/items", body).then((res) => res.data);
  },

  updateItem(id: string, body: UpdateCartItemRequest): Promise<CartItem> {
    return api.patch(`/cart/items/${id}`, body).then((res) => res.data);
  },

  removeItem(id: string): Promise<void> {
    return api.delete(`/cart/items/${id}`).then(() => undefined);
  },
};
