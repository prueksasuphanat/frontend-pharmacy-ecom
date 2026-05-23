import type { RouteRecordRaw } from "vue-router";

export const logsRoutes: RouteRecordRaw[] = [
  {
    path: "logs",
    component: () => import("@/views/admin/admin-logs/AdminLogIndexView.vue"),
  },
  {
    path: "logs/set-up-pricing",
    component: () =>
      import("@/views/admin/admin-logs/AdminLogSetPricingView.vue"),
  },
  {
    path: "logs/user",
    component: () => import("@/views/admin/admin-logs/AdminLogView.vue"),
  },
  {
    path: "logs/order",
    component: () => import("@/views/admin/admin-logs/AdminLogView.vue"),
  },
];
