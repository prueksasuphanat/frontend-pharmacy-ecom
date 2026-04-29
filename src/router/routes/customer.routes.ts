import type { RouteRecordRaw } from "vue-router";

export const customerRoutes: RouteRecordRaw[] = [
  {
    path: "/products/:id",
    component: () => import("@/views/customer/ProductDetailView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/cart",
    component: () => import("@/views/customer/CartView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/checkout",
    component: () => import("@/views/customer/CheckoutView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/checkout/success",
    component: () => import("@/views/customer/CheckoutSuccessView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/profile/orders",
    component: () => import("@/views/customer/OrderListView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/profile/orders/:id",
    component: () => import("@/views/customer/OrderDetailView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/profile",
    redirect: "/profile/information",
  },
  {
    path: "/profile/information",
    component: () => import("@/views/customer/ProfileView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/profile/address",
    component: () => import("@/views/customer/AddressBookView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/profile/security",
    component: () => import("@/views/customer/SecurityView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/profile/wishlist",
    component: () => import("@/views/customer/WishlistView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/notifications",
    component: () => import("@/views/customer/NotificationView.vue"),
    meta: { requiresAuth: true },
  },
];
