import type { RouteRecordRaw } from "vue-router";

export const errorRoutes: RouteRecordRaw[] = [
  {
    path: "/403",
    component: () => import("@/views/errors/ForbiddenView.vue"),
  },
  {
    path: "/:pathMatch(.*)*",
    component: () => import("@/views/errors/NotFoundView.vue"),
  },
];
