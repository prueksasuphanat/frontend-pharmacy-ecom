/**
 * Products API service
 *
 * Provides methods for product-related API operations.
 */

import { apiClient } from "../client";
import type { Product, ProductListParams, ProductListResponse } from "@/types";

/**
 * Get paginated list of products
 */
export async function getProducts(
  params: ProductListParams = {},
): Promise<ProductListResponse> {
  const {
    page = 1,
    limit = 10,
    search = "",
    is_active,
    category_id,
    is_special_pricing_enabled,
  } = params;

  const response = await apiClient.get<ProductListResponse>("/admin/products", {
    params: {
      page,
      limit,
      search,
      ...(is_active !== undefined && { is_active }),
      ...(category_id !== undefined && { category_id }),
      ...(is_special_pricing_enabled !== undefined && {
        is_special_pricing_enabled,
      }),
    },
  });

  return response.data;
}

/**
 * Get product by ID
 */
export async function getProductById(id: number): Promise<Product> {
  const response = await apiClient.get<{
    success: boolean;
    data: Product;
  }>(`/admin/products/${id}`);
  return response.data.data;
}

/**
 * Update product
 */
export async function updateProduct(
  id: number,
  data: Partial<Product>,
): Promise<Product> {
  const response = await apiClient.put<{
    success: boolean;
    message: string;
    data: Product;
  }>(`/admin/products/${id}`, data);
  return response.data.data;
}

/**
 * Toggle product active status
 */
export async function toggleProductActive(
  id: number,
  is_active: boolean,
): Promise<Product> {
  const response = await apiClient.put<{
    success: boolean;
    message: string;
    data: Product;
  }>(`/admin/products/toggle-active/${id}`, { is_active });
  return response.data.data;
}

export const productsApi = {
  getProducts,
  getProductById,
  updateProduct,
  toggleProductActive,
};
