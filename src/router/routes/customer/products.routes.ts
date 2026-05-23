import type { RouteRecordRaw } from "vue-router";

export const productsRoutes: RouteRecordRaw[] = [
  {
    path: "/products/:id",
    component: () => import("@/views/customer/products/ProductDetailView.vue"),
    meta: { requiresAuth: true },
  },
];
