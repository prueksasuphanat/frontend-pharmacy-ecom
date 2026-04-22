import type { RouteRecordRaw } from "vue-router";

export const settingsRoutes: RouteRecordRaw[] = [
  // Settings index (for mobile navigation)
  {
    path: "settings",
    component: () =>
      import("@/views/admin/settings/AdminSettingsIndexView.vue"),
  },
  // Settings submenu
  {
    path: "settings/users",
    component: () => import("@/views/admin/settings/users/AdminUsersView.vue"),
  },
  {
    path: "settings/category",
    component: () =>
      import("@/views/admin/settings/categories/AdminCategoryView.vue"),
  },
  {
    path: "settings/product-price",
    component: () =>
      import("@/views/admin/settings/product-price/AdminProductPriceView.vue"),
  },
];
