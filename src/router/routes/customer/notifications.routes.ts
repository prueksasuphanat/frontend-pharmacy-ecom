import type { RouteRecordRaw } from "vue-router";

export const notificationsRoutes: RouteRecordRaw[] = [
  {
    path: "/notifications",
    component: () =>
      import("@/views/customer/notifications/NotificationView.vue"),
    meta: { requiresAuth: true },
  },
];
