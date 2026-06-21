import { defineStore } from "pinia";
import { cartApi } from "@/api/cart";
import type { CartData } from "@/types";

const EMPTY_CART: CartData = {
  items: [],
  subtotal: 0,
  total: 0,
  total_items: 0,
};

export const useCartStore = defineStore("cart", {
  state: () => ({
    cart: { ...EMPTY_CART } as CartData,
    isLoading: false,
    error: null as string | null,
  }),

  getters: {
    items: (state) => state.cart.items,
    totalItems: (state) => state.cart.total_items,
    subtotal: (state) => state.cart.subtotal,
    total: (state) => state.cart.total,
  },

  actions: {
    setCart(data: CartData) {
      this.cart = data;
    },

    async fetchCart(): Promise<void> {
      this.isLoading = true;
      this.error = null;
      try {
        const res = await cartApi.getCart();
        this.setCart(res.data.data);
      } catch (err: unknown) {
        if ((err as any).response?.status !== 401) {
          this.error = (err as any).response?.data?.message ?? "เกิดข้อผิดพลาด";
        }
        this.setCart({ ...EMPTY_CART });
      } finally {
        this.isLoading = false;
      }
    },

    async addToCart(productUnitId: number, qty = 1): Promise<void> {
      this.isLoading = true;
      this.error = null;
      try {
        const res = await cartApi.addItem({
          product_unit_id: productUnitId,
          quantity: qty,
        });
        this.setCart(res.data.data);
      } catch (err: unknown) {
        this.error = (err as any).response?.data?.message ?? "ไม่สามารถเพิ่มสินค้าได้";
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async updateQty(cartItemId: number, qty: number): Promise<void> {
      if (qty < 1) {
        await this.removeItem(cartItemId);
        return;
      }
      this.isLoading = true;
      this.error = null;
      try {
        const res = await cartApi.updateItem(cartItemId, { quantity: qty });
        this.setCart(res.data.data);
      } catch (err: unknown) {
        this.error = (err as any).response?.data?.message ?? "ไม่สามารถอัปเดตได้";
      } finally {
        this.isLoading = false;
      }
    },

    async removeItem(cartItemId: number): Promise<void> {
      this.isLoading = true;
      this.error = null;
      try {
        const res = await cartApi.removeItem(cartItemId);
        this.setCart(res.data.data);
      } catch (err: unknown) {
        this.error = (err as any).response?.data?.message ?? "ไม่สามารถลบได้";
      } finally {
        this.isLoading = false;
      }
    },

    async clearCart(): Promise<void> {
      this.isLoading = true;
      this.error = null;
      try {
        await cartApi.clearCart();
        this.setCart({ ...EMPTY_CART });
      } catch (err: unknown) {
        this.error = (err as any).response?.data?.message ?? "ไม่สามารถล้างตะกร้าได้";
      } finally {
        this.isLoading = false;
      }
    },

    reset() {
      this.setCart({ ...EMPTY_CART });
      this.error = null;
    },
  },
});
