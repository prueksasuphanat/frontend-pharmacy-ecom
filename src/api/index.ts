/**
 * Barrel export for API service layer
 *
 * Re-exports all API modules for convenient importing.
 * Usage: import { apiClient, authApi, productsApi } from '@/api'
 *
 * **Validates: Requirements 2.7**
 */

export * from "./client";
export * from "./auth";
export * from "./products";
export * from "./cart";
export * from "./notifications";
