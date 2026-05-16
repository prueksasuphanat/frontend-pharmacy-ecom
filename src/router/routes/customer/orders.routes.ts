import type { RouteRecordRaw } from "vue-router";

export const orderRoutes: RouteRecordRaw[] = [
  {
    path: "/orders",
    component: () => import("@/views/customer/orders/OrderListView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/orders/:id/success",
    component: () => import("@/views/customer/orders/OrderSuccessView.vue"),
    meta: { requiresAuth: true },
  },
  // T-04: แก้ route /orders/:id ให้ชี้ไป OrderDetailView ที่ถูกต้อง
  // (เดิมชี้ไป OrderSuccessView ซึ่งผิด)
  {
    path: "/orders/:id",
    component: () =>
      import("@/views/customer/profile/orders/OrderDetailView.vue"),
    meta: { requiresAuth: true },
  },
];
