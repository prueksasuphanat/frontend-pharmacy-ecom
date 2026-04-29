/**
 * Notifications composable
 *
 * Wraps the notification store to provide a clean API for notification operations.
 * **Validates: Requirements 3.4**
 */

import { useNotificationStore } from "@/stores/customer/notification.store";
import { computed } from "vue";

/**
 * Notifications composable
 * Provides reactive notification state and methods
 */
export function useNotifications() {
  const notificationStore = useNotificationStore();

  // Reactive state
  const notifications = computed(() => notificationStore.notifications);
  const unreadCount = computed(() => notificationStore.unreadCount);
  const latest5 = computed(() => notificationStore.latest5);
  const isOpen = computed(() => notificationStore.isOpen);

  /**
   * Load notifications (mock implementation)
   * TODO: Replace with API call
   */
  function loadNotifications(): void {
    notificationStore.loadMockNotifications();
  }

  /**
   * Start polling for new notifications
   */
  function startPolling(): void {
    notificationStore.startPolling();
  }

  /**
   * Stop polling for notifications
   */
  function stopPolling(): void {
    notificationStore.stopPolling();
  }

  /**
   * Mark a notification as read
   * @param id - Notification ID
   */
  function markAsRead(id: string): void {
    notificationStore.markRead(id);
  }

  /**
   * Mark all notifications as read
   */
  function markAllAsRead(): void {
    notificationStore.markAllRead();
  }

  /**
   * Toggle notification panel open/closed
   */
  function toggle(): void {
    notificationStore.toggle();
  }

  /**
   * Close notification panel
   */
  function close(): void {
    notificationStore.close();
  }

  return {
    // State
    notifications,
    unreadCount,
    latest5,
    isOpen,

    // Methods
    loadNotifications,
    startPolling,
    stopPolling,
    markAsRead,
    markAllAsRead,
    toggle,
    close,
  };
}
