import { apiClient } from "../client";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPED"
  | "COMPLETED"
  | "CANCELLED";

export interface OrderShippingAddress {
  recipient: string;
  phone: string;
  address: string;
  district?: string;
  province: string;
  postal_code: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_unit_id: number;
  product_name: string;
  unit_name: string;
  quantity: number;
  unit_price: number;
  is_special_price: boolean;
  subtotal: number;
}

export interface OrderStatusLog {
  id: number;
  order_id: number;
  from_status: OrderStatus | null;
  to_status: OrderStatus;
  changed_by: number | null;
  note: string | null;
  created_at: string;
}

export interface Order {
  id: number;
  user_id: number;
  status: OrderStatus;
  shipping_address: OrderShippingAddress;
  shipping_fee: number;
  subtotal: number;
  total_amount: number;
  note: string | null;
  cancelled_reason: string | null;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  status_logs: OrderStatusLog[];
}

export interface CreateOrderRequest {
  shipping_address: OrderShippingAddress;
  note?: string;
}

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
