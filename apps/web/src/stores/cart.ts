import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product } from "@eaa/types";

interface CartState {
  items: CartItem[];
  compareList: Product[];
  totalCount: number;
  total: number;
  addItem: (productId: string, quantity?: number) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  removeItem: (cartItemId: string) => void;
  toggleCompare: (product: Product) => void;
  clearCompare: () => void;
  sync: (items: CartItem[]) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      compareList: [],
      totalCount: 0,
      total: 0,
      addItem: (productId, quantity = 1) => {
        const items = [...get().items];
        const existing = items.find((i) => i.productId === productId);
        if (existing) {
          existing.quantity += quantity;
        } else {
          items.push({
            id: Math.random().toString(36).slice(2),
            userId: "",
            productId,
            quantity,
            product: undefined,
          });
        }
        set({ items, ...recalc(items) });
      },
      updateQuantity: (cartItemId, quantity) => {
        const items = get().items.map((i) => (i.id === cartItemId ? { ...i, quantity } : i));
        set({ items, ...recalc(items) });
      },
      removeItem: (cartItemId) => {
        const items = get().items.filter((i) => i.id !== cartItemId);
        set({ items, ...recalc(items) });
      },
      toggleCompare: (product) => {
        const list = get().compareList;
        const exists = list.find((p) => p.id === product.id);
        if (exists) {
          set({ compareList: list.filter((p) => p.id !== product.id) });
        } else if (list.length < 3) {
          set({ compareList: [...list, product] });
        }
      },
      clearCompare: () => set({ compareList: [] }),
      sync: (items) => set({ items, ...recalc(items) }),
    }),
    { name: "eaa-cart" }
  )
);

function recalc(items: CartItem[]) {
  return {
    totalCount: items.reduce((sum, i) => sum + i.quantity, 0),
    total: items.reduce((sum, i) => sum + (i.product?.price ?? 0) * i.quantity, 0),
  };
}
