import { API_ENDPOINTS } from "@/constants";
import type {
  BulkUpdateProductPricesPayload,
  GetProductPricesPayload,
  ProductPriceResponse,
  UpdateProductPricesResponse,
} from "@/types";
import { apiClient } from "../../client";

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

  upsertMarkups: (markups: { user_id: number; product_id: number; markup_percent: number }[]) =>
    apiClient.put(`${API_ENDPOINTS.ADMIN.PRODUCT_PRICES.BASE}/markup`, { markups }),
};
