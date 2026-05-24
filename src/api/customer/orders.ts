import { apiClient } from "../client";
import type {
  Order,
  OrderStatus,
  CreateOrderRequest,
} from "@/types";

interface OrderApiResponse {
  success: boolean;
  message?: string;
  data: Order;
}

interface OrderListResponse {
  success: boolean;
  data: Order[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const ordersApi = {
  create: (data: CreateOrderRequest) =>
    apiClient.post<OrderApiResponse>("/customer/orders", data),

  getAll: (params?: { page?: number; limit?: number; status?: OrderStatus }) =>
    apiClient.get<OrderListResponse>("/customer/orders", { params }),

  getById: (id: number) =>
    apiClient.get<OrderApiResponse>(`/customer/orders/${id}`),

  cancel: (id: number, reason?: string) =>
    apiClient.patch<OrderApiResponse>(`/customer/orders/${id}/cancel`, {
      reason,
    }),
};
