/**
 * Products API service
 *
 * Provides methods for product-related API operations.
 */

import type { Product, ProductListParams, ProductListResponse } from "@/types";
import { apiClient } from "../client";

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

export interface UpdateProductPayload {
  name?: string;
  default_price?: string | number;
  quantity?: number;
  is_special_pricing_enabled?: boolean;
  category_ids?: number[] | null;
  generic_name?: string;
  unit_name?: string;
  using?: string;
  warning?: string;
}

/**
 * Update product (multipart/form-data — supports file upload)
 */
export async function updateProduct(
  id: number,
  data: UpdateProductPayload,
  imageFile?: File | null,
  removeAttachments?: boolean,
): Promise<Product> {
  const formData = new FormData();

  if (data.name !== undefined) formData.append("name", data.name);
  if (data.default_price !== undefined)
    formData.append("default_price", String(data.default_price));
  if (data.quantity !== undefined)
    formData.append("quantity", String(data.quantity));
  if (data.is_special_pricing_enabled !== undefined)
    formData.append(
      "is_special_pricing_enabled",
      String(data.is_special_pricing_enabled),
    );
  if (data.category_ids !== undefined)
    formData.append(
      "category_ids",
      data.category_ids === null ? "null" : JSON.stringify(data.category_ids),
    );
  if (data.generic_name !== undefined)
    formData.append("generic_name", data.generic_name);
  if (data.unit_name !== undefined)
    formData.append("unit_name", data.unit_name);
  if (data.using !== undefined) formData.append("using", data.using);
  if (data.warning !== undefined) formData.append("warning", data.warning);
  if (imageFile) formData.append("file", imageFile);
  if (removeAttachments && !imageFile) formData.append("attachments", "[]");

  const response = await apiClient.put<{
    success: boolean;
    message: string;
    data: Product;
  }>(`/admin/products/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
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
