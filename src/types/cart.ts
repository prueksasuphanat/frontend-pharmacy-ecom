// ============================================================
// TYPE DEFINITIONS — Cart (server-side API)
// ============================================================

export interface CartItem {
  id: number;
  product_unit_id: number;
  quantity: number;
  unit_price: number;
  is_special_price: boolean;
  subtotal: number;
  product: {
    id: number;
    name: string;
    code: string;
    stock: number;
    image_url: string | null;
  };
  unit: {
    id: number;
    name: string;
  };
}

export interface CartData {
  items: CartItem[];
  subtotal: number;
  shipping_fee: number;
  total: number;
  total_items: number;
}
