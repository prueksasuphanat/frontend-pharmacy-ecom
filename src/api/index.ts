/**
 * Barrel export for API service layer
 *
 * Re-exports all API modules for convenient importing.
 * Usage: import { apiClient, authApi, productsApi, usersApi } from '@/api'
 *
 * **Validates: Requirements 2.7**
 */

export * from "./client";
export * from "./auth";
export * from "./admin/products";
export * from "./admin/settings/productPrices";
export * from "./cart";
export * from "./notifications";
export * from "./admin/settings/users";
export * from "./admin/settings/categories";
