import type { Notification } from "@/__mocks__/users";
import {
  MOCK_ADMIN_NOTIFICATIONS,
  MOCK_NOTIFICATIONS,
} from "@/__mocks__/users";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useAuthStore } from "../auth.store";

// TODO: replace polling with real GET /notifications/unread-count every 30s
// TODO: replace with real PATCH /notifications/:id/read

export const useNotificationStore = defineStore("notification", () => {
  const auth = useAuthStore();

  const notifications = ref<Notification[]>([]);
  const isOpen = ref(false);
  let pollInterval: ReturnType<typeof setInterval> | null = null;

  const unreadCount = computed(
    () => notifications.value.filter((n) => !n.is_read).length,
  );
  const latest5 = computed(() => [...notifications.value].slice(0, 5));

  function loadMockNotifications() {
    // TODO: replace with GET /notifications
    notifications.value = auth.isAdmin
      ? [...MOCK_ADMIN_NOTIFICATIONS]
      : [...MOCK_NOTIFICATIONS];
  }

  function startPolling() {
    loadMockNotifications();
    // TODO: replace with real polling to GET /notifications/unread-count
    pollInterval = setInterval(loadMockNotifications, 30_000);
  }

  function stopPolling() {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
  }

  // TODO: connect to PATCH /notifications/:id/read
  function markRead(id: string) {
    const n = notifications.value.find((n) => n.id === id);
    if (n) n.is_read = true;
  }

  // TODO: connect to PATCH /notifications/read-all
  function markAllRead() {
    notifications.value.forEach((n) => (n.is_read = true));
  }

  function toggle() {
    isOpen.value = !isOpen.value;
  }
  function close() {
    isOpen.value = false;
  }

  return {
    notifications,
    unreadCount,
    latest5,
    isOpen,
    loadMockNotifications,
    startPolling,
    stopPolling,
    markRead,
    markAllRead,
    toggle,
    close,
  };
});
