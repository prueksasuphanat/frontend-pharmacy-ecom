// Product Price type definitions

export interface UserPrice {
  user_id: number;
  price: number;
}

export interface ProductPriceData {
  product_id: number;
  data: UserPrice[];
}

export interface ProductPriceResponse {
  success: boolean;
  data: ProductPriceData[];
}

export interface GetProductPricesPayload {
  product_ids: number[];
}

export interface UpdateProductPricePayload {
  product_id: number;
  user_id: number;
  price: number;
}

export interface BulkUpdateProductPricesPayload {
  prices: UpdateProductPricePayload[];
}

export interface UpdatedPriceResult {
  product_id: number;
  user_id: number;
  action: "updated" | "created" | "unchanged";
  old_price: number;
  new_price: number;
}

export interface UpdateProductPricesResponse {
  success: boolean;
  message: string;
  data: UpdatedPriceResult[];
}
