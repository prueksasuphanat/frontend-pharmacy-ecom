import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { notificationsApi } from "@/api/notifications";
import { useWebSocket } from "@/composables/useWebSocket";
import { getWsUrl } from "@/utils/ws";
import type { Notification } from "@/types/notification";

export const useNotificationStore = defineStore("notification", () => {
  const notifications = ref<Notification[]>([]);
  const isOpen = ref(false);
  const loading = ref(false);

  let wsInstance: ReturnType<typeof useWebSocket> | null = null;

  const unreadCount = computed(
    () => notifications.value.filter((n) => !n.is_read).length,
  );
  const latest5 = computed(() => [...notifications.value].slice(0, 5));

  async function fetchNotifications() {
    loading.value = true;
    try {
      const res = await notificationsApi.getAll(1, 30);
      notifications.value = res.data.data;
    } catch {
    } finally {
      loading.value = false;
    }
  }

  function playNotificationSound() {
    try {
      const audioCtx = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();

      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(830.61, audioCtx.currentTime);
      gain1.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(
        0.001,
        audioCtx.currentTime + 0.6,
      );

      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);

      osc2.type = "sine";
      osc2.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.08);
      gain2.gain.setValueAtTime(0.2, audioCtx.currentTime + 0.08);
      gain2.gain.exponentialRampToValueAtTime(
        0.001,
        audioCtx.currentTime + 0.68,
      );

      osc1.start(audioCtx.currentTime);
      osc1.stop(audioCtx.currentTime + 0.6);

      osc2.start(audioCtx.currentTime + 0.08);
      osc2.stop(audioCtx.currentTime + 0.68);
    } catch (e) {
      console.warn("Failed to play synthesized notification sound", e);
    }
  }

  function startWs(accessToken: string) {
    if (wsInstance) return;

    fetchNotifications();

    const url = getWsUrl("/ws/notifications", accessToken);

    wsInstance = useWebSocket({
      url,
      onMessage: (msg) => {
        if (msg.type === "notification" && msg.data) {
          console.log("[Notification] Received realtime payload:", msg.data);

          playNotificationSound();

          const newNotif = msg.data as Notification;

          if (newNotif.id === null) {
            fetchNotifications();
          } else {
            notifications.value.unshift(newNotif);
          }
        }
      },
      onConnected: () => {
        console.log("[Notification] WS connected ✅");
      },
      onDisconnected: () => {
        console.log("[Notification] WS disconnected");
      },
    });

    wsInstance.connect();
  }

  function stopWs() {
    wsInstance?.disconnect();
    wsInstance = null;
  }

  async function markRead(id: number) {
    const n = notifications.value.find((n) => n.id === id);
    if (n) n.is_read = true;
    try {
      await notificationsApi.markAsRead(id);
    } catch {
      if (n) n.is_read = false;
    }
  }

  async function markAllRead() {
    const prev = notifications.value.map((n) => ({ id: n.id, was: n.is_read }));
    notifications.value.forEach((n) => (n.is_read = true));
    try {
      await notificationsApi.markAllAsRead();
    } catch {
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

  function reset() {
    stopWs();
    notifications.value = [];
    isOpen.value = false;
  }

  return {
    notifications,
    unreadCount,
    latest5,
    isOpen,
    loading,
    fetchNotifications,
    startWs,
    stopWs,
    markRead,
    markAllRead,
    toggle,
    close,
    reset,
  };
});
