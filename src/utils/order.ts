export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "SHIPPED"
  | "COMPLETED"
  | "CANCELLED";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "รอดำเนินการ",
  CONFIRMED: "กำลังจัดเตรียม",
  PREPARING: "กำลังจัดเตรียม",
  SHIPPED: "กำลังจัดส่ง",
  COMPLETED: "เสร็จสิ้น",
  CANCELLED: "ยกเลิกแล้ว",
};

export const ORDER_STATUS_CLASS: Record<OrderStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PREPARING: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export function formatOrderUser(user?: {
  first_name?: string | null;
  last_name?: string | null;
  pmc_name?: string | null;
  username?: string | null;
}) {
  if (!user) return "-";
  return user.first_name && user.last_name
    ? `${user.first_name} ${user.last_name}`
    : user.pmc_name || user.username || "-";
}
