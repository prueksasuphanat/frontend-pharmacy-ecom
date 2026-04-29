import type { RouteRecordRaw } from "vue-router";

export const profileRoutes: RouteRecordRaw[] = [
  {
    path: "/profile",
    redirect: "/profile/information",
  },
  {
    path: "/profile/information",
    component: () =>
      import("@/views/customer/profile/information/ProfileView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/profile/orders",
    component: () =>
      import("@/views/customer/profile/orders/OrderListView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/profile/orders/:id",
    component: () =>
      import("@/views/customer/profile/orders/OrderDetailView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/profile/address",
    component: () =>
      import("@/views/customer/profile/address/AddressBookView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/profile/security",
    component: () =>
      import("@/views/customer/profile/security/SecurityView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/profile/wishlist",
    component: () =>
      import("@/views/customer/profile/wishlist/WishlistView.vue"),
    meta: { requiresAuth: true },
  },
];
