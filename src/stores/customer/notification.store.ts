import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { notificationsApi } from "@/api/notifications";
import type { Notification } from "@/types/notification";

export const useNotificationStore = defineStore("notification", () => {
  const notifications = ref<Notification[]>([]);
  const isOpen = ref(false);
  const loading = ref(false);
  let pollInterval: ReturnType<typeof setInterval> | null = null;

  const unreadCount = computed(
    () => notifications.value.filter((n) => !n.is_read).length,
  );
  const latest5 = computed(() => [...notifications.value].slice(0, 5));

  /**
   * ดึง notifications จาก API
   */
  async function fetchNotifications() {
    loading.value = true;
    try {
      const res = await notificationsApi.getAll(1, 30);
      notifications.value = res.data.data;
    } catch {
      // ถ้าเรียก API ไม่ได้ ไม่ต้อง crash
    } finally {
      loading.value = false;
    }
  }

  /**
   * เริ่ม polling ทุก 30 วินาที
   */
  function startPolling() {
    fetchNotifications();
    pollInterval = setInterval(fetchNotifications, 30_000);
  }

  /**
   * หยุด polling
   */
  function stopPolling() {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
  }

  /**
   * Mark single notification as read
   */
  async function markRead(id: number) {
    // Optimistic update
    const n = notifications.value.find((n) => n.id === id);
    if (n) n.is_read = true;

    try {
      await notificationsApi.markAsRead(id);
    } catch {
      // revert on error
      if (n) n.is_read = false;
    }
  }

  /**
   * Mark all notifications as read
   */
  async function markAllRead() {
    // Optimistic update
    const prev = notifications.value.map((n) => ({ id: n.id, was: n.is_read }));
    notifications.value.forEach((n) => (n.is_read = true));

    try {
      await notificationsApi.markAllAsRead();
    } catch {
      // revert on error
      prev.forEach((p) => {
        const n = notifications.value.find((n) => n.id === p.id);
        if (n) n.is_read = p.was;
      });
    }
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
    loading,
    fetchNotifications,
    startPolling,
    stopPolling,
    markRead,
    markAllRead,
    toggle,
    close,
  };
});
