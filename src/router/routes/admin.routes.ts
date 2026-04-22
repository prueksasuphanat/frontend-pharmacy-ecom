import type { RouteRecordRaw } from "vue-router";

// Import route modules
import { dashboardRoutes } from "./admin/dashboard.routes";
import { ordersRoutes } from "./admin/orders.routes";
import { productsRoutes } from "./admin/products.routes";
import { logsRoutes } from "./admin/admin-logs/logs.routes";
import { settingsRoutes } from "./admin/settings/settings.routes";

export const adminRoutes: RouteRecordRaw = {
  path: "/admin",
  component: () => import("@/layouts/AdminLayout.vue"),
  meta: { requiresAuth: true, requiresAdmin: true },
  children: [
    ...dashboardRoutes,
    ...ordersRoutes,
    ...productsRoutes,
    ...logsRoutes,
    ...settingsRoutes,
  ],
};
