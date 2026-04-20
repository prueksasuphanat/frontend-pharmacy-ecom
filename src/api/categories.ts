/**
 * Categories API service
 *
 * Handles all category-related API calls
 */

import { apiClient } from "./client";
import type {
  Category,
  CategoryListParams,
  CategoryListResponse,
} from "@/types";

/**
 * Get paginated list of categories
 */
export async function getCategories(
  params: CategoryListParams = {},
): Promise<CategoryListResponse> {
  const { page = 1, limit = 10, search = null, is_active } = params;

  const response = await apiClient.get<CategoryListResponse>(
    "/admin/categories",
    {
      params: {
        page,
        limit,
        search,
        ...(is_active !== undefined && { is_active }),
      },
    },
  );

  return response.data;
}

/**
 * Get category by ID
 */
export async function getCategoryById(id: number): Promise<Category> {
  const response = await apiClient.get<{
    success: boolean;
    data: Category;
  }>(`/admin/categories/${id}`);
  return response.data.data;
}

/**
 * Create a new category
 */
export async function createCategory(data: {
  name: string;
}): Promise<Category> {
  const response = await apiClient.post<{
    success: boolean;
    message: string;
    data: Category;
  }>("/admin/categories", data);
  return response.data.data;
}

/**
 * Update an existing category
 */
export async function updateCategory(
  id: number,
  data: { name: string; is_active: boolean },
): Promise<Category> {
  const response = await apiClient.put<{
    success: boolean;
    message: string;
    data: Category;
  }>(`/admin/categories/${id}`, data);
  return response.data.data;
}

/**
 * Toggle category active status
 */
export async function toggleCategoryActive(id: number): Promise<Category> {
  const response = await apiClient.put<{
    success: boolean;
    message: string;
    data: Category;
  }>(`/admin/categories/toggle-active/${id}`);
  return response.data.data;
}

/**
 * Delete a category
 */
export async function deleteCategory(id: number): Promise<void> {
  await apiClient.delete(`/admin/categories/${id}`);
}

export const categoriesApi = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  toggleCategoryActive,
  deleteCategory,
};
