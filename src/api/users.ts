/**
 * Users API
 *
 * Handles user management API calls (Admin only)
 */

import { apiClient } from "./client";
import { API_ENDPOINTS } from "@/constants";

/**
 * User interface matching backend response
 */
export interface User {
  id: number | string;
  code: string;
  pmc_customer_id?: number | null;
  pmc_name?: string | null;
  title?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  username: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  birthdate?: string | null;
  sex?: "MALE" | "FEMALE" | "OTHER" | null;
  role: "ADMIN" | "PHARMACIST" | "CUSTOMER";
  is_verified: boolean;
  is_active: boolean;
  is_delete: boolean;
  created_at: string;
  updated_at: string;
  created_by?: number | null;
  updated_by?: number | null;
}

/**
 * Query parameters for getAll
 */
export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: "ADMIN" | "PHARMACIST" | "CUSTOMER";
  is_verified?: boolean;
  is_active?: boolean;
  is_delete?: boolean;
}

/**
 * Pagination metadata
 */
export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: Pagination;
}

/**
 * Payload for updating a user (Admin)
 */
export interface AdminUpdateUserPayload {
  code?: string;
  email?: string;
  title?: string | null;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

/**
 * Users API service
 */
export const usersApi = {
  /**
   * Get all users with filter, search, pagination (Admin only)
   */
  getAll: (params?: GetUsersParams) =>
    apiClient.get<ApiResponse<User[]>>(
      API_ENDPOINTS.ADMIN.SETTINGS.USERS.BASE,
      { params },
    ),

  /**
   * Get user by ID
   * GET /admin/users/:id
   */
  getById: (id: number | string) =>
    apiClient.get<ApiResponse<User>>(
      API_ENDPOINTS.ADMIN.SETTINGS.USERS.BY_ID(String(id)),
    ),

  /**
   * Get user by ID (Admin only)
   * GET /admin/users/:id
   */
  adminGetById: (id: number | string) =>
    apiClient.get<ApiResponse<User>>(
      API_ENDPOINTS.ADMIN.SETTINGS.USERS.BY_ID(String(id)),
    ),

  /**
   * Update user by ID (Admin only)
   * PUT /admin/users/:id
   */
  adminUpdateById: (id: number | string, payload: AdminUpdateUserPayload) =>
    apiClient.put<ApiResponse<User>>(
      API_ENDPOINTS.ADMIN.SETTINGS.USERS.UPDATE(String(id)),
      payload,
    ),

  toggleActive: (id: number | string) =>
    apiClient.put<ApiResponse<User>>(
      API_ENDPOINTS.ADMIN.SETTINGS.USERS.TOGGLEACTVIVE(String(id)),
    ),

  changeRole: (id: number | string, role: string) =>
    apiClient.put<ApiResponse<User>>(
      API_ENDPOINTS.ADMIN.SETTINGS.USERS.CHANGEROLE(String(id)),
      { role },
    ),
};
