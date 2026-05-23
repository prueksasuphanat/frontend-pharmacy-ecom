import { apiClient } from "@/api/client";
import type {
  DashboardSummary,
  SalesChartData,
  TopProduct,
  RecentOrder,
  TopViewedProduct,
  ActiveCart,
  SessionStats,
} from "@/types";

export const adminDashboardApi = {
  getSummary: () =>
    apiClient.get<{ success: boolean; data: DashboardSummary }>(
      "/admin/dashboard/summary",
    ),

  getSalesChart: () =>
    apiClient.get<{ success: boolean; data: SalesChartData }>(
      "/admin/dashboard/sales-chart",
    ),

  getTopProducts: () =>
    apiClient.get<{ success: boolean; data: TopProduct[] }>(
      "/admin/dashboard/top-products",
    ),

  getRecentOrders: () =>
    apiClient.get<{ success: boolean; data: RecentOrder[] }>(
      "/admin/dashboard/recent-orders",
    ),

  getTopViewedProducts: () =>
    apiClient.get<{ success: boolean; data: TopViewedProduct[] }>(
      "/admin/dashboard/top-viewed-products",
    ),

  getActiveCarts: () =>
    apiClient.get<{ success: boolean; data: ActiveCart[] }>(
      "/admin/dashboard/active-carts",
    ),

  getSessionStats: () =>
    apiClient.get<{ success: boolean; data: SessionStats }>(
      "/admin/dashboard/session-stats",
    ),
};
