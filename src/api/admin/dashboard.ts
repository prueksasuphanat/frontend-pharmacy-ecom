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

export const adminDashboardApi = {
  getSummary: () =>
    apiClient.get<{ success: boolean; data: DashboardSummary }>("/admin/dashboard/summary"),

  getSalesChart: () =>
    apiClient.get<{ success: boolean; data: SalesChartData }>("/admin/dashboard/sales-chart"),

  getTopProducts: () =>
    apiClient.get<{ success: boolean; data: TopProduct[] }>("/admin/dashboard/top-products"),

  getRecentOrders: () =>
    apiClient.get<{ success: boolean; data: RecentOrder[] }>("/admin/dashboard/recent-orders"),
};
