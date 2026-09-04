export interface Order {
  id: string;
  userId: string;
  totalAmount: number;
  status: "pending" | "paid" | "shipped" | "completed" | "cancelled";
  items: OrderItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  id?: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

export interface CreateOrderRequest {
  cartItemIds?: string[];
}

export interface OrderPreview {
  items: OrderItem[];
  totalAmount: number;
}
