/**
 * Barrel export for API service layer
 *
 * Re-exports all API modules for convenient importing.
 * Usage: import { apiClient, authApi, productsApi, usersApi } from '@/api'
 *
 * **Validates: Requirements 2.7**
 */

export * from "./admin/logs";
export * from "./admin/products";
export * from "./admin/settings/categories";
export * from "./admin/settings/productPrices";
export * from "./admin/settings/units";
export * from "./admin/settings/users";
export * from "./auth";
export * from "./cart";
export * from "./client";
export * from "./notifications";
export * from "./public/categories";
export * from "./public/products";
