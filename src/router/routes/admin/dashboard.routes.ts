import type { RouteRecordRaw } from "vue-router";

export const dashboardRoutes: RouteRecordRaw[] = [
  { path: "", redirect: "/admin/dashboard" },
  {
    path: "dashboard",
    component: () => import("@/views/admin/AdminDashboardView.vue"),
  },
];
