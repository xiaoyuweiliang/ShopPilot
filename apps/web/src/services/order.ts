import { api } from "./api";
import type { CreateOrderRequest, Order, OrderPreview } from "@eaa/types";

export const orderService = {
  preview(body?: CreateOrderRequest): Promise<OrderPreview> {
    return api.post("/orders/preview", body ?? {}).then((res) => res.data);
  },

  create(body?: CreateOrderRequest): Promise<Order> {
    return api.post("/orders", body ?? {}).then((res) => res.data);
  },
};
