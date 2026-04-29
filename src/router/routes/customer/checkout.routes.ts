import type { RouteRecordRaw } from "vue-router";

export const checkoutRoutes: RouteRecordRaw[] = [
  {
    path: "/checkout",
    component: () => import("@/views/customer/checkout/CheckoutView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/checkout/success",
    component: () =>
      import("@/views/customer/checkout/CheckoutSuccessView.vue"),
    meta: { requiresAuth: true },
  },
];
