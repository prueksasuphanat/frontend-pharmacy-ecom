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
