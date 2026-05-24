import type { RouteRecordRaw } from "vue-router";

export const checkoutRoutes: RouteRecordRaw[] = [
  {
    path: "/checkout",
    component: () => import("@/views/customer/checkout/CheckoutView.vue"),
    meta: { requiresAuth: true },
  },
];
