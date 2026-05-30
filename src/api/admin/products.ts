import type { Product, ProductListParams, ProductListResponse } from "@/types";
import { apiClient } from "../client";

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

export async function getProductById(id: number): Promise<Product> {
  const response = await apiClient.get<{ success: boolean; data: Product }>(
    `/admin/products/${id}`,
  );
  return response.data.data;
}

export interface UpdateProductPayload {
  name?: string;
  base_unit_id?: number | null;
  vendor_id?: number | null;
  quantity?: number;
  is_special_pricing_enabled?: boolean;
  category_ids?: number[] | null;
  generic_name?: string;
  using?: string;
  warning?: string;
}

export async function updateProduct(
  id: number,
  data: UpdateProductPayload,
  imageFile?: File | null,
  removeAttachments?: boolean,
): Promise<Product> {
  const formData = new FormData();

  if (data.name !== undefined) formData.append("name", data.name);
  if (data.base_unit_id !== undefined)
    formData.append(
      "base_unit_id",
      data.base_unit_id === null ? "null" : String(data.base_unit_id),
    );
  if (data.vendor_id !== undefined)
    formData.append(
      "vendor_id",
      data.vendor_id === null ? "null" : String(data.vendor_id),
    );
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
