/**
 * Products API service
 *
 * Provides methods for product-related API operations.
 * **Validates: Requirements 2.3**
 */

import { apiClient } from "./client";
import type { Product, ProductFilters } from "@/types";
import { API_ENDPOINTS } from "@/constants";

/**
 * Products API service object
 */
export const productsApi = {
  /**
   * Get all products with optional filters
   * @param filters - Optional filters for products (category, drug_type, search, price range)
   * @returns Promise with array of products
   */
  getAll: (filters?: ProductFilters) =>
    apiClient.get<Product[]>(API_ENDPOINTS.PRODUCTS.BASE, { params: filters }),

  /**
   * Get a single product by ID
   * @param id - Product ID
   * @returns Promise with product data
   */
  getById: (id: string) =>
    apiClient.get<Product>(API_ENDPOINTS.PRODUCTS.BY_ID(id)),

  /**
   * Create a new product
   * @param data - Product data (without id, created_at, updated_at)
   * @returns Promise with created product
   */
  create: (data: Omit<Product, "id" | "created_at" | "updated_at">) =>
    apiClient.post<Product>(API_ENDPOINTS.PRODUCTS.BASE, data),

  /**
   * Update an existing product
   * @param id - Product ID
   * @param data - Partial product data to update
   * @returns Promise with updated product
   */
  update: (id: string, data: Partial<Product>) =>
    apiClient.patch<Product>(API_ENDPOINTS.PRODUCTS.BY_ID(id), data),

  /**
   * Delete a product
   * @param id - Product ID
   * @returns Promise with deletion confirmation
   */
  delete: (id: string) => apiClient.delete(API_ENDPOINTS.PRODUCTS.BY_ID(id)),

  /**
   * Sync products from external source
   * @returns Promise with sync result
   */
  sync: () => apiClient.post(API_ENDPOINTS.PRODUCTS.SYNC),
};
