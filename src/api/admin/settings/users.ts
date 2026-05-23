import { apiClient } from "../../client";
import { API_ENDPOINTS } from "@/constants";

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
  role: "ADMIN" | "DEMO" | "PHARMACIST" | "CUSTOMER";
  is_verified: boolean;
  is_active: boolean;
  is_delete: boolean;
  created_at: string;
  updated_at: string;
  created_by?: number | null;
  updated_by?: number | null;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: "ADMIN" | "DEMO" | "PHARMACIST" | "CUSTOMER";
  is_verified?: boolean;
  is_active?: boolean;
  is_delete?: boolean;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: Pagination;
}

export interface AdminUpdateUserPayload {
  code?: string;
  email?: string;
  title?: string | null;
  first_name?: string;
  last_name?: string;
  phone?: string;
  expired_date?: string | null;
}

export const usersApi = {
  getAll: (params?: GetUsersParams) =>
    apiClient.get<ApiResponse<User[]>>(
      API_ENDPOINTS.ADMIN.SETTINGS.USERS.BASE,
      { params },
    ),

  getUserFullName: () =>
    apiClient.get<ApiResponse<User[]>>(
      API_ENDPOINTS.ADMIN.SETTINGS.USERS.FULLNAME,
    ),

  getById: (id: number | string) =>
    apiClient.get<ApiResponse<User>>(
      API_ENDPOINTS.ADMIN.SETTINGS.USERS.BY_ID(String(id)),
    ),

  adminGetById: (id: number | string) =>
    apiClient.get<ApiResponse<User>>(
      API_ENDPOINTS.ADMIN.SETTINGS.USERS.BY_ID(String(id)),
    ),

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

  verified: (id: number | string) =>
    apiClient.put<ApiResponse<User>>(
      API_ENDPOINTS.ADMIN.SETTINGS.USERS.VERIFIRED(String(id)),
    ),
};
