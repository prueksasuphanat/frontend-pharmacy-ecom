import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { wishlistApi, type WishlistItem } from "@/api/customer/wishlist";
import { useCartStore } from "@/stores/customer/cart.store";

export const useWishlistStore = defineStore("wishlist", () => {
  const items = ref<WishlistItem[]>([]);
  const isLoading = ref(false);

  const wishlistProductIds = computed(
    () => new Set(items.value.map((i) => i.product_id)),
  );

  function isInWishlist(productId: number): boolean {
    return wishlistProductIds.value.has(productId);
  }

  async function fetchWishlist(): Promise<void> {
    isLoading.value = true;
    try {
      const res = await wishlistApi.getAll();
      items.value = res.data.data;
    } catch {
    } finally {
      isLoading.value = false;
    }
  }

  async function toggle(productId: number): Promise<void> {
    if (isInWishlist(productId)) {
      items.value = items.value.filter((i) => i.product_id !== productId);
      try {
        await wishlistApi.remove(productId);
      } catch {
        await fetchWishlist();
      }
    } else {
      try {
        await wishlistApi.add(productId);
        await fetchWishlist();
      } catch {}
    }
  }

  async function moveToCart(
    productId: number,
    productUnitId: number,
  ): Promise<void> {
    const cartStore = useCartStore();
    await cartStore.addToCart(productUnitId, 1);
    await toggle(productId);
  }

  function reset(): void {
    items.value = [];
  }

  return {
    items,
    isLoading,
    isInWishlist,
    fetchWishlist,
    toggle,
    moveToCart,
    reset,
  };
});
