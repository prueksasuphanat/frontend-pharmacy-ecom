import { apiClient } from "@/api/client";
import type { AdminOrder } from "@/types";

export const adminOrdersApi = {
  getAll: (
    params: {
      page?: number;
      limit?: number;
      status?: string;
      search?: string;
    } = {},
  ) =>
    apiClient.get<{
      success: boolean;
      data: AdminOrder[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>("/admin/orders", { params }),

  getById: (id: number) =>
    apiClient.get<{ success: boolean; data: AdminOrder }>(
      `/admin/orders/${id}`,
    ),

  updateStatus: (id: number, status: string, note?: string) =>
    apiClient.patch<{ success: boolean; message: string; data: AdminOrder }>(
      `/admin/orders/${id}/status`,
      { status, note },
    ),
};
