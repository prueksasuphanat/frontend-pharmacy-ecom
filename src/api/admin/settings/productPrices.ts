/**
 * Product Prices API
 *
 * Handles product pricing API calls (Admin only)
 */

import { apiClient } from "../../client";
import { API_ENDPOINTS } from "@/constants";
import type {
  ProductPriceResponse,
  GetProductPricesPayload,
  BulkUpdateProductPricesPayload,
  UpdateProductPricesResponse,
} from "@/types";

/**
 * Product Prices API service
 */
export const productPricesApi = {
  getProductPrices: (payload: GetProductPricesPayload) =>
    apiClient.post<ProductPriceResponse>(
      API_ENDPOINTS.ADMIN.PRODUCT_PRICES.BASE,
      payload,
    ),

  updateProductPrices: (payload: BulkUpdateProductPricesPayload) =>
    apiClient.put<UpdateProductPricesResponse>(
      API_ENDPOINTS.ADMIN.PRODUCT_PRICES.BASE,
      payload,
    ),
};
