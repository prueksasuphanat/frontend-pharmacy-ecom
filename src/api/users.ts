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
  id: number;
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
 * Users API service
 */
export const usersApi = {
  /**
   * Get all users with filter, search, pagination (Admin only)
   */
  getAll: (params?: GetUsersParams) =>
    apiClient.get<ApiResponse<User[]>>(
      API_ENDPOINTS.ADMIN.SETTINGS.USERS.BASE,
      {
        params,
      },
    ),
};
