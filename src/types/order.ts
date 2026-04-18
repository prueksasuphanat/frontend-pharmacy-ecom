// ============================================================
// TYPE DEFINITIONS — order.ts
// Order-related type definitions extracted from mock data
// ============================================================

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "completed"
  | "cancelled";
export type PrescriptionStatus =
  | "not_required"
  | "pending"
  | "approved"
  | "rejected";

export interface Address {
  recipient: string;
  phone: string;
  address: string;
  district: string;
  province: string;
  postal_code: string;
}

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  sku: string;
  quantity: number;
  unit_price: number;
  role_id: string;
}

export interface OrderStatusLog {
  from: string;
  to: string;
  changed_at: string;
  note: string;
}

export interface Order {
  id: string;
  user_id: string;
  user_email: string;
  status: OrderStatus;
  prescription_status: PrescriptionStatus;
  shipping_address: Address;
  shipping_fee: number;
  total_amount: number;
  note: string;
  cancelled_reason: string;
  items: OrderItem[];
  status_logs: OrderStatusLog[];
  created_at: string;
  updated_at: string;
}
