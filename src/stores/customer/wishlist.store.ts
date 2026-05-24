import { defineStore } from "pinia";
import { wishlistApi } from "@/api/customer/wishlist";
import type { WishlistItem } from "@/types";
import { useCartStore } from "@/stores/customer/cart.store";

export const useWishlistStore = defineStore("wishlist", {
  state: () => ({
    items: [] as WishlistItem[],
    isLoading: false,
    error: null as string | null,
  }),

  getters: {
    wishlistProductIds: (state) => new Set(state.items.map((i) => i.product_id)),
  },

  actions: {
    isInWishlist(productId: number): boolean {
      return this.wishlistProductIds.has(productId);
    },

    async fetchWishlist(): Promise<void> {
      this.isLoading = true;
      this.error = null;
      try {
        const res = await wishlistApi.getAll();
        this.items = res.data.data;
      } catch (err: unknown) {
        this.error = (err as any).response?.data?.message || "ไม่สามารถดึงข้อมูลรายการที่ชอบได้";
      } finally {
        this.isLoading = false;
      }
    },

    async toggle(productId: number): Promise<void> {
      this.error = null;
      if (this.isInWishlist(productId)) {
        this.items = this.items.filter((i) => i.product_id !== productId);
        try {
          await wishlistApi.remove(productId);
        } catch (err: unknown) {
          this.error = (err as any).response?.data?.message || "ไม่สามารถลบออกจากรายการที่ชอบได้";
          await this.fetchWishlist();
        }
      } else {
        try {
          await wishlistApi.add(productId);
          await this.fetchWishlist();
        } catch (err: unknown) {
          this.error = (err as any).response?.data?.message || "ไม่สามารถเพิ่มเข้ารายการที่ชอบได้";
        }
      }
    },

    async moveToCart(productId: number, productUnitId: number): Promise<void> {
      const cartStore = useCartStore();
      try {
        await cartStore.addToCart(productUnitId, 1);
        await this.toggle(productId);
      } catch (err: unknown) {
        this.error = (err as any).response?.data?.message || "ไม่สามารถย้ายสินค้าไปยังตะกร้าได้";
      }
    },

    reset(): void {
      this.items = [];
      this.error = null;
    },
  },
});
