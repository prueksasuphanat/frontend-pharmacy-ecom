import type { RouteRecordRaw } from "vue-router";

export const profileRoutes: RouteRecordRaw[] = [
  {
    path: "/profile",
    component: () => import("@/layouts/ProfileLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        component: () => import("@/views/customer/profile/ProfileView.vue"),
      },
      {
        path: "information",
        component: () =>
          import("@/views/customer/profile/information/InformationView.vue"),
      },
      {
        path: "orders",
        component: () =>
          import("@/views/customer/profile/orders/OrderListView.vue"),
      },
      {
        path: "orders/:id",
        component: () =>
          import("@/views/customer/profile/orders/OrderDetailView.vue"),
      },
      {
        path: "address",
        component: () =>
          import("@/views/customer/profile/address/AddressBookView.vue"),
      },
      {
        path: "security",
        component: () =>
          import("@/views/customer/profile/security/SecurityView.vue"),
      },
      {
        path: "wishlist",
        component: () =>
          import("@/views/customer/profile/wishlist/WishlistView.vue"),
      },
    ],
  },
];
