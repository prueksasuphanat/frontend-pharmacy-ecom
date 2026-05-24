import { useNotificationStore } from "@/stores/customer/notification.store";
import { computed } from "vue";

export function useNotifications() {
  const notificationStore = useNotificationStore();

  const notifications = computed(() => notificationStore.notifications);
  const unreadCount = computed(() => notificationStore.unreadCount);
  const latest5 = computed(() => notificationStore.latest5);
  const isOpen = computed(() => notificationStore.isOpen);

  function loadNotifications(): void {
    notificationStore.fetchNotifications();
  }

  function startPolling(): void {
    // WebSockets are used instead of polling
  }

  function stopPolling(): void {
    // WebSockets are used instead of polling
  }

  function markAsRead(id: number): void {
    notificationStore.markRead(id);
  }

  function markAllAsRead(): void {
    notificationStore.markAllRead();
  }

  function toggle(): void {
    notificationStore.toggle();
  }

  function close(): void {
    notificationStore.close();
  }

  return {
    notifications,
    unreadCount,
    latest5,
    isOpen,

    loadNotifications,
    startPolling,
    stopPolling,
    markAsRead,
    markAllAsRead,
    toggle,
    close,
  };
}
