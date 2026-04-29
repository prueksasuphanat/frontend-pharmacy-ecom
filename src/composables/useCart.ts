/**
 * Cart composable
 *
 * Wraps the cart store to provide a clean API for cart operations.
 * **Validates: Requirements 3.3**
 */

import { useCartStore } from "@/stores/customer/cart.store";
import { computed } from "vue";

/**
 * Cart composable
 * Provides reactive cart state and methods
 */
export function useCart() {
  const cartStore = useCartStore();

  // Reactive state
  const items = computed(() => cartStore.items);
  const totalItems = computed(() => cartStore.totalItems);
  const subtotal = computed(() => cartStore.subtotal);
  const shippingFee = computed(() => cartStore.shippingFee);
  const total = computed(() => cartStore.total);
  const hasPrescriptionItem = computed(() => cartStore.hasPrescriptionItem);

  /**
   * Add a product to the cart
   * @param productId - Product ID
   * @param quantity - Quantity to add (default: 1)
   */
  function addToCart(productId: string, quantity = 1): void {
    cartStore.addToCart(productId, quantity);
  }

  /**
   * Update the quantity of a cart item
   * @param productId - Product ID
   * @param quantity - New quantity
   */
  function updateQuantity(productId: string, quantity: number): void {
    cartStore.updateQty(productId, quantity);
  }

  /**
   * Remove an item from the cart
   * @param productId - Product ID
   */
  function removeFromCart(productId: string): void {
    cartStore.removeItem(productId);
  }

  /**
   * Clear all items from the cart
   */
  function clearCart(): void {
    cartStore.clearCart();
  }

  /**
   * Move an item from cart to wishlist
   * @param productId - Product ID
   */
  function moveToWishlist(productId: string): void {
    cartStore.moveToWishlist(productId);
  }

  return {
    // State
    items,
    totalItems,
    subtotal,
    shippingFee,
    total,
    hasPrescriptionItem,

    // Methods
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    moveToWishlist,
  };
}
