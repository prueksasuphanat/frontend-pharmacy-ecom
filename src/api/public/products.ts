import type { Product, ProductListResponse } from "@/types";
import { apiClient } from "../client";

export interface PublicProductListParams {
  page?: number;
  limit?: number;
  search?: string;
  category_id?: number;
}

export const publicProductsApi = {
  getAll: (params: PublicProductListParams = {}) =>
    apiClient.get<ProductListResponse>("/products", { params }),

  getById: (id: number) =>
    apiClient.get<{ success: boolean; data: Product }>(`/products/${id}`),
};
