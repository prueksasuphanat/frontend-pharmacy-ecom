import { useCartStore } from "@/stores/customer/cart.store";
import { computed } from "vue";

export function useCart() {
  const cartStore = useCartStore();

  const items = computed(() => cartStore.items);
  const totalItems = computed(() => cartStore.totalItems);
  const subtotal = computed(() => cartStore.subtotal);
  const total = computed(() => cartStore.total);
  const isLoading = computed(() => cartStore.isLoading);

  async function addToCart(productUnitId: number, quantity = 1): Promise<void> {
    await cartStore.addToCart(productUnitId, quantity);
  }

  async function updateQuantity(
    cartItemId: number,
    quantity: number,
  ): Promise<void> {
    await cartStore.updateQty(cartItemId, quantity);
  }

  async function removeFromCart(cartItemId: number): Promise<void> {
    await cartStore.removeItem(cartItemId);
  }

  async function clearCart(): Promise<void> {
    await cartStore.clearCart();
  }

  return {
    items,
    totalItems,
    subtotal,
    total,
    isLoading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };
}
