import type { RouteRecordRaw } from "vue-router";

export const settingsRoutes: RouteRecordRaw[] = [
  {
    path: "settings",
    component: () =>
      import("@/views/admin/settings/AdminSettingsIndexView.vue"),
  },

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
    path: "settings/units",
    component: () => import("@/views/admin/settings/units/AdminUnitView.vue"),
  },
  {
    path: "settings/product-price",
    component: () =>
      import("@/views/admin/settings/product-price/AdminProductPriceView.vue"),
  },
];
