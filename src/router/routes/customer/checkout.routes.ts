import type { RouteRecordRaw } from "vue-router";

// T-07: ลบ route /checkout/success ที่ชี้ไป CheckoutSuccessView (dead code)
export const checkoutRoutes: RouteRecordRaw[] = [
  {
    path: "/checkout",
    component: () => import("@/views/customer/checkout/CheckoutView.vue"),
    meta: { requiresAuth: true },
  },
];
