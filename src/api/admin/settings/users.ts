import { apiClient } from "../../client";
import { API_ENDPOINTS } from "@/constants";
import type { User, Pagination, ApiResponse, PaginatedApiResponse } from "@/types";

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: "ADMIN" | "DEMO" | "PHARMACIST" | "CUSTOMER";
  is_verified?: boolean;
  is_active?: boolean;
  is_delete?: boolean;
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
    apiClient.get<PaginatedApiResponse<User[]>>(
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
