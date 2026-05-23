import type { RouteRecordRaw } from "vue-router";

export const productsRoutes: RouteRecordRaw[] = [
  {
    path: "products",
    component: () => import("@/views/admin/AdminInventoryView.vue"),
  },
];
