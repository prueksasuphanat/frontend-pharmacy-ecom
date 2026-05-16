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
  {
    path: "/orders/:id",
    component: () => import("@/views/customer/orders/OrderSuccessView.vue"),
    meta: { requiresAuth: true },
  },
];
