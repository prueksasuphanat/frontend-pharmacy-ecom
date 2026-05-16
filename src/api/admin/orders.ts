import { apiClient } from "@/api/client";

export interface AdminOrder {
  id: number;
  user_id: number;
  status: string;
  shipping_address: {
    recipient: string;
    phone: string;
    address: string;
    district?: string;
    province: string;
    postal_code: string;
  };
  shipping_fee: number;
  subtotal: number;
  total_amount: number;
  note: string | null;
  cancelled_reason: string | null;
  created_at: string;
  updated_at: string;
  items: AdminOrderItem[];
  status_logs: AdminStatusLog[];
  user: {
    id: number;
    username: string | null;
    email: string | null;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
  };
}

export interface AdminOrderItem {
  id: number;
  product_unit_id: number;
  product_name: string;
  unit_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  is_special_price: boolean;
}

export interface AdminStatusLog {
  id: number;
  from_status: string | null;
  to_status: string;
  changed_by: number | null;
  note: string | null;
  created_at: string;
}

export const adminOrdersApi = {
  getAll: (params: { page?: number; limit?: number; status?: string; search?: string } = {}) =>
    apiClient.get<{
      success: boolean;
      data: AdminOrder[];
      pagination: { total: number; page: number; limit: number; totalPages: number };
    }>("/admin/orders", { params }),

  getById: (id: number) =>
    apiClient.get<{ success: boolean; data: AdminOrder }>(`/admin/orders/${id}`),

  updateStatus: (id: number, status: string, note?: string) =>
    apiClient.patch<{ success: boolean; message: string; data: AdminOrder }>(
      `/admin/orders/${id}/status`,
      { status, note },
    ),
};
