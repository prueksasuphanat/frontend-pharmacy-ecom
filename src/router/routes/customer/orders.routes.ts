import type { RouteRecordRaw } from "vue-router";

export const orderRoutes: RouteRecordRaw[] = [
  {
    path: "/orders",
    redirect: "/profile/orders",
  },
  {
    path: "/orders/:id/success",
    component: () => import("@/views/customer/orders/OrderSuccessView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/orders/:id",
    redirect: (to) => `/profile/orders/${to.params.id}`,
  },
];
