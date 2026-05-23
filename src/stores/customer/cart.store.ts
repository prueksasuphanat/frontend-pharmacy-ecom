import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { cartApi } from "@/api/cart";
import type { CartItem, CartData } from "@/types/cart";

const EMPTY_CART: CartData = {
  items: [],
  subtotal: 0,
  shipping_fee: 0,
  total: 0,
  total_items: 0,
};

export const useCartStore = defineStore("cart", () => {
  const cart = ref<CartData>({ ...EMPTY_CART });
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const items = computed(() => cart.value.items);
  const totalItems = computed(() => cart.value.total_items);
  const subtotal = computed(() => cart.value.subtotal);
  const shippingFee = computed(() => cart.value.shipping_fee);
  const total = computed(() => cart.value.total);

  function setCart(data: CartData) {
    cart.value = data;
  }

  async function fetchCart(): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      const res = await cartApi.getCart();
      setCart(res.data.data);
    } catch (err: any) {
      if (err.response?.status !== 401) {
        error.value = err.response?.data?.message ?? "เกิดข้อผิดพลาด";
      }
      setCart({ ...EMPTY_CART });
    } finally {
      isLoading.value = false;
    }
  }

  async function addToCart(productUnitId: number, qty = 1): Promise<void> {
    isLoading.value = true;
    try {
      const res = await cartApi.addItem({
        product_unit_id: productUnitId,
        quantity: qty,
      });
      setCart(res.data.data);
    } catch (err: any) {
      error.value = err.response?.data?.message ?? "ไม่สามารถเพิ่มสินค้าได้";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateQty(cartItemId: number, qty: number): Promise<void> {
    if (qty < 1) {
      await removeItem(cartItemId);
      return;
    }
    try {
      const res = await cartApi.updateItem(cartItemId, { quantity: qty });
      setCart(res.data.data);
    } catch (err: any) {
      error.value = err.response?.data?.message ?? "ไม่สามารถอัปเดตได้";
    }
  }

  async function removeItem(cartItemId: number): Promise<void> {
    try {
      const res = await cartApi.removeItem(cartItemId);
      setCart(res.data.data);
    } catch (err: any) {
      error.value = err.response?.data?.message ?? "ไม่สามารถลบได้";
    }
  }

  async function clearCart(): Promise<void> {
    try {
      await cartApi.clearCart();
      setCart({ ...EMPTY_CART });
    } catch (err: any) {
      error.value = err.response?.data?.message ?? "ไม่สามารถล้างตะกร้าได้";
    }
  }

  function reset() {
    setCart({ ...EMPTY_CART });
    error.value = null;
  }

  return {
    cart,
    items,
    totalItems,
    subtotal,
    shippingFee,
    total,
    isLoading,
    error,

    fetchCart,
    addToCart,
    updateQty,
    removeItem,
    clearCart,
    reset,
  };
});
