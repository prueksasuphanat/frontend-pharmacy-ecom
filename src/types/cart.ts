// ============================================================
// TYPE DEFINITIONS — Cart
// Extracted from stores/cart.store.ts
// ============================================================

/**
 * Cart item representing a product added to the shopping cart
 */
export interface CartItem {
  product_id: string;
  product_name: string;
  product_image: string;
  sku: string;
  unit: string;
  quantity: number;
  unit_price: number;
  stock: number;
  requires_prescription: boolean;
}
