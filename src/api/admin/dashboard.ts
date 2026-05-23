import { apiClient } from "@/api/client";

export interface DashboardSummary {
  today_sales: number;
  pending_orders: number;
  low_stock_count: number;
  total_orders: number;
}

export interface SalesChartData {
  labels: string[];
  values: number[];
}

export interface TopProduct {
  name: string;
  sold: number;
  revenue: number;
}

export interface RecentOrder {
  id: number;
  status: string;
  total_amount: number;
  created_at: string;
  user: {
    id: number;
    email: string | null;
    first_name: string | null;
    last_name: string | null;
    username: string | null;
  };
}

export interface TopViewedProduct {
  product_id: number;
  product_name: string;
  view_count: number;
}

export interface ActiveCart {
  user_id: number;
  user_name: string;
  item_count: number;
  last_updated: string;
}

export interface SessionStats {
  avg_duration_minutes: number;
  total_sessions: number;
  unique_users: number;
  daily: Array<{ date: string; sessions: number; unique_users: number }>;
}

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
