/**
 * Product Prices API
 */

import { API_ENDPOINTS } from "@/constants";
import type {
  BulkUpdateProductPricesPayload,
  GetProductPricesPayload,
  ProductPriceResponse,
  UpdateProductPricesResponse,
} from "@/types";
import { apiClient } from "../../client";

export const productPricesApi = {
  // POST body: { product_ids: number[] }
  // Response: product → units → users (พร้อม fallback price)
  getProductPrices: (payload: GetProductPricesPayload) =>
    apiClient.post<ProductPriceResponse>(
      API_ENDPOINTS.ADMIN.PRODUCT_PRICES.BASE,
      payload,
    ),

  // PUT body: { prices: [{ product_unit_id, user_id, price }] }
  updateProductPrices: (payload: BulkUpdateProductPricesPayload) =>
    apiClient.put<UpdateProductPricesResponse>(
      API_ENDPOINTS.ADMIN.PRODUCT_PRICES.BASE,
      payload,
    ),
};
