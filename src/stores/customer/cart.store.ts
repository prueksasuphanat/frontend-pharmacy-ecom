import { MOCK_PRICES, MOCK_PRODUCTS } from "@/__mocks__/products";
import { useAuthStore } from "@/stores/auth.store";
import type { CartItem } from "@/types/cart";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

// TODO: replace with server-side cart_items API calls

export const useCartStore = defineStore("cart", () => {
  const items = ref<CartItem[]>(
    JSON.parse(localStorage.getItem("mock_cart") || "[]"),
  );

  const totalItems = computed(() =>
    items.value.reduce((s, i) => s + i.quantity, 0),
  );
  const subtotal = computed(() =>
    items.value.reduce((s, i) => s + i.quantity * i.unit_price, 0),
  );
  const shippingFee = computed(() => (subtotal.value >= 1000 ? 0 : 50));
  const total = computed(() => subtotal.value + shippingFee.value);
  const hasPrescriptionItem = computed(() =>
    items.value.some((i) => i.requires_prescription),
  );

  function saveLocal() {
    localStorage.setItem("mock_cart", JSON.stringify(items.value));
  }

  // TODO: connect to POST /cart/items
  function addToCart(productId: string, qty = 1) {
    const auth = useAuthStore();
    const product = MOCK_PRODUCTS.find((p) => p.id === productId);
    if (!product) return;

    const roleName = "CUSTOMER";
    const prices = MOCK_PRICES[productId];
    const price = prices?.[roleName] ?? product.base_price;

    const existing = items.value.find((i) => i.product_id === productId);
    if (existing) {
      existing.quantity = Math.min(existing.quantity + qty, product.stock);
    } else {
      items.value.push({
        product_id: product.id,
        product_name: product.name,
        product_image: product.image_url,
        sku: product.sku,
        unit: product.unit,
        quantity: qty,
        unit_price: price,
        stock: product.stock,
        requires_prescription: product.drug_type === "prescription",
      });
    }
    saveLocal();
  }

  // TODO: connect to PATCH /cart/items/:productId
  function updateQty(productId: string, qty: number) {
    const item = items.value.find((i) => i.product_id === productId);
    if (!item) return;
    if (qty <= 0) {
      removeItem(productId);
      return;
    }
    item.quantity = Math.min(qty, item.stock);
    saveLocal();
  }

  // TODO: connect to DELETE /cart/items/:productId
  function removeItem(productId: string) {
    items.value = items.value.filter((i) => i.product_id !== productId);
    saveLocal();
  }

  // TODO: connect to DELETE /cart
  function clearCart() {
    items.value = [];
    saveLocal();
  }

  function moveToWishlist(productId: string) {
    removeItem(productId);
    // TODO: call wishlist store/api
  }

  return {
    items,
    totalItems,
    subtotal,
    shippingFee,
    total,
    hasPrescriptionItem,
    addToCart,
    updateQty,
    removeItem,
    clearCart,
    moveToWishlist,
  };
});
