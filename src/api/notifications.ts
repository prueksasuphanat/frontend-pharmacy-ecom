import { apiClient } from "./client";
import type { Notification } from "@/types/notification";

export interface NotificationsResponse {
  success: boolean;
  data: Notification[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UnreadCountResponse {
  success: boolean;
  data: { unread_count: number };
}

export const notificationsApi = {
  getAll: (page = 1, limit = 20) =>
    apiClient.get<NotificationsResponse>(`/notifications`, {
      params: { page, limit },
    }),

  getUnreadCount: () =>
    apiClient.get<UnreadCountResponse>("/notifications/unread-count"),

  markAsRead: (id: number) => apiClient.patch(`/notifications/${id}/read`),

  markAllAsRead: () => apiClient.patch("/notifications/read-all"),
};
