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
    component: () => import("@/views/public/register/RegisterView.vue"),
    meta: { guestOnly: true },
  },
  {
    path: "/register/complete",
    component: () => import("@/views/public/register/RegisterComplete.vue"),
    meta: { guestOnly: true },
    beforeEnter: (_to, _from) => {
      if (!window.history.state?.fromRegister) {
        return { path: "/" };
      }
    },
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
