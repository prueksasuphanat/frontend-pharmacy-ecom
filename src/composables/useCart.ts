/**
 * Cart composable
 * Thin wrapper around cart store for convenience in components.
 */

import { useCartStore } from "@/stores/customer/cart.store";
import { computed } from "vue";

export function useCart() {
  const cartStore = useCartStore();

  // Reactive state
  const items = computed(() => cartStore.items);
  const totalItems = computed(() => cartStore.totalItems);
  const subtotal = computed(() => cartStore.subtotal);
  const shippingFee = computed(() => cartStore.shippingFee);
  const total = computed(() => cartStore.total);
  const isLoading = computed(() => cartStore.isLoading);

  /** Add to cart by product_unit_id */
  async function addToCart(productUnitId: number, quantity = 1): Promise<void> {
    await cartStore.addToCart(productUnitId, quantity);
  }

  /** Update quantity by cart item id */
  async function updateQuantity(cartItemId: number, quantity: number): Promise<void> {
    await cartStore.updateQty(cartItemId, quantity);
  }

  /** Remove by cart item id */
  async function removeFromCart(cartItemId: number): Promise<void> {
    await cartStore.removeItem(cartItemId);
  }

  /** Clear all */
  async function clearCart(): Promise<void> {
    await cartStore.clearCart();
  }

  return {
    items,
    totalItems,
    subtotal,
    shippingFee,
    total,
    isLoading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };
}
