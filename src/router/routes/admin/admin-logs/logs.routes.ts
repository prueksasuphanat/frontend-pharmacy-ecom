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
    path: "logs/user-sessions",
    component: () =>
      import("@/views/admin/admin-logs/AdminLogUserSessionView.vue"),
  },
  {
    path: "logs/product-views",
    component: () =>
      import("@/views/admin/admin-logs/AdminLogProductView.vue"),
  },
];
