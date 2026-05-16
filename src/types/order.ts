// ============================================================
// TYPE DEFINITIONS — order.ts
// T-07: re-export จาก api/customer/orders แทน type เก่าที่ล้าสมัย
// (เดิมใช้ lowercase status, role_id, PrescriptionStatus ซึ่งไม่ตรงกับ API จริง)
// ============================================================

export type {
  Order,
  OrderItem,
  OrderStatusLog,
  OrderStatus,
  OrderShippingAddress,
  CreateOrderRequest,
} from "@/api/customer/orders";
