export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  product?: {
    id: string;
    name: string;
    price: number;
    imageUrl?: string;
  };
  quantity: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddCartItemRequest {
  productId: string;
  quantity?: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}
