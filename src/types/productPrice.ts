// Product Price type definitions

// ==========================================
// User price entry ใน unit-level pricing
// ==========================================
export interface UserUnitPrice {
  user_id: number;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  price: number;
  special_price_id: number | null;
  is_special: boolean;
}

// ==========================================
// Unit-level pricing data
// ==========================================
export interface ProductUnitPriceData {
  product_unit_id: number;
  unit_id: number;
  unit_name: string;
  default_price: number;
  multiplier_to_base: number;
  users: UserUnitPrice[];
}

// ==========================================
// Product-level pricing data (new structure)
// ==========================================
export interface ProductPriceData {
  product_id: number;
  is_special_pricing_enabled: boolean;
  units: ProductUnitPriceData[];
}

export interface ProductPriceResponse {
  success: boolean;
  data: ProductPriceData[];
}

export interface GetProductPricesPayload {
  product_ids: number[];
}

// ==========================================
// Update payload (ใช้ product_unit_id แทน product_id)
// ==========================================
export interface UpdateProductPricePayload {
  product_unit_id: number;
  user_id: number;
  price: number;
}

export interface BulkUpdateProductPricesPayload {
  prices: UpdateProductPricePayload[];
}

export interface UpdatedPriceResult {
  product_unit_id: number;
  user_id: number;
  action: "updated" | "created" | "unchanged";
  old_price?: number;
  new_price?: number;
  price?: number;
}

export interface UpdateProductPricesResponse {
  success: boolean;
  message: string;
  data: UpdatedPriceResult[];
}
