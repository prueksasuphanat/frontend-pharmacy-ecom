/**
 * Notifications API service
 *
 * Provides methods for notification-related API operations.
 */

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

/**
 * Notifications API service object
 */
export const notificationsApi = {
  /**
   * Get all notifications for current user (paginated)
   */
  getAll: (page = 1, limit = 20) =>
    apiClient.get<NotificationsResponse>(`/notifications`, {
      params: { page, limit },
    }),

  /**
   * Get unread notification count
   */
  getUnreadCount: () =>
    apiClient.get<UnreadCountResponse>("/notifications/unread-count"),

  /**
   * Mark a notification as read
   */
  markAsRead: (id: number) =>
    apiClient.patch(`/notifications/${id}/read`),

  /**
   * Mark all notifications as read
   */
  markAllAsRead: () =>
    apiClient.patch("/notifications/read-all"),
};
