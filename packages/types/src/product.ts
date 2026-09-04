export interface Product {
  id: string;
  name: string;
  categoryId: string;
  category?: string;
  brand?: string;
  price: number;
  imageUrl?: string;
  description?: string;
  stock: number;
  rating?: number;
  features: string[];
  specs?: ProductSpec[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductSpec {
  id?: string;
  productId?: string;
  specName: string;
  specValue: string;
}

export interface ProductSearchRequest {
  keyword?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  scene?: string;
  page?: number;
  pageSize?: number;
}

export interface ProductSearchResult {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ProductCompareRequest {
  productIds: string[];
}
