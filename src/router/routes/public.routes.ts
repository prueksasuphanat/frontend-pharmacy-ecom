import type { RouteRecordRaw } from "vue-router";

export const publicRoutes: RouteRecordRaw[] = [
  { path: "/", redirect: "/products" },
  {
    path: "/login",
    component: () => import("@/views/public/LoginView.vue"),
    meta: { guestOnly: true },
  },
  {
    path: "/register",
    component: () => import("@/views/public/RegisterView.vue"),
    meta: { guestOnly: true },
  },
  {
    path: "/verify-email",
    component: () => import("@/views/public/VerifyEmailView.vue"),
  },
  {
    path: "/forgot-password",
    component: () => import("@/views/public/ForgotPasswordView.vue"),
    meta: { guestOnly: true },
  },
  {
    path: "/reset-password",
    component: () => import("@/views/public/ResetPasswordView.vue"),
  },
  {
    path: "/products",
    component: () => import("@/views/public/ProductListView.vue"),
  },
];
