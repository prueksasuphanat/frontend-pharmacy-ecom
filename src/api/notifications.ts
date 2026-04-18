/**
 * Notifications API service
 *
 * Provides methods for notification-related API operations.
 * **Validates: Requirements 2.6**
 */

import { apiClient } from "./client";
import type { Notification } from "@/types";
import { API_ENDPOINTS } from "@/constants";

/**
 * Notifications response interface
 */
export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

/**
 * Notifications API service object
 */
export const notificationsApi = {
  /**
   * Get all notifications for current user
   * @returns Promise with notifications data
   */
  getAll: () =>
    apiClient.get<NotificationsResponse>(API_ENDPOINTS.NOTIFICATIONS.BASE),

  /**
   * Get a single notification by ID
   * @param id - Notification ID
   * @returns Promise with notification data
   */
  getById: (id: string) =>
    apiClient.get<Notification>(API_ENDPOINTS.NOTIFICATIONS.BY_ID(id)),

  /**
   * Mark a notification as read
   * @param id - Notification ID
   * @returns Promise with updated notification
   */
  markAsRead: (id: string) =>
    apiClient.patch<Notification>(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id)),

  /**
   * Mark all notifications as read
   * @returns Promise with update confirmation
   */
  markAllAsRead: () =>
    apiClient.post(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ),
};
