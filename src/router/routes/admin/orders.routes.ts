import type { RouteRecordRaw } from "vue-router";

export const ordersRoutes: RouteRecordRaw[] = [
  {
    path: "orders",
    component: () => import("@/views/admin/AdminOrderListView.vue"),
  },
  {
    path: "orders/:id",
    component: () => import("@/views/admin/AdminOrderDetailView.vue"),
  },
];
