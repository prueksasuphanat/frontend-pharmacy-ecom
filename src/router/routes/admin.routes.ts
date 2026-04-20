import type { RouteRecordRaw } from "vue-router";

export const adminRoutes: RouteRecordRaw = {
  path: "/admin",
  component: () => import("@/layouts/AdminLayout.vue"),
  meta: { requiresAuth: true, requiresAdmin: true },
  children: [
    { path: "", redirect: "/admin/dashboard" },
    {
      path: "dashboard",
      component: () => import("@/views/admin/AdminDashboardView.vue"),
    },
    {
      path: "orders",
      component: () => import("@/views/admin/AdminOrderListView.vue"),
    },
    {
      path: "orders/:id",
      component: () => import("@/views/admin/AdminOrderDetailView.vue"),
    },
    {
      path: "products",
      component: () => import("@/views/admin/AdminInventoryView.vue"),
    },
    {
      path: "logs",
      component: () => import("@/views/admin/AdminLogView.vue"),
    },
    // Settings index (for mobile navigation)
    {
      path: "settings",
      component: () =>
        import("@/views/admin/settings/AdminSettingsIndexView.vue"),
    },
    // Settings submenu
    {
      path: "settings/users",
      component: () =>
        import("@/views/admin/settings/users/AdminUsersView.vue"),
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
  ],
};
